import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { MessageCircle, FileText, Lock, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface DateTimeStats {
  date: string;
  hour: number;
  section: string;
  whatsapp: number;
  form: number;
}

interface IndividualEvent {
  timestamp: string;
  event_type: string;
  section: string;
  variant: string;
}

interface ABStats {
  whatsapp_clicks: number;
  form_submits: number;
  by_section: Record<string, { whatsapp: number; form: number }>;
  by_datetime: DateTimeStats[];
  individual_events: IndividualEvent[];
  period: string;
  total_events: number;
}

const formatDate = (dateStr: string) => {
  const [, month, day] = dateStr.split('-');
  return `${day}/${month}`;
};

const formatEventTime = (timestamp: string) => {
  const date = new Date(timestamp);
  return date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
};

const formatEventDate = (timestamp: string) => {
  const date = new Date(timestamp);
  return `${String(date.getDate()).padStart(2, '0')}/${String(date.getMonth() + 1).padStart(2, '0')}`;
};

const getEventTypeLabel = (eventType: string) => {
  return eventType === 'whatsapp_click' ? 'WhatsApp' : 'Formulário';
};

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
      // Send password over HTTPS - server handles validation with constant-time comparison
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
    } catch {
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

        {/* Password form */}
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
                  autoComplete="current-password"
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

        {/* Results */}
        {stats && (
          <>
            {/* Main cards */}
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

            {/* By section */}
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

            {/* By Date/Time */}
            {stats.by_datetime && stats.by_datetime.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm font-medium">
                    Conversões por Data/Hora
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Data</TableHead>
                        <TableHead>Hora</TableHead>
                        <TableHead>Seção</TableHead>
                        <TableHead className="text-right">WhatsApp</TableHead>
                        <TableHead className="text-right">Formulário</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {stats.by_datetime.map((row, idx) => (
                        <TableRow key={`${row.date}_${row.hour}_${row.section}_${idx}`}>
                          <TableCell>{formatDate(row.date)}</TableCell>
                          <TableCell>{String(row.hour).padStart(2, '0')}:00</TableCell>
                          <TableCell className="capitalize text-muted-foreground text-sm">
                            {row.section}
                          </TableCell>
                          <TableCell className="text-right" style={{ color: "hsl(142, 76%, 36%)" }}>
                            {row.whatsapp || '-'}
                          </TableCell>
                          <TableCell className="text-right text-primary">
                            {row.form || '-'}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            )}

            {/* Individual Events */}
            {stats.individual_events && stats.individual_events.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm font-medium">
                    Conversões Individuais
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Data</TableHead>
                        <TableHead>Hora</TableHead>
                        <TableHead>Tipo</TableHead>
                        <TableHead>Seção</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {stats.individual_events.map((event, idx) => (
                        <TableRow key={`individual_${idx}_${event.timestamp}`}>
                          <TableCell>{formatEventDate(event.timestamp)}</TableCell>
                          <TableCell className="font-mono">{formatEventTime(event.timestamp)}</TableCell>
                          <TableCell>
                            <span style={{ color: event.event_type === 'whatsapp_click' ? "hsl(142, 76%, 36%)" : undefined }} className={event.event_type !== 'whatsapp_click' ? 'text-primary' : ''}>
                              {getEventTypeLabel(event.event_type)}
                            </span>
                          </TableCell>
                          <TableCell className="capitalize text-muted-foreground text-sm">
                            {event.section}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            )}

            {/* Footer */}
            <p className="text-xs text-muted-foreground text-center">
              Últimos 60 dias • {stats.total_events} eventos
            </p>
          </>
        )}
      </div>
    </div>
  );
}
