import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const authAttempts = new Map<string, { count: number; blockedUntil: number }>();
const MAX_ATTEMPTS = 5;
const BLOCK_DURATION = 15 * 60 * 1000;

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

function constantTimeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) {
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

function validateAuth(req: Request, password: string): Response | null {
  const clientIP = getClientIP(req);
  const rateCheck = checkAuthRateLimit(clientIP);
  if (!rateCheck.allowed) {
    return new Response(
      JSON.stringify({ error: "Too many attempts. Try again later." }),
      { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json", "Retry-After": String(rateCheck.retryAfter) } }
    );
  }

  const adminPassword = Deno.env.get("ADMIN_PASSWORD");
  if (!adminPassword) {
    return new Response(
      JSON.stringify({ error: "Authentication not configured" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  if (!constantTimeEqual(password, adminPassword)) {
    recordFailedAttempt(clientIP);
    return new Response(
      JSON.stringify({ error: "Invalid password" }),
      { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  clearFailedAttempts(clientIP);
  return null;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    const { password, action, jobData } = body;

    if (!password || typeof password !== "string" || !action) {
      return new Response(
        JSON.stringify({ error: "Invalid request" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const authError = validateAuth(req, password);
    if (authError) return authError;

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const headers = { ...corsHeaders, "Content-Type": "application/json" };

    switch (action) {
      case "list": {
        const { data, error } = await supabase
          .from("job_listings")
          .select("*")
          .order("created_at", { ascending: false });
        if (error) throw error;
        return new Response(JSON.stringify({ jobs: data }), { headers });
      }

      case "create": {
        if (!jobData?.title || !jobData?.department || !jobData?.location) {
          return new Response(JSON.stringify({ error: "Missing required fields" }), { status: 400, headers });
        }
        const { data, error } = await supabase
          .from("job_listings")
          .insert({
            title: jobData.title,
            department: jobData.department,
            location: jobData.location,
            employment_type: jobData.employment_type || "CLT",
            description: jobData.description || "",
            requirements: jobData.requirements || "",
            benefits: jobData.benefits || "",
            whatsapp_number: jobData.whatsapp_number || "5555991166688",
            is_active: jobData.is_active ?? true,
          })
          .select()
          .single();
        if (error) throw error;
        return new Response(JSON.stringify({ job: data }), { headers });
      }

      case "update": {
        if (!jobData?.id) {
          return new Response(JSON.stringify({ error: "Missing job id" }), { status: 400, headers });
        }
        const { id, ...updates } = jobData;
        const { data, error } = await supabase
          .from("job_listings")
          .update(updates)
          .eq("id", id)
          .select()
          .single();
        if (error) throw error;
        return new Response(JSON.stringify({ job: data }), { headers });
      }

      case "toggle": {
        if (!jobData?.id) {
          return new Response(JSON.stringify({ error: "Missing job id" }), { status: 400, headers });
        }
        // Get current state
        const { data: current, error: fetchErr } = await supabase
          .from("job_listings")
          .select("is_active")
          .eq("id", jobData.id)
          .single();
        if (fetchErr) throw fetchErr;

        const { data, error } = await supabase
          .from("job_listings")
          .update({ is_active: !current.is_active })
          .eq("id", jobData.id)
          .select()
          .single();
        if (error) throw error;
        return new Response(JSON.stringify({ job: data }), { headers });
      }

      case "delete": {
        if (!jobData?.id) {
          return new Response(JSON.stringify({ error: "Missing job id" }), { status: 400, headers });
        }
        const { error } = await supabase
          .from("job_listings")
          .delete()
          .eq("id", jobData.id);
        if (error) throw error;
        return new Response(JSON.stringify({ success: true }), { headers });
      }

      default:
        return new Response(JSON.stringify({ error: "Unknown action" }), { status: 400, headers });
    }
  } catch (error) {
    console.error("[admin-jobs] Request failed:", error);
    return new Response(
      JSON.stringify({ error: "Internal error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
