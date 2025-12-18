import { useState, ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { MessageCircle } from "lucide-react";
import { useABTest } from "@/hooks/use-ab-test";
import { ContactFormModal } from "./ContactFormModal";

interface ABTestCTAProps {
  section: string;
  buttonText?: string;
  whatsappNumber?: string;
  whatsappMessage?: string;
  variant?: "whatsapp" | "secondary" | "outline" | "default";
  size?: "default" | "sm" | "lg" | "xl" | "icon";
  className?: string;
  icon?: ReactNode;
  showIcon?: boolean;
  onTrackEvent?: (eventName: string, data?: Record<string, any>) => void;
}

export function ABTestCTA({
  section,
  buttonText = "Falar no WhatsApp",
  whatsappNumber = "5555991372807",
  whatsappMessage,
  variant = "whatsapp",
  size = "default",
  className = "",
  icon,
  showIcon = true,
  onTrackEvent,
}: ABTestCTAProps) {
  const { isFormVariant, trackABEvent } = useABTest();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleClick = () => {
    if (isFormVariant) {
      // Variante B: Abre o modal do formulário
      trackABEvent("ab_test_form_open", { section, button_text: buttonText });
      onTrackEvent?.("ab_test_form_open", { section, button_text: buttonText });
      setIsModalOpen(true);
    } else {
      // Variante A: Abre o WhatsApp
      trackABEvent("ab_test_whatsapp_click", { section, button_text: buttonText });
      onTrackEvent?.("ab_test_whatsapp_click", { section, button_text: buttonText });
      
      let url = `https://wa.me/${whatsappNumber}`;
      if (whatsappMessage) {
        url += `?text=${encodeURIComponent(whatsappMessage)}`;
      }
      window.open(url, "_blank");
    }
  };

  const handleFormSuccess = () => {
    trackABEvent("ab_test_form_success", { section });
  };

  const buttonIcon = icon || (showIcon ? <MessageCircle className="h-4 w-4" /> : null);

  return (
    <>
      <Button
        variant={variant}
        size={size}
        onClick={handleClick}
        className={className}
      >
        {buttonIcon && <span className="mr-2">{buttonIcon}</span>}
        {buttonText}
      </Button>

      <ContactFormModal
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        section={section}
        onSuccess={handleFormSuccess}
        onTrackEvent={trackABEvent}
      />
    </>
  );
}
