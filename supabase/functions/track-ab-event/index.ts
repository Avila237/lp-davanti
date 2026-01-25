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
    const { event_type, variant, section } = await req.json();

    // Validação básica
    if (!event_type || !variant) {
      return new Response(
        JSON.stringify({ error: "event_type e variant são obrigatórios" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Valida valores permitidos
    if (!["whatsapp_click", "form_submit"].includes(event_type)) {
      return new Response(
        JSON.stringify({ error: "event_type inválido" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!["whatsapp", "form"].includes(variant)) {
      return new Response(
        JSON.stringify({ error: "variant inválido" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Cria cliente com service role para bypassar RLS
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Insere o evento
    const { error } = await supabase
      .from("ab_events")
      .insert({
        event_type,
        variant,
        section: section || null,
      });

    if (error) {
      console.error("[track-ab-event] Erro ao inserir:", error);
      throw error;
    }

    console.log("[track-ab-event] Evento registrado:", { event_type, variant, section });

    return new Response(
      JSON.stringify({ success: true }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("[track-ab-event] Erro:", error);
    return new Response(
      JSON.stringify({ error: "Erro interno" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
