

## Tabela de Conversoes por Dia e Hora

### Objetivo

Adicionar uma tabela simples abaixo dos indicadores principais mostrando as conversoes agrupadas por data e hora, permitindo visualizar quando os usuarios mais convertem.

---

### O Que Sera Criado

Uma tabela minimalista com as seguintes colunas:

| Data | Hora | WhatsApp | Formulario |
|------|------|----------|------------|
| 25/01 | 14:00 | 3 | 2 |
| 25/01 | 15:00 | 1 | 0 |
| 24/01 | 10:00 | 2 | 1 |

---

### Alteracoes Necessarias

#### 1. Edge Function `ab-stats`

Adicionar uma nova agregacao `by_datetime` que agrupa eventos por dia e hora:

```typescript
// Nova estrutura de retorno
{
  whatsapp_clicks: 45,
  form_submits: 38,
  by_section: { ... },
  by_datetime: [
    { date: "2026-01-25", hour: 14, whatsapp: 3, form: 2 },
    { date: "2026-01-25", hour: 15, whatsapp: 1, form: 0 },
    ...
  ],
  period: "last_60_days",
  total_events: 83
}
```

A agregacao sera feita em JavaScript, agrupando eventos por `YYYY-MM-DD` e hora (0-23).

#### 2. Componente `AdminAB.tsx`

Adicionar uma nova secao com tabela usando os componentes Table do shadcn/ui:

```text
+------------------------------------------+
|  Conversoes por Data/Hora                |
+------------------------------------------+
|  Data    | Hora  | WhatsApp | Formulario |
|----------|-------|----------|------------|
|  25/01   | 14:00 |    3     |     2      |
|  25/01   | 15:00 |    1     |     0      |
|  24/01   | 10:00 |    2     |     1      |
+------------------------------------------+
```

---

### Detalhes Tecnicos

#### Atualizacao da Interface TypeScript

```typescript
interface DateTimeStats {
  date: string;    // "2026-01-25"
  hour: number;    // 0-23
  whatsapp: number;
  form: number;
}

interface ABStats {
  whatsapp_clicks: number;
  form_submits: number;
  by_section: Record<string, { whatsapp: number; form: number }>;
  by_datetime: DateTimeStats[];  // Nova propriedade
  period: string;
  total_events: number;
}
```

#### Logica de Agregacao na Edge Function

```typescript
// Agrupa por data e hora
const byDatetime: Record<string, { whatsapp: number; form: number }> = {};

for (const event of events || []) {
  const eventDate = new Date(event.created_at);
  const dateKey = eventDate.toISOString().split('T')[0]; // "2026-01-25"
  const hour = eventDate.getHours();
  const key = `${dateKey}_${hour}`;
  
  if (!byDatetime[key]) {
    byDatetime[key] = { whatsapp: 0, form: 0 };
  }
  
  if (event.event_type === "whatsapp_click") {
    byDatetime[key].whatsapp++;
  } else if (event.event_type === "form_submit") {
    byDatetime[key].form++;
  }
}

// Converte para array ordenado
const byDatetimeArray = Object.entries(byDatetime)
  .map(([key, counts]) => {
    const [date, hour] = key.split('_');
    return { date, hour: parseInt(hour), ...counts };
  })
  .sort((a, b) => {
    // Ordena por data desc, depois hora desc
    if (a.date !== b.date) return b.date.localeCompare(a.date);
    return b.hour - a.hour;
  });
```

#### Renderizacao da Tabela

```tsx
<Card>
  <CardHeader>
    <CardTitle className="text-sm font-medium">
      Conversoes por Data/Hora
    </CardTitle>
  </CardHeader>
  <CardContent>
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Data</TableHead>
          <TableHead>Hora</TableHead>
          <TableHead className="text-right">WhatsApp</TableHead>
          <TableHead className="text-right">Formulario</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {stats.by_datetime.map((row) => (
          <TableRow key={`${row.date}_${row.hour}`}>
            <TableCell>{formatDate(row.date)}</TableCell>
            <TableCell>{row.hour}:00</TableCell>
            <TableCell className="text-right" style={{ color: "hsl(142, 76%, 36%)" }}>
              {row.whatsapp}
            </TableCell>
            <TableCell className="text-right text-primary">
              {row.form}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  </CardContent>
</Card>
```

---

### Arquivos a Modificar

| Arquivo | Alteracao |
|---------|-----------|
| `supabase/functions/ab-stats/index.ts` | Adicionar agregacao `by_datetime` |
| `src/pages/AdminAB.tsx` | Adicionar interface e tabela de conversoes |

---

### Limite de Linhas

Para evitar tabelas muito longas, limitaremos a exibicao aos ultimos 50 registros (combinacoes de data/hora com pelo menos 1 evento).

