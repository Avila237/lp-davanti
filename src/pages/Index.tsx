import { Hero } from "@/components/Hero";
import { Testimonials } from "@/components/Testimonials";
import { Products } from "@/components/Products";
import { Benefits } from "@/components/Benefits";
import { SpecialOffer } from "@/components/SpecialOffer";
import { Locations } from "@/components/Locations";
import { Footer } from "@/components/Footer";

const Index = () => {
  return (
    <main className="min-h-screen">
      <Hero />
      <Testimonials />
      <Products />
      <Benefits />
      <SpecialOffer />
      <Locations />
      <Footer />
    </main>
  );
};

export default Index;
