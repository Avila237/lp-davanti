import { MapPin, Briefcase, Building2, MessageCircle, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

interface JobDetailProps {
  job: {
    id: string;
    title: string;
    department: string;
    location: string;
    employment_type: string;
    description: string;
    requirements: string;
    benefits: string;
    whatsapp_number: string;
  };
}

const renderMarkdown = (text: string) => {
  // Handle both real newlines and literal \n
  const lines = text.replace(/\\n/g, "\n").split("\n");
  return lines.map((line, i) => {
    const trimmed = line.trim();
    if (!trimmed) return null;
    if (trimmed.startsWith("- ")) {
      return (
        <li key={i} className="ml-4 list-disc text-muted-foreground">
          {trimmed.slice(2)}
        </li>
      );
    }
    if (trimmed.startsWith("## ")) {
      return <h3 key={i} className="text-lg font-semibold text-foreground mt-6 mb-2">{trimmed.slice(3)}</h3>;
    }
    return <p key={i} className="text-muted-foreground mb-2">{trimmed}</p>;
  });
};

export const JobDetail = ({ job }: JobDetailProps) => {
  const whatsappMessage = encodeURIComponent(
    `Olá, tenho interesse na vaga de ${job.title} na ${job.location}. Vi pelo site da Davanti.`
  );
  const whatsappUrl = `https://wa.me/${job.whatsapp_number}?text=${whatsappMessage}`;

  return (
    <div className="container mx-auto px-4 py-10 md:py-16 max-w-5xl">
      <Link
        to="/carreiras"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-smooth mb-8"
      >
        <ArrowLeft className="h-4 w-4" />
        Voltar às vagas
      </Link>

      <div className="flex flex-col md:flex-row gap-10">
        {/* Sidebar */}
        <aside className="md:w-72 shrink-0 space-y-6">
          <div className="rounded-xl border border-border bg-card p-6 space-y-5">
            <div>
              <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Departamento</span>
              <p className="flex items-center gap-2 mt-1 text-foreground font-medium">
                <Building2 className="h-4 w-4 text-secondary" />
                {job.department}
              </p>
            </div>
            <div>
              <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Local</span>
              <p className="flex items-center gap-2 mt-1 text-foreground font-medium">
                <MapPin className="h-4 w-4 text-secondary" />
                {job.location}
              </p>
            </div>
            <div>
              <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Tipo</span>
              <p className="flex items-center gap-2 mt-1 text-foreground font-medium">
                <Briefcase className="h-4 w-4 text-secondary" />
                {job.employment_type}
              </p>
            </div>
          </div>

          <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className="block">
            <Button variant="whatsapp" size="lg" className="w-full">
              <MessageCircle className="h-5 w-5 mr-2" />
              Candidatar-se pelo WhatsApp
            </Button>
          </a>
        </aside>

        {/* Main content */}
        <main className="flex-1 min-w-0">
          <h1 className="text-2xl md:text-4xl font-bold text-foreground mb-8">{job.title}</h1>

          {job.description && (
            <section className="mb-8">
              <h2 className="text-xl font-semibold text-foreground mb-3">Sobre a vaga</h2>
              <div>{renderMarkdown(job.description)}</div>
            </section>
          )}

          {job.requirements && (
            <section className="mb-8">
              <h2 className="text-xl font-semibold text-foreground mb-3">Requisitos</h2>
              <ul>{renderMarkdown(job.requirements)}</ul>
            </section>
          )}

          {job.benefits && (
            <section className="mb-8">
              <h2 className="text-xl font-semibold text-foreground mb-3">Benefícios</h2>
              <ul>{renderMarkdown(job.benefits)}</ul>
            </section>
          )}

          {/* Mobile CTA */}
          <div className="md:hidden mt-10">
            <a href={whatsappUrl} target="_blank" rel="noopener noreferrer">
              <Button variant="whatsapp" size="lg" className="w-full">
                <MessageCircle className="h-5 w-5 mr-2" />
                Candidatar-se pelo WhatsApp
              </Button>
            </a>
          </div>
        </main>
      </div>
    </div>
  );
};
