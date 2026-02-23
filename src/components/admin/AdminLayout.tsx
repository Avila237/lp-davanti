import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart3, Briefcase } from "lucide-react";
import ABReport from "./ABReport";
import JobsManager from "./JobsManager";

interface AdminLayoutProps {
  password: string;
}

export default function AdminLayout({ password }: AdminLayoutProps) {
  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <h1 className="text-2xl font-bold text-center text-foreground">
          Painel Admin — Davanti
        </h1>

        <Tabs defaultValue="ab" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="ab" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Relatório A/B
            </TabsTrigger>
            <TabsTrigger value="jobs" className="flex items-center gap-2">
              <Briefcase className="h-4 w-4" />
              Vagas
            </TabsTrigger>
          </TabsList>

          <TabsContent value="ab">
            <ABReport password={password} />
          </TabsContent>

          <TabsContent value="jobs">
            <JobsManager password={password} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
