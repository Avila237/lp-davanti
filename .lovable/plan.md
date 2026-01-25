

## Plano de Correção: Tracking de Conversões do Formulário no GA

### Problema Identificado

Os eventos do formulário estão sendo enviados ao `dataLayer`, mas há inconsistências que podem impedir o Google Analytics de detectar as conversões corretamente:

1. **Race condition no estado `variant`**: O callback `trackABEvent` pode capturar o valor inicial do estado antes do `useEffect` atribuir a variante correta
2. **Evento `ab_test_form_success` incompleto**: Não inclui todos os dados necessários (como `button_text`)
3. **Falta de parâmetro `event_category`**: O GA4 pode precisar de categorização adicional para detectar as conversões

### Solução Proposta

#### 1. Corrigir o hook `use-ab-test.ts`

Modificar o `trackABEvent` para buscar a variante diretamente do `localStorage` em vez de depender do estado React, garantindo consistência:

```typescript
const trackABEvent = useCallback((eventName: string, data: Record<string, any> = {}) => {
  if (typeof window !== "undefined" && window.dataLayer) {
    // Busca diretamente do localStorage para garantir valor correto
    const currentVariant = localStorage.getItem(AB_STORAGE_KEY) || variant;
    
    window.dataLayer.push({
      event: eventName,
      ab_variant: currentVariant,
      event_category: 'ab_test',
      ...data,
    });
  }
}, [variant]);
```

#### 2. Melhorar o `ContactFormModal.tsx`

Adicionar mais contexto aos eventos disparados para facilitar a configuração no GTM:

```typescript
// No handleSubmit, após sucesso:
onTrackEvent?.("ab_test_form_submit", { 
  section, 
  success: true,
  event_category: 'conversion',
  event_label: `form_${section}`
});
```

#### 3. Enriquecer o evento `ab_test_form_success` no `ABTestCTA.tsx`

Passar mais dados no callback de sucesso:

```typescript
const handleFormSuccess = () => {
  trackABEvent("ab_test_form_success", { 
    section,
    button_text: buttonText,
    event_category: 'conversion',
    event_label: `form_success_${section}`
  });
};
```

---

### Detalhes Técnicos

#### Arquivos a Modificar

| Arquivo | Alteração |
|---------|-----------|
| `src/hooks/use-ab-test.ts` | Buscar variante do localStorage; adicionar `event_category` |
| `src/components/ContactFormModal.tsx` | Adicionar `event_category` e `event_label` aos eventos |
| `src/components/ABTestCTA.tsx` | Enriquecer evento `ab_test_form_success` com mais dados |

#### Eventos que Serão Enviados ao dataLayer

Após a correção, os eventos terão esta estrutura:

```javascript
// Abertura do formulário
{
  event: "ab_test_form_open",
  ab_variant: "form",
  event_category: "ab_test",
  section: "hero",
  button_text: "Conversar no WhatsApp"
}

// Envio do formulário (sucesso)
{
  event: "ab_test_form_submit",
  ab_variant: "form",
  event_category: "conversion",
  event_label: "form_hero",
  section: "hero",
  success: true
}

// Confirmação de sucesso
{
  event: "ab_test_form_success",
  ab_variant: "form",
  event_category: "conversion",
  event_label: "form_success_hero",
  section: "hero",
  button_text: "Conversar no WhatsApp"
}
```

---

### Configuração Necessária no GTM

Após a implementação, será necessário configurar no painel do GTM:

1. **Criar Trigger** para o evento `ab_test_form_submit` com `success = true`
2. **Criar Tag GA4** de Evento de Conversão vinculada a esse trigger
3. **Marcar como Conversão** no painel do GA4

---

### Passos de Implementação

1. Atualizar `src/hooks/use-ab-test.ts` com a leitura direta do localStorage
2. Atualizar `src/components/ContactFormModal.tsx` com event_category
3. Atualizar `src/components/ABTestCTA.tsx` com dados enriquecidos
4. Testar localmente verificando o console e o dataLayer
5. Validar no GTM Preview Mode que os eventos chegam corretamente

