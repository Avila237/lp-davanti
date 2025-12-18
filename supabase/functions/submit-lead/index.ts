import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Validação simples
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

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { name, phone, source, section } = await req.json();

    console.log("[submit-lead] Recebido:", { name, phone, source, section });

    // Validação
    const validation = validateInput(name, phone);
    if (!validation.valid) {
      console.log("[submit-lead] Validação falhou:", validation.error);
      return new Response(
        JSON.stringify({ success: false, error: validation.error }),
        { 
          status: 400, 
          headers: { ...corsHeaders, "Content-Type": "application/json" } 
        }
      );
    }

    // Pega as credenciais do Isales (quando configuradas)
    const ISALES_API_URL = Deno.env.get("ISALES_API_URL");
    const ISALES_API_TOKEN = Deno.env.get("ISALES_API_TOKEN");

    if (ISALES_API_URL && ISALES_API_TOKEN) {
      // Integração real com Isales
      console.log("[submit-lead] Enviando para Isales...");
      
      const isalesPayload = {
        name: name.trim(),
        phone: phone,
        extra_fields: {
          source: source || "Site Davanti",
          section: section || "unknown",
        },
      };

      const isalesResponse = await fetch(ISALES_API_URL, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${ISALES_API_TOKEN}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(isalesPayload),
      });

      if (!isalesResponse.ok) {
        const errorText = await isalesResponse.text();
        console.error("[submit-lead] Erro Isales:", isalesResponse.status, errorText);
        throw new Error(`Isales API error: ${isalesResponse.status}`);
      }

      const isalesData = await isalesResponse.json();
      console.log("[submit-lead] Resposta Isales:", isalesData);

      return new Response(
        JSON.stringify({ success: true, data: isalesData }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    } else {
      // Modo de teste: apenas loga os dados
      console.log("[submit-lead] MODO TESTE - Credenciais Isales não configuradas");
      console.log("[submit-lead] Lead recebido:", {
        name: name.trim(),
        phone,
        source: source || "Site Davanti",
        section: section || "unknown",
        timestamp: new Date().toISOString(),
      });

      return new Response(
        JSON.stringify({ 
          success: true, 
          mode: "test",
          message: "Lead registrado em modo de teste. Configure ISALES_API_URL e ISALES_API_TOKEN para integração real." 
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

  } catch (error) {
    console.error("[submit-lead] Erro:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ success: false, error: errorMessage }),
      { 
        status: 500, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );
  }
});
