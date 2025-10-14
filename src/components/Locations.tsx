import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MapPin, MessageCircle, Navigation } from "lucide-react";

const locations = [
  {
    name: "Matriz",
    address: "Rua Quinze de Novembro, 197 – Centro, Ijuí – RS, 98700-000",
    phone: "(55) 99137-2807",
    whatsapp: "5555991372807",
    maps: "https://maps.google.com/?q=Rua+Quinze+de+Novembro,+197,+Ijuí",
  },
  {
    name: "Loja 2",
    address: "Rua 14 de Julho, 173 – Centro, Ijuí – RS, 98700-000",
    phone: "(55) 99106-8376",
    whatsapp: "5555991068376",
    maps: "https://maps.google.com/?q=Rua+14+de+Julho,+173,+Ijuí",
  },
  {
    name: "Loja 3",
    address: "Rua José Bonifácio, 239 – Centro, Ijuí – RS, 98700-000",
    phone: "(55) 99719-6834",
    whatsapp: "5555997196834",
    maps: "https://maps.google.com/?q=Rua+José+Bonifácio,+239,+Ijuí",
  },
];

export const Locations = () => {
  return (
    <section id="lojas" className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            Três lojas Davanti para melhor atender você em Ijuí
          </h2>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {locations.map((location, index) => (
            <Card key={index} className="shadow-elegant hover:shadow-glow transition-smooth">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-2xl">
                  <MapPin className="h-6 w-6 text-secondary" />
                  {location.name}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground text-sm leading-relaxed">{location.address}</p>
                <p className="text-foreground font-semibold">📱 {location.phone}</p>
                
                <div className="flex flex-col gap-2">
                  <Button
                    variant="whatsapp"
                    size="sm"
                    className="w-full"
                    onClick={() => window.open(`https://wa.me/${location.whatsapp}`, "_blank")}
                  >
                    <MessageCircle className="mr-2 h-4 w-4" />
                    Falar com a {location.name}
                  </Button>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full"
                    onClick={() => window.open("https://share.google/1UExsdW1H8jRJIyJp", "_blank")}
                  >
                    <Navigation className="mr-2 h-4 w-4" />
                    Ver no Google Maps
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};
