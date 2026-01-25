import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { encode } from "https://deno.land/std@0.168.0/encoding/hex.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Simple in-memory rate limiting for auth attempts
const authAttempts = new Map<string, { count: number; blockedUntil: number }>();
const MAX_ATTEMPTS = 5;
const BLOCK_DURATION = 15 * 60 * 1000; // 15 minutes

function getClientIP(req: Request): string {
  return req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || 
         req.headers.get("x-real-ip") || 
         "unknown";
}

function checkAuthRateLimit(ip: string): { allowed: boolean; retryAfter?: number } {
  const now = Date.now();
  const record = authAttempts.get(ip);
  
  if (record && now < record.blockedUntil) {
    return { allowed: false, retryAfter: Math.ceil((record.blockedUntil - now) / 1000) };
  }
  
  return { allowed: true };
}

function recordFailedAttempt(ip: string): void {
  const now = Date.now();
  const record = authAttempts.get(ip);
  
  if (!record || now >= record.blockedUntil) {
    authAttempts.set(ip, { count: 1, blockedUntil: 0 });
    return;
  }
  
  record.count++;
  if (record.count >= MAX_ATTEMPTS) {
    record.blockedUntil = now + BLOCK_DURATION;
  }
}

function clearFailedAttempts(ip: string): void {
  authAttempts.delete(ip);
}

// Constant-time string comparison to prevent timing attacks
function constantTimeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) {
    // Still do the comparison to maintain constant time
    let result = 0;
    for (let i = 0; i < a.length; i++) {
      result |= a.charCodeAt(i) ^ (b.charCodeAt(i % b.length) || 0);
    }
    return false;
  }
  
  let result = 0;
  for (let i = 0; i < a.length; i++) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return result === 0;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const clientIP = getClientIP(req);
    
    // Check rate limit
    const rateCheck = checkAuthRateLimit(clientIP);
    if (!rateCheck.allowed) {
      return new Response(
        JSON.stringify({ error: "Too many attempts. Try again later." }),
        { 
          status: 429, 
          headers: { 
            ...corsHeaders, 
            "Content-Type": "application/json",
            "Retry-After": String(rateCheck.retryAfter)
          } 
        }
      );
    }

    const { password } = await req.json();
    
    if (!password || typeof password !== "string") {
      return new Response(
        JSON.stringify({ error: "Invalid request" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    // Validate password against stored password using constant-time comparison
    const adminPassword = Deno.env.get("ADMIN_PASSWORD");
    if (!adminPassword) {
      return new Response(
        JSON.stringify({ error: "Authentication not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    // Use constant-time comparison to prevent timing attacks
    if (!constantTimeEqual(password, adminPassword)) {
      recordFailedAttempt(clientIP);
      return new Response(
        JSON.stringify({ error: "Invalid password" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    // Clear failed attempts on successful auth
    clearFailedAttempts(clientIP);

    // Create client with service role to bypass RLS
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Fetch events from last 60 days
    const sixtyDaysAgo = new Date();
    sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60);

    const { data: events, error } = await supabase
      .from("ab_events")
      .select("event_type, variant, section, created_at")
      .gte("created_at", sixtyDaysAgo.toISOString())
      .order("created_at", { ascending: false });

    if (error) {
      console.error("[ab-stats] Query failed");
      return new Response(
        JSON.stringify({ error: "Failed to fetch data" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Aggregate data
    let whatsappClicks = 0;
    let formSubmits = 0;
    const bySection: Record<string, { whatsapp: number; form: number }> = {};
    const byDatetime: Record<string, { whatsapp: number; form: number }> = {};

    for (const event of events || []) {
      if (event.event_type === "whatsapp_click") {
        whatsappClicks++;
      } else if (event.event_type === "form_submit") {
        formSubmits++;
      }

      // Group by section
      const section = event.section || "unknown";
      if (!bySection[section]) {
        bySection[section] = { whatsapp: 0, form: 0 };
      }
      
      if (event.event_type === "whatsapp_click") {
        bySection[section].whatsapp++;
      } else if (event.event_type === "form_submit") {
        bySection[section].form++;
      }

      // Group by date and hour
      const eventDate = new Date(event.created_at);
      const dateKey = eventDate.toISOString().split('T')[0];
      const hour = eventDate.getUTCHours();
      const dtKey = `${dateKey}_${hour}`;
      
      if (!byDatetime[dtKey]) {
        byDatetime[dtKey] = { whatsapp: 0, form: 0 };
      }
      
      if (event.event_type === "whatsapp_click") {
        byDatetime[dtKey].whatsapp++;
      } else if (event.event_type === "form_submit") {
        byDatetime[dtKey].form++;
      }
    }

    // Convert to sorted array (most recent first), limited to 50
    const byDatetimeArray = Object.entries(byDatetime)
      .map(([key, counts]) => {
        const [date, hour] = key.split('_');
        return { date, hour: parseInt(hour), ...counts };
      })
      .sort((a, b) => {
        if (a.date !== b.date) return b.date.localeCompare(a.date);
        return b.hour - a.hour;
      })
      .slice(0, 50);

    return new Response(
      JSON.stringify({
        whatsapp_clicks: whatsappClicks,
        form_submits: formSubmits,
        by_section: bySection,
        by_datetime: byDatetimeArray,
        period: "last_60_days",
        total_events: events?.length || 0,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("[ab-stats] Request failed");
    return new Response(
      JSON.stringify({ error: "Internal error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
