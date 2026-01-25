import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, CheckCircle2, Send } from "lucide-react";
import { z } from "zod";

// Schema de validação
const formSchema = z.object({
  name: z.string()
    .trim()
    .min(2, "Nome deve ter pelo menos 2 caracteres")
    .max(100, "Nome deve ter no máximo 100 caracteres"),
  phone: z.string()
    .trim()
    .min(10, "Telefone deve ter pelo menos 10 dígitos")
    .max(15, "Telefone inválido")
    .regex(/^[\d\s()-]+$/, "Telefone deve conter apenas números"),
});

interface ContactFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  section: string;
  onSuccess?: () => void;
  onTrackEvent?: (eventName: string, data?: Record<string, any>) => void;
}

export function ContactFormModal({ 
  open, 
  onOpenChange, 
  section,
  onSuccess,
  onTrackEvent
}: ContactFormModalProps) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errors, setErrors] = useState<{ name?: string; phone?: string }>({});
  const { toast } = useToast();

  const formatPhone = (value: string) => {
    // Remove tudo que não é número
    const numbers = value.replace(/\D/g, "");
    
    // Formata como (XX) XXXXX-XXXX
    if (numbers.length <= 2) return numbers;
    if (numbers.length <= 7) return `(${numbers.slice(0, 2)}) ${numbers.slice(2)}`;
    if (numbers.length <= 11) return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 7)}-${numbers.slice(7)}`;
    return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 7)}-${numbers.slice(7, 11)}`;
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhone(e.target.value);
    setPhone(formatted);
    setErrors(prev => ({ ...prev, phone: undefined }));
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setName(e.target.value);
    setErrors(prev => ({ ...prev, name: undefined }));
  };

  const resetForm = () => {
    setName("");
    setPhone("");
    setErrors({});
    setIsSuccess(false);
  };

  const handleClose = (open: boolean) => {
    if (!open) {
      resetForm();
    }
    onOpenChange(open);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validação
    const result = formSchema.safeParse({ name, phone });
    if (!result.success) {
      const fieldErrors: { name?: string; phone?: string } = {};
      result.error.errors.forEach(err => {
        if (err.path[0] === "name") fieldErrors.name = err.message;
        if (err.path[0] === "phone") fieldErrors.phone = err.message;
      });
      setErrors(fieldErrors);
      return;
    }

    setIsLoading(true);
    
    try {
      // Normaliza o telefone (apenas números)
      const phoneNumbers = phone.replace(/\D/g, "");
      const fullPhone = phoneNumbers.startsWith("55") ? phoneNumbers : `55${phoneNumbers}`;

      const { data, error } = await supabase.functions.invoke("submit-lead", {
        body: {
          name: name.trim(),
          phone: fullPhone,
          source: "Site Davanti - Teste A/B",
          section,
        },
      });

      if (error) throw error;

      setIsSuccess(true);
      onTrackEvent?.("ab_test_form_submit", { 
        section, 
        success: true,
        event_category: 'conversion',
        event_label: `form_${section}`
      });
      
      toast({
        title: "Mensagem enviada!",
        description: "Em breve entraremos em contato com você.",
      });

      onSuccess?.();
      
      // Fecha o modal após 2 segundos
      setTimeout(() => {
        handleClose(false);
      }, 2000);

    } catch (error) {
      console.error("Erro ao enviar lead:", error);
      onTrackEvent?.("ab_test_form_submit", { 
        section, 
        success: false,
        event_category: 'conversion',
        event_label: `form_${section}_error`
      });
      
      toast({
        variant: "destructive",
        title: "Erro ao enviar",
        description: "Por favor, tente novamente ou entre em contato pelo WhatsApp.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        {isSuccess ? (
          <div className="flex flex-col items-center py-8 text-center">
            <CheckCircle2 className="h-16 w-16 text-green-500 mb-4" />
            <DialogTitle className="text-2xl mb-2">Obrigado!</DialogTitle>
            <DialogDescription className="text-base">
              Recebemos seus dados e entraremos em contato em breve.
            </DialogDescription>
          </div>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle className="text-xl md:text-2xl">
                Fale com a Óptica Davanti
              </DialogTitle>
              <DialogDescription>
                Preencha seus dados e entraremos em contato rapidamente!
              </DialogDescription>
            </DialogHeader>
            
            <form onSubmit={handleSubmit} className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nome completo</Label>
                <Input
                  id="name"
                  placeholder="Digite seu nome"
                  value={name}
                  onChange={handleNameChange}
                  disabled={isLoading}
                  className={errors.name ? "border-destructive" : ""}
                />
                {errors.name && (
                  <p className="text-sm text-destructive">{errors.name}</p>
                )}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="phone">Telefone com DDD</Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="(55) 99999-9999"
                  value={phone}
                  onChange={handlePhoneChange}
                  disabled={isLoading}
                  className={errors.phone ? "border-destructive" : ""}
                />
                {errors.phone && (
                  <p className="text-sm text-destructive">{errors.phone}</p>
                )}
              </div>
              
              <Button 
                type="submit" 
                className="w-full" 
                size="lg"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Enviando...
                  </>
                ) : (
                  <>
                    <Send className="mr-2 h-4 w-4" />
                    Quero ser contactado
                  </>
                )}
              </Button>
            </form>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
