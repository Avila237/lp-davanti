import { MessageCircle } from "lucide-react";
import heroImage from "@/assets/hero-loja-davanti.jpg";
import { ABTestCTA } from "./ABTestCTA";

export const Hero = () => {
  return (
    <section id="inicio" className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background Image with Overlay */}
      <div
        className="absolute inset-0 z-0"
        style={{
          backgroundImage: `url(${heroImage})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-[hsl(222,47%,11%)] via-[hsl(222,47%,11%)]/95 to-[hsl(222,47%,11%)]/80" />
      </div>

      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 py-12 md:py-20 text-center max-w-5xl">
        <h1 className="text-3xl md:text-5xl lg:text-7xl font-bold text-white mb-6 leading-tight animate-fade-in">
          Encontre seus óculos de grau, solares e acessórios exclusivos na{" "}
          <span className="text-secondary">Óptica Davanti</span>{" "}
        </h1>

        <p className="text-base md:text-xl text-white/90 mb-10 max-w-3xl mx-auto leading-relaxed">
          Mais de 13 anos de tradição em Ijuí, oferecendo atendimento personalizado, as melhores marcas e condições
          exclusivas.
        </p>

        <ABTestCTA
          section="hero"
          buttonText="Conversar no WhatsApp"
          whatsappNumber="5555991166688"
          whatsappMessage="Olá, vim pelo site e gostaria de ajuda."
          variant="whatsapp"
          size="lg"
          className="animate-pulse-slow md:h-14 md:px-10 md:text-lg"
          icon={<MessageCircle className="h-5 w-5" />}
        />
      </div>

      {/* Decorative Elements */}
      <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-background to-transparent z-10" />
    </section>
  );
};
