
## Exibir Conversoes Individuais com Hora Exata

### Situacao Atual

Hoje os eventos sao agrupados por hora (ex: "14:00"). O banco de dados ja tem o campo `created_at` com timestamp completo de cada evento, mas a edge function agrega os dados antes de enviar.

### Alteracoes Necessarias

#### 1. Edge Function (`ab-stats/index.ts`)

Adicionar um novo campo `individual_events` na resposta que retorna cada evento individualmente:

```text
Dados retornados atualmente:
- by_datetime: agregado por hora

Novos dados:
- individual_events: lista de cada evento com timestamp exato
```

Estrutura de cada evento individual:

| Campo | Descricao |
|-------|-----------|
| timestamp | Data/hora exata (ex: "2026-01-29T16:42:33") |
| event_type | "whatsapp_click" ou "form_submit" |
| section | Secao do site (hero, products, etc) |
| variant | Variante do teste (whatsapp ou form) |

Limite: 100 eventos mais recentes para nao sobrecarregar a interface.

#### 2. Dashboard (`AdminAB.tsx`)

Adicionar nova tabela "Conversoes Individuais" abaixo da tabela agregada:

| Data | Hora | Tipo | Secao |
|------|------|------|-------|
| 29/01 | 16:42:33 | WhatsApp | hero |
| 29/01 | 16:38:15 | Formulario | products |
| 29/01 | 15:22:47 | WhatsApp | benefits |

A hora sera exibida no formato HH:MM:SS (ex: "16:42:33").

### Beneficios

- Visibilidade total de cada conversao
- Hora exata de cada clique/envio
- Analise detalhada do comportamento do usuario
- Manter a visao agregada para analise rapida

### Arquivos a Modificar

| Arquivo | Alteracao |
|---------|-----------|
| `supabase/functions/ab-stats/index.ts` | Adicionar `individual_events` na resposta |
| `src/pages/AdminAB.tsx` | Nova tabela para eventos individuais |

