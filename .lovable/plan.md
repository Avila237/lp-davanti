

## Rastreamento de Origem Instagram/Meta Ads

### O Problema

Hoje voce nao consegue diferenciar no Google Analytics se o visitante veio:
- Direto do Google/YouTube Ads
- Do Instagram (clicando no link da bio)

### A Solucao

Criar uma rota especial `/instagram` (ou `/insta`, `/bio`) que redireciona para a home (`/`) mas **adiciona automaticamente os parametros UTM** necessarios para o Google Analytics identificar essa origem.

### Como Vai Funcionar

```text
Usuario clica no link da bio do Instagram
          |
          v
Acessa: lp-davanti.lovable.app/instagram
          |
          v
Redireciona para: lp-davanti.lovable.app/?utm_source=instagram&utm_medium=social&utm_campaign=bio_link
          |
          v
Google Analytics registra origem como "instagram / social"
```

### Implementacao

#### 1. Criar Pagina de Redirecionamento

Criar `src/pages/InstagramRedirect.tsx` que:
- Detecta a URL de destino
- Adiciona os parametros UTM
- Redireciona instantaneamente para a home

#### 2. Adicionar Rota no App.tsx

```typescript
<Route path="/instagram" element={<InstagramRedirect />} />
<Route path="/insta" element={<InstagramRedirect />} />
<Route path="/bio" element={<InstagramRedirect />} />
```

Varias rotas para flexibilidade (voce escolhe qual usar na bio).

#### 3. Parametros UTM Configurados

| Parametro | Valor | Descricao |
|-----------|-------|-----------|
| utm_source | instagram | Origem do trafego |
| utm_medium | social | Tipo de canal |
| utm_campaign | bio_link | Identificador da campanha |

### Beneficios

- **Zero configuracao no GTM/GA4**: Os parametros UTM sao detectados automaticamente
- **Relatorios separados**: No GA4 voce vera "instagram / social" como fonte distinta
- **URLs curtas**: /instagram ou /insta sao faceis de lembrar
- **Extensivel**: Facil adicionar novas origens no futuro (ex: /tiktok, /facebook)

### No Google Analytics

Apos implementar, no GA4 voce vera no relatorio de Aquisicao:

| Origem / Midia | Usuarios | Conversoes |
|----------------|----------|------------|
| google / cpc | 150 | 12 |
| youtube / video | 80 | 5 |
| instagram / social | 45 | 8 |
| (direct) / (none) | 30 | 2 |

### Arquivo a Criar

| Arquivo | Descricao |
|---------|-----------|
| `src/pages/InstagramRedirect.tsx` | Componente de redirecionamento com UTMs |

### Arquivo a Modificar

| Arquivo | Alteracao |
|---------|-----------|
| `src/App.tsx` | Adicionar rotas /instagram, /insta, /bio |

### URL Final para Usar na Bio

Apos publicar, voce usara uma destas URLs na bio do Instagram:

- `lp-davanti.lovable.app/instagram`
- `lp-davanti.lovable.app/insta`
- `lp-davanti.lovable.app/bio`

Todas funcionam igual e redirecionam para a home com os parametros UTM corretos.

