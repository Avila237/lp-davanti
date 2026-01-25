import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

export type ABVariant = "whatsapp" | "form";

const AB_STORAGE_KEY = "davanti_ab_variant";

// Verifica se o visitante já tem uma variante atribuída, ou sorteia uma nova
function getOrAssignVariant(): ABVariant {
  if (typeof window === "undefined") return "whatsapp";
  
  const stored = localStorage.getItem(AB_STORAGE_KEY);
  if (stored === "whatsapp" || stored === "form") {
    return stored;
  }
  
  // Sorteia 50/50
  const variant: ABVariant = Math.random() < 0.5 ? "whatsapp" : "form";
  localStorage.setItem(AB_STORAGE_KEY, variant);
  
  return variant;
}

// Envia evento para o banco de dados via Edge Function
async function trackEventToDatabase(eventType: "whatsapp_click" | "form_submit", variant: ABVariant, section?: string) {
  try {
    await supabase.functions.invoke("track-ab-event", {
      body: { event_type: eventType, variant, section },
    });
  } catch (err) {
    console.error("[A/B Test] Erro ao gravar evento:", err);
  }
}

export function useABTest() {
  const [variant, setVariant] = useState<ABVariant>("whatsapp");
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    const assignedVariant = getOrAssignVariant();
    setVariant(assignedVariant);
    setIsInitialized(true);
    
    // Track variant assignment (apenas na primeira atribuição)
    const wasNew = !localStorage.getItem(AB_STORAGE_KEY + "_tracked");
    if (wasNew) {
      localStorage.setItem(AB_STORAGE_KEY + "_tracked", "true");
      trackABEvent("ab_test_variant_assigned", { variant: assignedVariant });
    }
  }, []);

  const trackABEvent = useCallback((eventName: string, data: Record<string, any> = {}) => {
    if (typeof window !== "undefined" && window.dataLayer) {
      // Busca diretamente do localStorage para garantir valor correto (evita race condition)
      const currentVariant = localStorage.getItem(AB_STORAGE_KEY) || variant;
      
      window.dataLayer.push({
        event: eventName,
        ab_variant: currentVariant,
        event_category: 'ab_test',
        ...data,
      });
      console.log(`[A/B Test] ${eventName}:`, { variant: currentVariant, ...data });
    }
  }, [variant]);

  // Registra clique no WhatsApp (GTM + banco de dados)
  const trackWhatsAppClick = useCallback((section: string) => {
    const currentVariant = (localStorage.getItem(AB_STORAGE_KEY) || variant) as ABVariant;
    
    // Envia para GTM
    trackABEvent("ab_test_whatsapp_click", { section });
    
    // Envia para banco de dados
    trackEventToDatabase("whatsapp_click", currentVariant, section);
  }, [variant, trackABEvent]);

  return {
    variant,
    isInitialized,
    isFormVariant: variant === "form",
    isWhatsAppVariant: variant === "whatsapp",
    trackABEvent,
    trackWhatsAppClick,
  };
}

// Declaração global para dataLayer
declare global {
  interface Window {
    dataLayer?: any[];
  }
}
