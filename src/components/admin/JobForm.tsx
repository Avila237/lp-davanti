import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, ArrowLeft } from "lucide-react";

interface JobData {
  id?: string;
  title: string;
  department: string;
  location: string;
  employment_type: string;
  whatsapp_number: string;
  description: string;
  requirements: string;
  benefits: string;
  is_active: boolean;
}

interface JobFormProps {
  job?: JobData | null;
  onSave: (data: JobData) => Promise<void>;
  onCancel: () => void;
  loading: boolean;
}

const emptyJob: JobData = {
  title: "",
  department: "",
  location: "",
  employment_type: "CLT",
  whatsapp_number: "5555991166688",
  description: "",
  requirements: "",
  benefits: "",
  is_active: true,
};

export default function JobForm({ job, onSave, onCancel, loading }: JobFormProps) {
  const [form, setForm] = useState<JobData>(job || emptyJob);

  useEffect(() => {
    setForm(job || emptyJob);
  }, [job]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(form);
  };

  const set = (field: keyof JobData, value: string | boolean) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={onCancel}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <CardTitle className="text-lg">{job?.id ? "Editar Vaga" : "Nova Vaga"}</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="title">Título *</Label>
              <Input id="title" value={form.title} onChange={(e) => set("title", e.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="department">Departamento *</Label>
              <Input id="department" value={form.department} onChange={(e) => set("department", e.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="location">Local *</Label>
              <Input id="location" value={form.location} onChange={(e) => set("location", e.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="employment_type">Tipo de Contrato</Label>
              <Input id="employment_type" value={form.employment_type} onChange={(e) => set("employment_type", e.target.value)} />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="whatsapp_number">Número WhatsApp</Label>
              <Input id="whatsapp_number" value={form.whatsapp_number} onChange={(e) => set("whatsapp_number", e.target.value)} />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descrição</Label>
            <Textarea id="description" value={form.description} onChange={(e) => set("description", e.target.value)} rows={4} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="requirements">Requisitos</Label>
            <Textarea id="requirements" value={form.requirements} onChange={(e) => set("requirements", e.target.value)} rows={4} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="benefits">Benefícios</Label>
            <Textarea id="benefits" value={form.benefits} onChange={(e) => set("benefits", e.target.value)} rows={4} />
          </div>

          <div className="flex gap-3 pt-2">
            <Button type="submit" disabled={loading}>
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : job?.id ? "Salvar" : "Criar Vaga"}
            </Button>
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancelar
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
