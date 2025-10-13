import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MessageCircle, Store, Eye, CreditCard, Wrench, Star } from "lucide-react";

const benefits = [
  {
    icon: MessageCircle,
    title: "Atendimento rápido e humanizado",
  },
  {
    icon: Store,
    title: "Três lojas no centro de Ijuí para melhor atendimento",
  },
  {
    icon: Eye,
    title: "Parceria com oftalmologistas e exames de vista no local",
  },
  {
    icon: CreditCard,
    title: "Parcelamento em até 10x sem juros",
  },
  {
    icon: Wrench,
    title: "Ajustes e manutenção gratuitos após a compra",
  },
  {
    icon: Star,
    title: "Mais de 600 avaliações 5 estrelas no Google",
  },
];

export const Benefits = () => {
  const handleWhatsApp = () => {
    window.open("https://wa.me/5555991372807", "_blank");
  };

  return (
    <section id="diferenciais" className="py-20 gradient-subtle">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            Por que escolher a Óptica Davanti?
          </h2>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
          {benefits.map((benefit, index) => {
            const Icon = benefit.icon;
            return (
              <Card key={index} className="shadow-elegant hover:shadow-glow transition-smooth">
                <CardContent className="pt-6 flex items-start gap-4">
                  <div className="p-3 rounded-lg bg-secondary/10">
                    <Icon className="h-6 w-6 text-secondary" />
                  </div>
                  <p className="font-medium text-foreground flex-1">{benefit.title}</p>
                </CardContent>
              </Card>
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
            Falar com nossa equipe
          </Button>
        </div>
      </div>
    </section>
  );
};
