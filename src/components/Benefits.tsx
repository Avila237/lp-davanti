import { Card, CardContent } from "@/components/ui/card";
import { MessageCircle, Store, Eye, CreditCard, Wrench, Star, Award } from "lucide-react";
import emporioArmaniLogo from "@/assets/brands/emporio-armani.jpg";
import dieselLogo from "@/assets/brands/diesel.png";
import montBlancLogo from "@/assets/brands/mont-blanc.png";
import offWhiteLogo from "@/assets/brands/off-white.png";
import bottegaVenetaLogo from "@/assets/brands/bottega-veneta.png";
import { ABTestCTA } from "./ABTestCTA";

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

const exclusiveBrands = {
  watches: [
    {
      name: "Emporio Armani",
      logo: emporioArmaniLogo,
      alt: "Relógio Emporio Armani - Marca exclusiva na Óptica Davanti Ijuí"
    },
    {
      name: "Diesel",
      logo: dieselLogo,
      alt: "Relógio Diesel - Marca exclusiva na Óptica Davanti Ijuí"
    }
  ],
  eyewear: [
    {
      name: "Mont Blanc",
      logo: montBlancLogo,
      alt: "Óculos Mont Blanc - Marca premium exclusiva na Óptica Davanti Ijuí"
    },
    {
      name: "Off White",
      logo: offWhiteLogo,
      alt: "Óculos Off White - Marca premium exclusiva na Óptica Davanti Ijuí"
    },
    {
      name: "Bottega Veneta",
      logo: bottegaVenetaLogo,
      alt: "Óculos Bottega Veneta - Grife italiana exclusiva na Óptica Davanti Ijuí"
    }
  ]
};

export const Benefits = () => {
  return (
    <section id="diferenciais" className="py-12 md:py-20 gradient-subtle">
      <div className="container mx-auto px-4">
        <header className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4">
            Por que escolher a Óptica Davanti?
          </h2>
        </header>

        <div className="grid sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
          {benefits.map((benefit, index) => {
            const Icon = benefit.icon;
            return (
              <Card key={index} className="shadow-elegant hover:shadow-glow transition-smooth h-full">
                <CardContent className="pt-6 flex items-center gap-4">
                  <div className="p-3 rounded-lg bg-secondary/10">
                    <Icon className="h-6 w-6 text-secondary" />
                  </div>
                  <p className="font-medium text-foreground flex-1">{benefit.title}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Exclusive Brands Section */}
        <article id="exclusivos" className="mt-20 mb-16">
          <header className="text-center mb-12">
            <div className="inline-flex items-center gap-2 mb-4">
              <Award className="h-8 w-8 text-secondary" />
              <h3 className="text-2xl md:text-3xl lg:text-4xl font-bold text-foreground">
                Marcas Exclusivas e Premium em Ijuí
              </h3>
            </div>
            <p className="text-base md:text-lg text-muted-foreground max-w-3xl mx-auto">
              Oferecemos as marcas mais prestigiadas do mundo em relógios e óculos, 
              com modelos exclusivos disponíveis apenas na Óptica Davanti.
            </p>
          </header>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {/* Watches Category */}
            <Card className="shadow-elegant hover:shadow-glow transition-smooth overflow-hidden">
              <CardContent className="p-8">
                <header className="mb-6">
                  <div className="inline-block px-4 py-1 rounded-full gradient-accent text-primary mb-4">
                    <span className="font-semibold text-sm">Exclusivo</span>
                  </div>
                  <h4 className="text-xl md:text-2xl font-bold text-foreground mb-3">
                    Relógios Premium
                  </h4>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    A sofisticação italiana da Emporio Armani e o design robusto da Diesel, 
                    com modelos exclusivos em Ijuí.
                  </p>
                </header>
                
                <div className="grid grid-cols-2 gap-4 md:gap-6 mt-6">
                  {exclusiveBrands.watches.map((brand, index) => (
                    <div 
                      key={index}
                      className="bg-white rounded-lg p-6 flex items-center justify-center hover:scale-105 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 shadow-md border border-gray-100"
                      aria-label={brand.alt}
                    >
                      <img 
                        src={brand.logo} 
                        alt={brand.alt}
                        className="w-full h-auto object-contain max-h-16 md:max-h-24 min-h-14 md:min-h-20"
                        loading="lazy"
                      />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Eyewear Category */}
            <Card className="shadow-elegant hover:shadow-glow transition-smooth overflow-hidden">
              <CardContent className="p-8">
                <header className="mb-6">
                  <div className="inline-block px-4 py-1 rounded-full gradient-accent text-primary mb-4">
                    <span className="font-semibold text-sm">Exclusivo</span>
                  </div>
                  <h4 className="text-xl md:text-2xl font-bold text-foreground mb-3">
                    Óculos Premium
                  </h4>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    A elegância atemporal da Mont Blanc, o estilo urbano da Off White 
                    e o refinamento italiano da Bottega Veneta.
                  </p>
                </header>
                
                <div className="grid grid-cols-2 gap-4 md:gap-6 mt-6">
                  {exclusiveBrands.eyewear.map((brand, index) => (
                    <div 
                      key={index}
                      className={`bg-white rounded-lg p-6 flex items-center justify-center hover:scale-105 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 shadow-md border border-gray-100 ${
                        index === 2 ? 'col-span-2' : ''
                      }`}
                      aria-label={brand.alt}
                    >
                      <img 
                        src={brand.logo} 
                        alt={brand.alt}
                        className="w-full h-auto object-contain max-h-16 md:max-h-24 min-h-14 md:min-h-20"
                        loading="lazy"
                      />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </article>

        <div className="text-center">
          <ABTestCTA
            section="benefits"
            buttonText="Falar com nossa equipe"
            whatsappNumber="5555991068376"
            whatsappMessage="Olá, vim pelo site e gostaria de olhar alguns exclusivos"
            variant="whatsapp"
            size="lg"
            icon={<MessageCircle className="h-5 w-5" />}
          />
        </div>
      </div>
    </section>
  );
};
