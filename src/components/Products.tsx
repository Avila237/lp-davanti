import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MessageCircle } from "lucide-react";
import oculosGrau from "@/assets/oculos-grau.jpg";
import oculosSol from "@/assets/oculos-sol.jpg";
import relogios from "@/assets/relogios.jpg";
import acessorios from "@/assets/acessorios.jpg";

const products = [
  {
    title: "Óculos de Grau",
    description: "Design leve, ajuste preciso e lentes personalizadas para o seu estilo de vida.",
    price: "A partir de R$ 199",
    image: oculosGrau,
    icon: "👓",
  },
  {
    title: "Óculos de Sol",
    description: "Proteção UV e sofisticação para todos os estilos.",
    price: "A partir de R$ 249",
    image: oculosSol,
    icon: "🕶",
  },
  {
    title: "Relógios",
    description: "Marcas que unem elegância e funcionalidade: Technos, Orient, Magnum e Champion",
    price: "Diversas opções",
    image: relogios,
    icon: "⌚",
  },
  {
    title: "Jóias em Ouro",
    description: "Peças exclusivas em ouro com qualidade e certificação garantidas",
    price: "Consulte-nos",
    image: acessorios,
    icon: "💍",
  },
  {
    title: "Semi-Jóias e Acessórios",
    description: "Semi-joias folheadas e acessórios fashion para complementar seu visual",
    price: "Consulte-nos",
    image: acessorios,
    icon: "💎",
  },
  {
    title: "Tradição Gaúcha",
    description: "Cuias, bombas de chimarrão, facas e fivelas artesanais de alta qualidade",
    price: "Diversas opções",
    image: acessorios,
    icon: "🧉",
  },
];

export const Products = () => {
  const handleWhatsApp = () => {
    window.open("https://wa.me/5555991372807", "_blank");
  };

  return (
    <section id="produtos" className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            Seu novo visual começa com o par perfeito
          </h2>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            Na Davanti, cada produto é escolhido com cuidado, unindo design, conforto e durabilidade. 
            Trabalhamos com marcas consagradas como Ray-Ban, Emporio Armani e Diesel.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {products.map((product, index) => (
            <Card key={index} className="shadow-elegant hover:shadow-glow transition-smooth overflow-hidden group">
              <div className="relative h-64 overflow-hidden">
                <img 
                  src={product.image} 
                  alt={product.title}
                  className="w-full h-full object-cover transition-smooth group-hover:scale-110"
                />
                <div className="absolute top-4 left-4 text-4xl">{product.icon}</div>
              </div>
              <CardHeader>
                <CardTitle className="text-xl">{product.title}</CardTitle>
                <CardDescription className="text-sm">{product.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-secondary font-bold mb-4">{product.price}</p>
                <Button 
                  variant="whatsapp" 
                  size="sm" 
                  className="w-full"
                  onClick={handleWhatsApp}
                >
                  <MessageCircle className="mr-2 h-4 w-4" />
                  Ver opções
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};
