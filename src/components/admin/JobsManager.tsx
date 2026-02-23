import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Plus, Pencil, Trash2, ToggleLeft, ToggleRight, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import JobForm from "./JobForm";

interface Job {
  id: string;
  title: string;
  department: string;
  location: string;
  employment_type: string;
  whatsapp_number: string;
  description: string;
  requirements: string;
  benefits: string;
  is_active: boolean;
  created_at: string;
}

interface JobsManagerProps {
  password: string;
}

export default function JobsManager({ password }: JobsManagerProps) {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [editingJob, setEditingJob] = useState<Job | null>(null);
  const [showForm, setShowForm] = useState(false);

  const callApi = async (action: string, jobData?: any) => {
    const { data, error } = await supabase.functions.invoke("admin-jobs", {
      body: { password, action, jobData },
    });
    if (error) throw error;
    if (data.error) throw new Error(data.error);
    return data;
  };

  const fetchJobs = async () => {
    setLoading(true);
    try {
      const data = await callApi("list");
      setJobs(data.jobs || []);
    } catch {
      toast.error("Erro ao carregar vagas");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, []);

  const handleSave = async (jobData: any) => {
    setActionLoading(true);
    try {
      if (jobData.id) {
        await callApi("update", jobData);
        toast.success("Vaga atualizada");
      } else {
        await callApi("create", jobData);
        toast.success("Vaga criada");
      }
      setShowForm(false);
      setEditingJob(null);
      await fetchJobs();
    } catch {
      toast.error("Erro ao salvar vaga");
    } finally {
      setActionLoading(false);
    }
  };

  const handleToggle = async (id: string) => {
    setActionLoading(true);
    try {
      await callApi("toggle", { id });
      toast.success("Status atualizado");
      await fetchJobs();
    } catch {
      toast.error("Erro ao alterar status");
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Excluir a vaga "${title}"?`)) return;
    setActionLoading(true);
    try {
      await callApi("delete", { id });
      toast.success("Vaga excluída");
      await fetchJobs();
    } catch {
      toast.error("Erro ao excluir vaga");
    } finally {
      setActionLoading(false);
    }
  };

  if (showForm || editingJob) {
    return (
      <JobForm
        job={editingJob}
        onSave={handleSave}
        onCancel={() => { setShowForm(false); setEditingJob(null); }}
        loading={actionLoading}
      />
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <p className="text-sm text-muted-foreground">{jobs.length} vaga(s) cadastrada(s)</p>
        <Button onClick={() => setShowForm(true)} size="sm">
          <Plus className="h-4 w-4 mr-1" /> Nova Vaga
        </Button>
      </div>

      {loading ? (
        <div className="flex justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : jobs.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            Nenhuma vaga cadastrada.
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Título</TableHead>
                  <TableHead className="hidden md:table-cell">Departamento</TableHead>
                  <TableHead className="hidden md:table-cell">Local</TableHead>
                  <TableHead className="hidden md:table-cell">Tipo</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {jobs.map((job) => (
                  <TableRow key={job.id}>
                    <TableCell className="font-medium">{job.title}</TableCell>
                    <TableCell className="hidden md:table-cell">{job.department}</TableCell>
                    <TableCell className="hidden md:table-cell">{job.location}</TableCell>
                    <TableCell className="hidden md:table-cell">{job.employment_type}</TableCell>
                    <TableCell>
                      <Badge variant={job.is_active ? "default" : "secondary"}>
                        {job.is_active ? "Ativa" : "Inativa"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setEditingJob(job)}
                          disabled={actionLoading}
                          title="Editar"
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleToggle(job.id)}
                          disabled={actionLoading}
                          title={job.is_active ? "Desativar" : "Ativar"}
                        >
                          {job.is_active ? <ToggleRight className="h-4 w-4" /> : <ToggleLeft className="h-4 w-4" />}
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(job.id, job.title)}
                          disabled={actionLoading}
                          title="Excluir"
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
