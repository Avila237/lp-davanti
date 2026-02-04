

## Corrigir Rastreamento de Cliques WhatsApp

### Diagnostico

A investigacao revelou que:
- O banco de dados tem apenas 1 clique WhatsApp registrado (em 29/01, secao "test_beacon")
- A Edge Function `track-ab-beacon` funciona perfeitamente quando testada manualmente
- Os envios de formulario estao sendo registrados normalmente (16 eventos)
- O problema esta no lado do cliente - a Beacon API nao esta conseguindo enviar os dados

### Causa Raiz Identificada

A Beacon API (`navigator.sendBeacon`) tem limitacoes:
1. Nao envia cabecalho `Origin` de forma confiavel em todos os navegadores
2. O Content-Type e enviado como `text/plain` sem charset em alguns casos
3. Erros sao silenciosos - nao ha como saber se o envio falhou

### Solucao Proposta

Implementar um sistema hibrido que garante o envio usando duas estrategias:

#### 1. Estrategia Principal: Fetch com keepalive

Usar `fetch()` com a opcao `keepalive: true`, que funciona como Beacon mas permite tratamento de erros:

```typescript
const trackWhatsAppClick = async (section: string) => {
  const data = {
    event_type: "whatsapp_click",
    variant: currentVariant,
    section,
  };

  // Tenta fetch com keepalive (mais confiavel que Beacon)
  try {
    await fetch(`${SUPABASE_URL}/functions/v1/track-ab-beacon`, {
      method: "POST",
      body: JSON.stringify(data),
      headers: { "Content-Type": "application/json" },
      keepalive: true, // Garante envio mesmo ao sair da pagina
    });
  } catch {
    // Fallback: tenta Beacon API
    navigator.sendBeacon(
      `${SUPABASE_URL}/functions/v1/track-ab-beacon`,
      new Blob([JSON.stringify(data)], { type: "application/json" })
    );
  }
};
```

#### 2. Usar Blob para Beacon API

Quando usar Beacon API, enviar como `Blob` com tipo correto:

```typescript
const blob = new Blob([JSON.stringify(data)], { type: "application/json" });
navigator.sendBeacon(url, blob);
```

### Arquivos a Modificar

| Arquivo | Alteracao |
|---------|-----------|
| `src/hooks/use-ab-test.ts` | Implementar fetch com keepalive + fallback Beacon com Blob |
| `supabase/functions/track-ab-beacon/index.ts` | Adicionar suporte a Content-Type application/json |

### Detalhes Tecnicos

#### Alteracao 1: use-ab-test.ts

Modificar a funcao `trackWhatsAppClickBeacon`:

```typescript
const trackWhatsAppClickBeacon = useCallback(async (section: string) => {
  const currentVariant = localStorage.getItem(AB_STORAGE_KEY) || "whatsapp";
  
  // Envia para GTM
  trackABEvent("ab_test_whatsapp_click", { section });
  
  const data = {
    event_type: "whatsapp_click",
    variant: currentVariant,
    section,
  };
  
  const url = `${SUPABASE_URL}/functions/v1/track-ab-beacon`;
  
  // Estrategia 1: fetch com keepalive (mais confiavel)
  try {
    await fetch(url, {
      method: "POST",
      body: JSON.stringify(data),
      headers: { "Content-Type": "application/json" },
      keepalive: true,
    });
  } catch {
    // Estrategia 2: Beacon API com Blob (fallback)
    try {
      const blob = new Blob([JSON.stringify(data)], { type: "application/json" });
      navigator.sendBeacon(url, blob);
    } catch {
      // Silencioso - analytics nao deve quebrar UX
    }
  }
}, [trackABEvent]);
```

#### Alteracao 2: track-ab-beacon/index.ts

Ajustar o parser de Content-Type para aceitar mais formatos:

```typescript
// Parse body - aceita mais formatos de Content-Type
const contentType = req.headers.get("content-type") || "";

const text = await req.text();
let body;

try {
  body = JSON.parse(text);
} catch {
  return new Response(
    JSON.stringify({ error: "Invalid JSON" }),
    { status: 400, headers: corsHeaders }
  );
}
```

### Resultado Esperado

- Cliques no WhatsApp serao registrados de forma confiavel
- Compatibilidade com todos os navegadores modernos
- Fallback automatico se uma estrategia falhar
- Sem impacto na experiencia do usuario

