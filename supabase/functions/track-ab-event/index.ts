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

// Simple in-memory rate limiting (resets on function cold start)
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT_WINDOW = 60000; // 1 minute
const RATE_LIMIT_MAX = 10; // Max 10 events per minute per IP

// Event deduplication (prevent replay attacks)
const recentEvents = new Map<string, number>();
const DEDUP_WINDOW = 300000; // 5 minutes

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

// HMAC-SHA256 signature verification
async function verifySignature(payload: string, signature: string, secret: string): Promise<boolean> {
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  
  const signatureBuffer = await crypto.subtle.sign("HMAC", key, encoder.encode(payload));
  const expectedSignature = Array.from(new Uint8Array(signatureBuffer))
    .map(b => b.toString(16).padStart(2, "0"))
    .join("");
  
  // Constant-time comparison to prevent timing attacks
  if (signature.length !== expectedSignature.length) return false;
  let result = 0;
  for (let i = 0; i < signature.length; i++) {
    result |= signature.charCodeAt(i) ^ expectedSignature.charCodeAt(i);
  }
  return result === 0;
}

function checkDeduplication(fingerprint: string): boolean {
  const now = Date.now();
  
  // Clean old entries
  for (const [key, timestamp] of recentEvents.entries()) {
    if (now - timestamp > DEDUP_WINDOW) {
      recentEvents.delete(key);
    }
  }
  
  if (recentEvents.has(fingerprint)) {
    return false; // Duplicate
  }
  
  recentEvents.set(fingerprint, now);
  return true;
}

serve(async (req) => {
  const origin = req.headers.get("origin");
  const corsHeaders = getCorsHeaders(origin);
  
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
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

    const { event_type, variant, section, timestamp, signature } = await req.json();

    // Validate timestamp (must be within 5 minutes)
    const now = Date.now();
    if (!timestamp || typeof timestamp !== "number" || Math.abs(now - timestamp) > DEDUP_WINDOW) {
      return new Response(
        JSON.stringify({ error: "Invalid or expired request" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Verify HMAC signature
    const hmacSecret = Deno.env.get("AB_HMAC_SECRET") || Deno.env.get("SUPABASE_ANON_KEY")!;
    const payload = `${event_type}:${variant}:${section || ""}:${timestamp}`;
    
    if (!signature || !await verifySignature(payload, signature, hmacSecret)) {
      return new Response(
        JSON.stringify({ error: "Invalid signature" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Input validation
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

    // Validate section if provided (max 50 chars, alphanumeric + underscore)
    if (section && (typeof section !== "string" || section.length > 50 || !/^[a-zA-Z0-9_-]+$/.test(section))) {
      return new Response(
        JSON.stringify({ error: "Invalid section format" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Check for duplicate events (replay attack prevention)
    const eventFingerprint = `${clientIP}:${event_type}:${variant}:${section}:${timestamp}`;
    if (!checkDeduplication(eventFingerprint)) {
      return new Response(
        JSON.stringify({ error: "Duplicate event" }),
        { status: 409, headers: { ...corsHeaders, "Content-Type": "application/json" } }
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
      console.error("[track-ab-event] Insert failed");
      return new Response(
        JSON.stringify({ error: "Failed to record event" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ success: true }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("[track-ab-event] Request failed");
    return new Response(
      JSON.stringify({ error: "Internal error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
