import { useParams, Navigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { JobDetail } from "@/components/careers/JobDetail";

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
  });

  if (isLoading) {
    return (
      <main className="min-h-screen bg-background">
        <Header />
        <div className="pt-28 text-center text-muted-foreground py-20">Carregando...</div>
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
      <div className="pt-20">
        <JobDetail job={job as any} />
      </div>
      <Footer />
    </main>
  );
};

export default CareerDetail;
