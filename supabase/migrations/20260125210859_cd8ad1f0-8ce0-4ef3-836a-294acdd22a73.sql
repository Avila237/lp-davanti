-- Tabela de eventos A/B para tracking de conversões
CREATE TABLE public.ab_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type TEXT NOT NULL CHECK (event_type IN ('whatsapp_click', 'form_submit')),
  variant TEXT NOT NULL CHECK (variant IN ('whatsapp', 'form')),
  section TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Índice para consultas por período
CREATE INDEX idx_ab_events_created_at ON public.ab_events(created_at DESC);

-- RLS habilitado - ninguém lê diretamente (apenas via Edge Function com service role)
ALTER TABLE public.ab_events ENABLE ROW LEVEL SECURITY;

-- Política que bloqueia acesso direto - dados só acessíveis via Edge Functions
CREATE POLICY "Deny all direct access" ON public.ab_events
  FOR ALL USING (false);