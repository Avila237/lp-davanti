import { Button } from "@/components/ui/button";
import { MessageCircle, Phone, Clock } from "lucide-react";

export const SpecialOffer = () => {
  const handleWhatsApp = () => {
    const message = encodeURIComponent("Olá, vim pelo site e gostaria de aproveitar meus 15% de desconto na primeira compra!");
    window.open(`https://wa.me/5555991068376?text=${message}`, "_blank");
  };

  const handleCall = () => {
    window.location.href = "tel:+5555991372807";
  };

  return (
    <section className="py-20 gradient-hero relative overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-secondary/10 rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-secondary/10 rounded-full blur-3xl" />
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-block mb-6 px-6 py-2 bg-secondary rounded-full">
            <p className="text-sm font-bold text-primary flex items-center gap-2">
              <Clock className="h-4 w-4" />
              OFERTA ESPECIAL
            </p>
          </div>

          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Ganhe 15% de desconto na sua primeira compra!
          </h2>

          <p className="text-xl text-white/90 mb-8 leading-relaxed">
            Fale conosco pelo WhatsApp e aproveite 15% de desconto em sua primeira compra. 
            Escolha o modelo ideal com a ajuda dos nossos consultores — sem compromisso.
          </p>

          <div className="flex items-center justify-center gap-2 mb-10 text-secondary">
            <Clock className="h-5 w-5" />
            <p className="text-lg font-semibold">Oferta válida até domingo!</p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              variant="secondary" 
              size="xl"
              onClick={handleWhatsApp}
              className="shadow-glow"
            >
              <MessageCircle className="mr-2 h-5 w-5" />
              Quero meu desconto
            </Button>

            <Button 
              variant="outline" 
              size="xl"
              onClick={handleCall}
              className="bg-white/10 text-white border-white/30 hover:bg-white/20"
            >
              <Phone className="mr-2 h-5 w-5" />
              Ligar agora
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};
