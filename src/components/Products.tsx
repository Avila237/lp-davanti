import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { MessageCircle } from "lucide-react";
import oculosGrau from "@/assets/oculos-grau.jpg";
import oculosSol from "@/assets/oculos-sol.jpg";
import relogios from "@/assets/relogios.jpg";
import acessorios from "@/assets/acessorios.jpg";
import { ABTestCTA } from "./ABTestCTA";

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
  return (
    <section id="produtos" className="py-12 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-8">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Seu novo visual começa com o par perfeito
          </h2>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            Na Davanti, cada produto é escolhido com cuidado, unindo design, conforto e durabilidade. 
            Trabalhamos com marcas consagradas como Ray-Ban, Emporio Armani e Diesel.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((product, index) => (
            <Card key={index} className="flex flex-col shadow-elegant hover:shadow-glow transition-smooth overflow-hidden group h-full">
              <div className="relative h-48 overflow-hidden">
                <img 
                  src={product.image} 
                  alt={product.title}
                  className="w-full h-full object-cover transition-smooth group-hover:scale-110"
                />
                <div className="absolute top-3 left-3 text-3xl">{product.icon}</div>
              </div>
              <CardHeader className="p-4 pb-2">
                <CardTitle className="text-xl mb-2">{product.title}</CardTitle>
                <CardDescription className="text-sm min-h-[3rem]">{product.description}</CardDescription>
              </CardHeader>
              <CardContent className="p-4 pt-0 flex flex-col justify-end flex-grow">
                <p className="text-secondary font-bold mb-4">{product.price}</p>
                <ABTestCTA
                  section={`products_${product.title.toLowerCase().replace(/\s+/g, '_')}`}
                  buttonText="Ver opções"
                  whatsappNumber="5555991372807"
                  variant="whatsapp"
                  size="sm"
                  className="w-full"
                  icon={<MessageCircle className="h-4 w-4" />}
                />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};
