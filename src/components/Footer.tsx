import { Button } from "@/components/ui/button";
import { MessageCircle, Phone, Navigation } from "lucide-react";

export const Footer = () => {
  const handleWhatsApp = () => {
    window.open("https://wa.me/5555991372807", "_blank");
  };

  const handleCall = () => {
    window.location.href = "tel:+5555991372807";
  };

  const handleMaps = () => {
    window.open("https://maps.google.com/?q=Rua+Quinze+de+Novembro,+197,+Ijuí", "_blank");
  };

  return (
    <footer className="py-20 gradient-hero">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Seus novos óculos estão a um clique de distância
          </h2>
          <p className="text-xl text-white/90 mb-10">
            Descubra o padrão Davanti e veja o mundo com mais estilo e conforto.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
            <Button 
              variant="secondary" 
              size="lg"
              onClick={handleWhatsApp}
              className="shadow-glow"
            >
              <MessageCircle className="mr-2 h-5 w-5" />
              WhatsApp
            </Button>

            <Button 
              variant="outline" 
              size="lg"
              onClick={handleCall}
              className="bg-white/10 text-white border-white/30 hover:bg-white/20"
            >
              <Phone className="mr-2 h-5 w-5" />
              Ligar
            </Button>

            <Button 
              variant="outline" 
              size="lg"
              onClick={handleMaps}
              className="bg-white/10 text-white border-white/30 hover:bg-white/20"
            >
              <Navigation className="mr-2 h-5 w-5" />
              Ver rota mais próxima
            </Button>
          </div>

          <div className="border-t border-white/20 pt-8">
            <p className="text-white/70 text-sm">
              © {new Date().getFullYear()} Óptica Davanti. Todos os direitos reservados.
            </p>
            <p className="text-white/70 text-sm mt-2">
              Mais de 10 anos levando qualidade e estilo para Ijuí
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};
