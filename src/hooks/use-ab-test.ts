import { useEffect, useState, useCallback } from "react";

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
      window.dataLayer.push({
        event: eventName,
        ab_variant: variant,
        ...data,
      });
    }
    console.log(`[A/B Test] ${eventName}:`, { variant, ...data });
  }, [variant]);

  return {
    variant,
    isInitialized,
    isFormVariant: variant === "form",
    isWhatsAppVariant: variant === "whatsapp",
    trackABEvent,
  };
}

// Declaração global para dataLayer
declare global {
  interface Window {
    dataLayer?: any[];
  }
}
