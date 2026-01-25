import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

function validateInput(name: string, phone: string): { valid: boolean; error?: string } {
  if (!name || name.trim().length < 2) {
    return { valid: false, error: "Nome deve ter pelo menos 2 caracteres" };
  }
  if (name.trim().length > 100) {
    return { valid: false, error: "Nome deve ter no máximo 100 caracteres" };
  }
  if (!phone || phone.replace(/\D/g, "").length < 10) {
    return { valid: false, error: "Telefone deve ter pelo menos 10 dígitos" };
  }
  return { valid: true };
}

// Record A/B conversion event
async function trackFormSubmit(section: string) {
  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    await supabase.from("ab_events").insert({
      event_type: "form_submit",
      variant: "form",
      section: section || null,
    });
  } catch {
    // Silently fail - analytics should not break core functionality
  }
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { name, phone, source, section } = await req.json();

    const validation = validateInput(name, phone);
    if (!validation.valid) {
      return new Response(
        JSON.stringify({ success: false, error: validation.error }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const ISALES_TOKEN = Deno.env.get("ISALES_TOKEN");

    if (ISALES_TOKEN) {
      // Create FormData as per Isales documentation
      const formData = new FormData();
      formData.append('e', ISALES_TOKEN);
      formData.append('redirect', '1');
      formData.append('nome', name.trim());
      formData.append('telefone', phone);

      const isalesResponse = await fetch('https://app.isales.company/formulario/cliente', {
        method: 'POST',
        body: formData,
      });

      if (!isalesResponse.ok) {
        console.error("[submit-lead] External API error");
        return new Response(
          JSON.stringify({ success: false, error: "Failed to submit lead" }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // Record A/B conversion
      await trackFormSubmit(section);

      return new Response(
        JSON.stringify({ success: true, message: "Lead enviado com sucesso" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    } else {
      // Test mode - no Isales token configured
      // Record A/B conversion even in test mode
      await trackFormSubmit(section);

      return new Response(
        JSON.stringify({ 
          success: true, 
          mode: "test",
          message: "Lead registrado em modo de teste. Configure ISALES_TOKEN para integração real." 
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

  } catch (error) {
    console.error("[submit-lead] Request failed");
    return new Response(
      JSON.stringify({ success: false, error: "Internal error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
