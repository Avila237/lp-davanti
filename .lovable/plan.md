
## Dashboard de Conversoes A/B - Plano de Implementacao

### Visao Geral

Criaremos um dashboard minimalista e seguro para visualizar as conversoes do teste A/B (WhatsApp vs Formulario). O dashboard sera protegido por senha simples e mostrara apenas os numeros essenciais.

---

### Arquitetura de Seguranca

```text
+------------------+     +-------------------+     +------------------+
|   /admin/ab      | --> |  Edge Function    | --> |   ab_events      |
|   (Dashboard)    |     |  (valida senha)   |     |   (tabela)       |
+------------------+     +-------------------+     +------------------+
        |                        |
        v                        v
  Senha via input        ADMIN_PASSWORD
  (nao armazenada)       (secret seguro)
```

- **Senha validada no servidor**: A senha nunca e verificada no frontend - a validacao acontece na Edge Function
- **Secret seguro**: A senha de admin fica armazenada como secret no backend (nunca no codigo)
- **Dados publicos**: A tabela armazena apenas contadores agregados, sem dados pessoais

---

### O Que Sera Criado

| Componente | Descricao |
|------------|-----------|
| Tabela `ab_events` | Armazena cada evento de conversao (tipo, variante, secao, timestamp) |
| Edge Function `ab-stats` | Retorna estatisticas agregadas, validando senha |
| Pagina `/admin/ab` | Dashboard minimalista com input de senha |
| Atualizacao do `submit-lead` | Grava eventos na tabela ao receber leads |

---

### Estrutura da Tabela

```sql
CREATE TABLE public.ab_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type TEXT NOT NULL, -- 'whatsapp_click' ou 'form_submit'
  variant TEXT NOT NULL,    -- 'whatsapp' ou 'form'
  section TEXT,             -- 'hero', 'products', etc
  created_at TIMESTAMPTZ DEFAULT now()
);

-- RLS: Apenas leitura via service role (Edge Functions)
ALTER TABLE public.ab_events ENABLE ROW LEVEL SECURITY;

-- Politica: Ninguem le diretamente (apenas via Edge Function)
CREATE POLICY "Deny all direct access" ON public.ab_events
  FOR ALL USING (false);
```

---

### Edge Function: ab-stats

```text
POST /ab-stats
Body: { "password": "senha-do-admin" }

Resposta (se senha correta):
{
  "whatsapp_clicks": 45,
  "form_submits": 38,
  "by_section": {
    "hero": { "whatsapp": 20, "form": 15 },
    "products": { "whatsapp": 10, "form": 12 }
  },
  "period": "last_60_days"
}
```

A Edge Function:
1. Valida a senha contra o secret `ADMIN_PASSWORD`
2. Consulta a tabela `ab_events` usando o service role
3. Retorna apenas dados agregados (contadores)

---

### Dashboard Minimalista

Interface super simples:

```text
+----------------------------------------+
|        Relatorio A/B - Davanti         |
+----------------------------------------+
|  Senha: [__________] [Ver Relatorio]   |
+----------------------------------------+
|                                        |
|   WhatsApp (Variante A)     Form (B)   |
|   +----------------+    +------------+ |
|   |      45        |    |     38     | |
|   |    cliques     |    |   envios   | |
|   +----------------+    +------------+ |
|                                        |
|   Por Secao:                           |
|   - Hero: WA 20 | Form 15              |
|   - Products: WA 10 | Form 12          |
+----------------------------------------+
```

---

### Fluxo de Gravacao de Eventos

Atualmente os eventos vao apenas para o GTM. Adicionaremos gravacao no banco:

1. **WhatsApp Click**: O `ABTestCTA` chamara uma Edge Function para registrar
2. **Form Submit**: O `submit-lead` ja existente gravara na tabela `ab_events`

Para manter simplicidade, gravaremos apenas os eventos de conversao real:
- `whatsapp_click` - quando usuario clica no botao WhatsApp
- `form_submit` - quando formulario e enviado com sucesso

---

### Arquivos a Criar/Modificar

| Arquivo | Acao |
|---------|------|
| `supabase/functions/ab-stats/index.ts` | Criar - Edge Function com validacao de senha |
| `supabase/functions/submit-lead/index.ts` | Modificar - Gravar evento na tabela |
| `src/pages/AdminAB.tsx` | Criar - Dashboard minimalista |
| `src/App.tsx` | Modificar - Adicionar rota /admin/ab |
| `src/hooks/use-ab-test.ts` | Modificar - Chamar edge function no click WhatsApp |

---

### Secret Necessario

Sera necessario adicionar um novo secret:

- **ADMIN_PASSWORD**: Senha para acessar o dashboard de relatorios

---

### Detalhes Tecnicos

#### Migracao SQL

```sql
-- Tabela de eventos A/B
CREATE TABLE public.ab_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type TEXT NOT NULL CHECK (event_type IN ('whatsapp_click', 'form_submit')),
  variant TEXT NOT NULL CHECK (variant IN ('whatsapp', 'form')),
  section TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Indice para consultas por periodo
CREATE INDEX idx_ab_events_created_at ON public.ab_events(created_at DESC);

-- RLS habilitado, mas sem politicas de leitura publica
ALTER TABLE public.ab_events ENABLE ROW LEVEL SECURITY;
```

#### Edge Function ab-stats

- Valida senha via comparacao com `Deno.env.get("ADMIN_PASSWORD")`
- Usa `createClient` com `SUPABASE_SERVICE_ROLE_KEY` para bypassar RLS
- Retorna agregacoes dos ultimos 60 dias

#### Componente AdminAB

- Input de senha (tipo password)
- Botao para buscar dados
- Cards simples mostrando totais
- Lista por secao
- Sem persistencia de senha no navegador

---

### Ordem de Implementacao

1. Criar tabela `ab_events` via migracao
2. Adicionar secret `ADMIN_PASSWORD`
3. Criar Edge Function `ab-stats`
4. Modificar `submit-lead` para gravar eventos de form
5. Criar Edge Function `track-ab-event` para eventos WhatsApp
6. Criar pagina `AdminAB.tsx`
7. Adicionar rota em `App.tsx`
8. Atualizar `use-ab-test.ts` para chamar track-ab-event
