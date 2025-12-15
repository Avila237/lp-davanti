import { Card, CardContent } from "@/components/ui/card";
import { Star, Shield, Award, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MessageCircle } from "lucide-react";
import { useAnalytics } from "@/hooks/use-analytics";

const testimonials = [
  {
    name: "Sandra Erstling",
    text: "Atendimento excelente! Fiz minha compra pelo WhatsApp, tudo rápido e com muito capricho.",
  },
  {
    name: "Dienifer Paz",
    text: "Loja incrível com produtos de alta qualidade e atendimento nota mil!",
  },
  {
    name: "Lázaro Valdês",
    text: "Já sou cliente a anos, pois sempre fui bem atendido, valores justos e equipe de venda é fantástica, com certeza voltarei a comprar novamente.",
  },
];

const guarantees = [
  { icon: Clock, text: "+10 anos de tradição em Ijuí" },
  { icon: Shield, text: "Produtos 100% originais com certificado" },
  { icon: Award, text: "1 ano de garantia em armações e lentes" },
  { icon: MessageCircle, text: "Atendimento presencial e online" },
];

export const Testimonials = () => {
  const { trackEvent } = useAnalytics();

  const handleWhatsApp = () => {
    trackEvent('whatsapp_click', {
      section: 'testimonials',
      button_text: 'Falar com um consultor agora'
    });
    const message = encodeURIComponent("Olá, vim pelo site e gostaria de ajuda.");
    window.open(`https://wa.me/5555991372807?text=${message}`, "_blank");
  };

  return (
    <section id="depoimentos" className="py-12 md:py-20 gradient-subtle">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4">
            Excelência, tradição e confiança em cada atendimento
          </h2>
          <p className="text-base md:text-lg text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            A Óptica Davanti é referência em Ijuí quando o assunto é visão, estilo e atendimento humanizado. 
            Com três lojas no centro da cidade, oferecemos tecnologia de ponta em lentes, armações das melhores 
            marcas do mercado e uma equipe que entende o que combina com você.
          </p>
        </div>

        {/* Testimonials Grid */}
        <div className="grid sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {testimonials.map((testimonial, index) => (
            <Card key={index} className="shadow-elegant hover:shadow-glow transition-smooth border-border/50">
              <CardContent className="pt-6">
                <div className="flex gap-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 fill-secondary text-secondary" />
                  ))}
                </div>
                <p className="text-sm md:text-base text-muted-foreground mb-4 italic">"{testimonial.text}"</p>
                <p className="text-sm md:text-base font-semibold text-foreground">- {testimonial.name}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Guarantees */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-10">
          {guarantees.map((item, index) => {
            const Icon = item.icon;
            return (
              <div key={index} className="flex flex-col items-center text-center p-6 rounded-lg bg-card shadow-elegant">
                <Icon className="h-10 w-10 text-secondary mb-3" />
                <p className="text-sm font-medium text-foreground">{item.text}</p>
              </div>
            );
          })}
        </div>

        <div className="text-center">
          <Button 
            variant="whatsapp" 
            size="lg"
            onClick={handleWhatsApp}
          >
            <MessageCircle className="mr-2 h-5 w-5" />
            Falar com um consultor agora
          </Button>
        </div>
      </div>
    </section>
  );
};
