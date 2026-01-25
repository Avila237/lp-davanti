import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { MessageCircle, FileText, Lock, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface ABStats {
  whatsapp_clicks: number;
  form_submits: number;
  by_section: Record<string, { whatsapp: number; form: number }>;
  period: string;
  total_events: number;
}

export default function AdminAB() {
  const [password, setPassword] = useState("");
  const [stats, setStats] = useState<ABStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchStats = async () => {
    if (!password.trim()) {
      setError("Digite a senha");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const { data, error: fnError } = await supabase.functions.invoke("ab-stats", {
        body: { password },
      });

      if (fnError) throw fnError;

      if (data.error) {
        setError(data.error);
        setStats(null);
      } else {
        setStats(data);
        setError("");
      }
    } catch (err) {
      console.error("Erro ao buscar stats:", err);
      setError("Erro ao conectar. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      fetchStats();
    }
  };

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-2xl mx-auto space-y-6">
        <h1 className="text-2xl font-bold text-center text-foreground">
          Relatório A/B - Davanti
        </h1>

        {/* Formulário de senha */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex gap-3 items-end">
              <div className="flex-1 space-y-2">
                <Label htmlFor="password" className="flex items-center gap-2">
                  <Lock className="h-4 w-4" />
                  Senha
                </Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Digite a senha de acesso"
                />
              </div>
              <Button onClick={fetchStats} disabled={loading}>
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  "Ver Relatório"
                )}
              </Button>
            </div>
            {error && (
              <p className="text-destructive text-sm mt-2">{error}</p>
            )}
          </CardContent>
        </Card>

        {/* Resultados */}
        {stats && (
          <>
            {/* Cards principais */}
            <div className="grid grid-cols-2 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                    <MessageCircle className="h-4 w-4" style={{ color: "hsl(142, 76%, 36%)" }} />
                    WhatsApp (A)
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-4xl font-bold text-foreground">
                    {stats.whatsapp_clicks}
                  </p>
                  <p className="text-xs text-muted-foreground">cliques</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                    <FileText className="h-4 w-4 text-primary" />
                    Formulário (B)
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-4xl font-bold text-foreground">
                    {stats.form_submits}
                  </p>
                  <p className="text-xs text-muted-foreground">envios</p>
                </CardContent>
              </Card>
            </div>

            {/* Por seção */}
            {Object.keys(stats.by_section).length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm font-medium">
                    Por Seção
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {Object.entries(stats.by_section).map(([section, counts]) => (
                      <div
                        key={section}
                        className="flex justify-between items-center py-2 border-b border-border last:border-0"
                      >
                        <span className="text-sm capitalize text-foreground">
                          {section}
                        </span>
                        <div className="flex gap-4 text-sm">
                          <span style={{ color: "hsl(142, 76%, 36%)" }}>
                            WA: {counts.whatsapp}
                          </span>
                          <span className="text-primary">
                            Form: {counts.form}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Rodapé */}
            <p className="text-xs text-muted-foreground text-center">
              Últimos 60 dias • {stats.total_events} eventos
            </p>
          </>
        )}
      </div>
    </div>
  );
}
