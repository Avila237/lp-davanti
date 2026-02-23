import { Header } from "@/components/Header";

export const CareersHero = () => {
  return (
    <>
      <Header />
      <section className="gradient-hero pt-28 pb-16 md:pt-36 md:pb-24">
        <div className="container mx-auto px-4 text-center max-w-3xl">
          <h1 className="text-3xl md:text-5xl font-bold text-white mb-4">
            Trabalhe na <span className="text-secondary">Davanti</span>
          </h1>
          <p className="text-base md:text-lg text-white/80 leading-relaxed">
            Faça parte de uma equipe apaixonada por oferecer a melhor experiência em óptica.
            Confira nossas vagas abertas e venha crescer com a gente.
          </p>
        </div>
      </section>
    </>
  );
};
