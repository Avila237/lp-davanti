import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

export type ABVariant = "whatsapp" | "form";

const AB_STORAGE_KEY = "davanti_ab_variant";
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;

// HMAC-SHA256 signature for secure event tracking
async function generateSignature(payload: string): Promise<string> {
  // Use the anon key as HMAC secret (available to client, verified server-side)
  const secret = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || "";
  
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  
  const signatureBuffer = await crypto.subtle.sign("HMAC", key, encoder.encode(payload));
  return Array.from(new Uint8Array(signatureBuffer))
    .map(b => b.toString(16).padStart(2, "0"))
    .join("");
}

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

// Envia evento para o banco de dados via Edge Function with HMAC signature
async function trackEventToDatabase(eventType: "whatsapp_click" | "form_submit", variant: ABVariant, section?: string) {
  try {
    const timestamp = Date.now();
    const payload = `${eventType}:${variant}:${section || ""}:${timestamp}`;
    const signature = await generateSignature(payload);
    
    await supabase.functions.invoke("track-ab-event", {
      body: { 
        event_type: eventType, 
        variant, 
        section,
        timestamp,
        signature
      },
    });
  } catch {
    // Silently fail - analytics should not break user experience
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
    }
  }, [variant]);

  // Registra clique no WhatsApp usando Beacon API (garantia de envio)
  const trackWhatsAppClickBeacon = useCallback((section: string) => {
    const currentVariant = localStorage.getItem(AB_STORAGE_KEY) || "whatsapp";
    
    // Envia para GTM
    trackABEvent("ab_test_whatsapp_click", { section });
    
    // Usa Beacon API para garantir envio mesmo durante navegação
    const data = JSON.stringify({
      event_type: "whatsapp_click",
      variant: currentVariant,
      section,
    });
    
    try {
      navigator.sendBeacon(
        `${SUPABASE_URL}/functions/v1/track-ab-beacon`,
        data
      );
    } catch {
      // Fallback silencioso - não deve quebrar a experiência do usuário
    }
  }, [trackABEvent]);

  // Legacy function - mantida para compatibilidade
  const trackWhatsAppClick = useCallback((section: string) => {
    trackWhatsAppClickBeacon(section);
  }, [trackWhatsAppClickBeacon]);

  return {
    variant,
    isInitialized,
    isFormVariant: variant === "form",
    isWhatsAppVariant: variant === "whatsapp",
    trackABEvent,
    trackWhatsAppClick,
    trackWhatsAppClickBeacon,
  };
}

// Declaração global para dataLayer
declare global {
  interface Window {
    dataLayer?: any[];
  }
}
