import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { CareersHero } from "@/components/careers/CareersHero";
import { DepartmentFilter } from "@/components/careers/DepartmentFilter";
import { JobCard } from "@/components/careers/JobCard";
import { Footer } from "@/components/Footer";
import { Briefcase } from "lucide-react";

const Careers = () => {
  const [selectedDept, setSelectedDept] = useState<string | null>(null);

  const { data: jobs = [], isLoading } = useQuery({
    queryKey: ["job_listings"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("job_listings")
        .select("*")
        .order("department")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const departments = useMemo(
    () => [...new Set(jobs.map((j: any) => j.department))].sort(),
    [jobs]
  );

  const filtered = selectedDept
    ? jobs.filter((j: any) => j.department === selectedDept)
    : jobs;

  // Group by department
  const grouped = useMemo(() => {
    const map: Record<string, any[]> = {};
    filtered.forEach((j: any) => {
      if (!map[j.department]) map[j.department] = [];
      map[j.department].push(j);
    });
    return Object.entries(map).sort(([a], [b]) => a.localeCompare(b));
  }, [filtered]);

  return (
    <main className="min-h-screen bg-background">
      <CareersHero />

      <section className="container mx-auto px-4 py-12 md:py-20 max-w-3xl">
        <DepartmentFilter
          departments={departments}
          selected={selectedDept}
          onSelect={setSelectedDept}
        />

        {isLoading ? (
          <div className="text-center text-muted-foreground py-20">Carregando vagas...</div>
        ) : grouped.length === 0 ? (
          <div className="text-center py-20">
            <Briefcase className="h-12 w-12 mx-auto text-muted-foreground/40 mb-4" />
            <p className="text-muted-foreground text-lg">
              Nenhuma vaga aberta no momento.
            </p>
            <p className="text-muted-foreground text-sm mt-1">
              Volte em breve, novas oportunidades podem surgir a qualquer momento.
            </p>
          </div>
        ) : (
          <div className="space-y-10">
            {grouped.map(([dept, deptJobs]) => (
              <div key={dept}>
                <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-4">
                  {dept}
                </h2>
                <div className="space-y-3">
                  {deptJobs.map((job: any) => (
                    <JobCard
                      key={job.id}
                      id={job.id}
                      title={job.title}
                      location={job.location}
                      employment_type={job.employment_type}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <Footer />
    </main>
  );
};

export default Careers;
