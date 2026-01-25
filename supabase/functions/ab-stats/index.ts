import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { password } = await req.json();
    
    // Valida senha contra o secret
    const adminPassword = Deno.env.get("ADMIN_PASSWORD");
    if (!adminPassword || password !== adminPassword) {
      return new Response(
        JSON.stringify({ error: "Senha inválida" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Cria cliente com service role para bypassar RLS
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Busca eventos dos últimos 60 dias
    const sixtyDaysAgo = new Date();
    sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60);

    const { data: events, error } = await supabase
      .from("ab_events")
      .select("event_type, variant, section, created_at")
      .gte("created_at", sixtyDaysAgo.toISOString())
      .order("created_at", { ascending: false });

    if (error) {
      console.error("[ab-stats] Erro ao buscar eventos:", error);
      throw error;
    }

    // Agrega os dados
    let whatsappClicks = 0;
    let formSubmits = 0;
    const bySection: Record<string, { whatsapp: number; form: number }> = {};

    for (const event of events || []) {
      if (event.event_type === "whatsapp_click") {
        whatsappClicks++;
      } else if (event.event_type === "form_submit") {
        formSubmits++;
      }

      // Agrupa por seção
      const section = event.section || "unknown";
      if (!bySection[section]) {
        bySection[section] = { whatsapp: 0, form: 0 };
      }
      
      if (event.event_type === "whatsapp_click") {
        bySection[section].whatsapp++;
      } else if (event.event_type === "form_submit") {
        bySection[section].form++;
      }
    }

    return new Response(
      JSON.stringify({
        whatsapp_clicks: whatsappClicks,
        form_submits: formSubmits,
        by_section: bySection,
        period: "last_60_days",
        total_events: events?.length || 0,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("[ab-stats] Erro:", error);
    return new Response(
      JSON.stringify({ error: "Erro interno" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
