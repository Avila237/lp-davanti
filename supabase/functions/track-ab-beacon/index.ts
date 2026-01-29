import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// Allowed origins for CORS
const ALLOWED_ORIGINS = [
  "https://lp-davanti.lovable.app",
  "https://id-preview--7fdbe2f4-3c98-4106-97b3-5b209e6d9bae.lovable.app",
  "http://localhost:5173",
  "http://localhost:8080",
];

function getCorsHeaders(origin: string | null): Record<string, string> {
  const allowedOrigin = origin && ALLOWED_ORIGINS.some(o => origin.startsWith(o.replace(/\/$/, ''))) 
    ? origin 
    : ALLOWED_ORIGINS[0];
  
  return {
    "Access-Control-Allow-Origin": allowedOrigin,
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
  };
}

// Simple in-memory rate limiting
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT_WINDOW = 60000; // 1 minute
const RATE_LIMIT_MAX = 20; // Max 20 beacon events per minute per IP

function getClientIP(req: Request): string {
  return req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || 
         req.headers.get("x-real-ip") || 
         "unknown";
}

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const record = rateLimitMap.get(ip);
  
  if (!record || now > record.resetTime) {
    rateLimitMap.set(ip, { count: 1, resetTime: now + RATE_LIMIT_WINDOW });
    return true;
  }
  
  if (record.count >= RATE_LIMIT_MAX) {
    return false;
  }
  
  record.count++;
  return true;
}

serve(async (req) => {
  const origin = req.headers.get("origin");
  const corsHeaders = getCorsHeaders(origin);
  
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  // Only allow POST (Beacon API uses POST)
  if (req.method !== "POST") {
    return new Response(
      JSON.stringify({ error: "Method not allowed" }),
      { status: 405, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  // Verify origin
  if (origin && !ALLOWED_ORIGINS.some(o => origin.startsWith(o.replace(/\/$/, '')))) {
    return new Response(
      JSON.stringify({ error: "Forbidden" }),
      { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  try {
    const clientIP = getClientIP(req);
    
    // Rate limiting check
    if (!checkRateLimit(clientIP)) {
      return new Response(
        JSON.stringify({ error: "Too many requests" }),
        { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Parse body - Beacon API sends as text/plain or application/json
    let body: { event_type?: string; variant?: string; section?: string };
    const contentType = req.headers.get("content-type") || "";
    
    if (contentType.includes("application/json") || contentType.includes("text/plain")) {
      const text = await req.text();
      try {
        body = JSON.parse(text);
      } catch {
        return new Response(
          JSON.stringify({ error: "Invalid JSON" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    } else {
      return new Response(
        JSON.stringify({ error: "Unsupported content type" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { event_type, variant, section } = body;

    // Validate required fields
    if (!event_type || !variant) {
      return new Response(
        JSON.stringify({ error: "Missing required fields" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Validate allowed values
    if (!["whatsapp_click", "form_submit"].includes(event_type)) {
      return new Response(
        JSON.stringify({ error: "Invalid event type" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!["whatsapp", "form"].includes(variant)) {
      return new Response(
        JSON.stringify({ error: "Invalid variant" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Validate section if provided (max 50 chars, alphanumeric + underscore + hyphen)
    if (section && (typeof section !== "string" || section.length > 50 || !/^[a-zA-Z0-9_-]+$/.test(section))) {
      return new Response(
        JSON.stringify({ error: "Invalid section format" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Create client with service role to bypass RLS
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Insert event
    const { error } = await supabase
      .from("ab_events")
      .insert({
        event_type,
        variant,
        section: section || null,
      });

    if (error) {
      console.error("[track-ab-beacon] Insert failed:", error.message);
      return new Response(
        JSON.stringify({ error: "Failed to record event" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Beacon API doesn't care about response, but we return success anyway
    return new Response(
      JSON.stringify({ success: true }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("[track-ab-beacon] Request failed:", error);
    return new Response(
      JSON.stringify({ error: "Internal error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
