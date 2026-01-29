

## Diagnostico: Tracking de WhatsApp nao registra eventos

### Problema Identificado

O dashboard mostra 100% de conversoes no formulario porque os cliques de WhatsApp nao estao sendo registrados no banco de dados. A analise do banco confirma isso:

- `form_submit`: 10 eventos registrados
- `whatsapp_click`: 0 eventos registrados

### Causa Raiz

O sistema atual tem uma assimetria critica no tracking:

| Variante | Como e registrado | Confiabilidade |
|----------|-------------------|----------------|
| Formulario (B) | Server-side na `submit-lead` | Alta - sempre funciona |
| WhatsApp (A) | Client-side via `track-ab-event` | Baixa - pode falhar silenciosamente |

O tracking do WhatsApp falha silenciosamente porque:

1. **Navegacao interrompe a requisicao**: Quando o usuario clica no CTA, o `window.open()` acontece imediatamente apos chamar `trackWhatsAppClick()`. A chamada async para a edge function pode ser cancelada quando o navegador abre uma nova aba

2. **Falhas sao silenciosas**: O `catch` vazio na funcao `trackEventToDatabase()` engole qualquer erro

3. **Nao ha await no fluxo principal**: O `handleClick` nao espera a requisicao completar antes de abrir o WhatsApp

### Solucao Proposta

Modificar o componente `ABTestCTA.tsx` para garantir que o tracking seja enviado ANTES de abrir o WhatsApp, usando uma das seguintes estrategias:

#### Estrategia Recomendada: Beacon API

Usar `navigator.sendBeacon()` que e projetado especificamente para enviar dados de analytics quando o usuario esta saindo da pagina:

```text
+-------------------+
| Usuario clica CTA |
+-------------------+
         |
         v
+---------------------------+
| sendBeacon() envia dados  |
| (nao bloqueia, garantido) |
+---------------------------+
         |
         v
+-------------------+
| Abre WhatsApp     |
+-------------------+
```

### Alteracoes Necessarias

#### 1. Novo endpoint dedicado para Beacon (`track-ab-beacon`)

Criar uma edge function minimalista que aceita dados via Beacon API:

- Aceita `POST` com `content-type: text/plain` ou `application/x-www-form-urlencoded`
- Valida apenas campos essenciais (sem HMAC para simplicidade do Beacon)
- Rate limiting por IP
- Insere diretamente na tabela `ab_events`

#### 2. Atualizar `use-ab-test.ts`

Adicionar funcao `trackWhatsAppClickBeacon` que usa Beacon API:

```typescript
function trackWhatsAppClickBeacon(section: string) {
  const variant = localStorage.getItem(AB_STORAGE_KEY) || "whatsapp";
  const data = JSON.stringify({
    event_type: "whatsapp_click",
    variant,
    section,
  });
  
  navigator.sendBeacon(
    `${SUPABASE_URL}/functions/v1/track-ab-beacon`,
    data
  );
}
```

#### 3. Atualizar `ABTestCTA.tsx`

Usar a nova funcao Beacon para cliques de WhatsApp:

```typescript
const handleClick = () => {
  if (isFormVariant) {
    // Variante B permanece igual
    setIsModalOpen(true);
  } else {
    // Variante A: Usa Beacon para garantir envio
    trackWhatsAppClickBeacon(section);
    window.open(whatsappUrl, "_blank");
  }
};
```

### Arquivos a Modificar/Criar

| Arquivo | Alteracao |
|---------|-----------|
| `supabase/functions/track-ab-beacon/index.ts` | Novo endpoint para Beacon API |
| `src/hooks/use-ab-test.ts` | Adicionar funcao Beacon |
| `src/components/ABTestCTA.tsx` | Usar Beacon para WhatsApp |
| `supabase/config.toml` | Registrar nova funcao |

### Beneficios da Solucao

1. **Garantia de envio**: Beacon API e projetada para analytics e garante envio mesmo durante navegacao
2. **Nao bloqueia UX**: O usuario ve o WhatsApp abrir instantaneamente
3. **Simplicidade**: Endpoint dedicado sem complexidade de HMAC
4. **Retrocompativel**: Nao quebra funcionalidade existente

### Consideracoes de Seguranca

O endpoint Beacon sera mais simples que o atual `track-ab-event`, mas ainda tera:
- Rate limiting por IP
- Validacao de campos (event_type, variant, section)
- Restricao de origem CORS

