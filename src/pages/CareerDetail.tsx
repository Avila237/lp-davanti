import { useParams, Navigate, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { JobDetail } from "@/components/careers/JobDetail";
import { ArrowLeft, Building2, MapPin, Briefcase } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

const CareerDetail = () => {
  const { id } = useParams<{ id: string }>();

  const { data: job, isLoading, error } = useQuery({
    queryKey: ["job_listing", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("job_listings")
        .select("*")
        .eq("id", id!)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  });

  if (isLoading) {
    return (
      <main className="min-h-screen bg-background">
        <Header />
        <section className="gradient-hero pt-28 pb-10 md:pt-36 md:pb-14">
          <div className="container mx-auto px-4 max-w-5xl">
            <Skeleton className="h-4 w-32 bg-white/20 mb-4" />
            <Skeleton className="h-9 w-72 bg-white/20 mb-3" />
            <Skeleton className="h-4 w-48 bg-white/20" />
          </div>
        </section>
        <Footer />
      </main>
    );
  }

  if (error || !job) {
    return <Navigate to="/carreiras" replace />;
  }

  return (
    <main className="min-h-screen bg-background">
      <Header />
      <section className="gradient-hero pt-28 pb-10 md:pt-36 md:pb-14">
        <div className="container mx-auto px-4 max-w-5xl">
          <Link
            to="/carreiras"
            className="inline-flex items-center gap-1.5 text-sm text-white/70 hover:text-white transition-smooth mb-4"
          >
            <ArrowLeft className="h-4 w-4" />
            Voltar às vagas
          </Link>
          <h1 className="text-2xl md:text-4xl font-bold text-white mb-3">{job.title}</h1>
          <div className="flex flex-wrap items-center gap-4 text-white/80 text-sm">
            <span className="flex items-center gap-1.5">
              <Building2 className="h-4 w-4" />
              {job.department}
            </span>
            <span className="flex items-center gap-1.5">
              <MapPin className="h-4 w-4" />
              {job.location}
            </span>
            <span className="flex items-center gap-1.5">
              <Briefcase className="h-4 w-4" />
              {job.employment_type}
            </span>
          </div>
        </div>
      </section>
      <JobDetail job={job as any} />
      <Footer />
    </main>
  );
};

export default CareerDetail;
