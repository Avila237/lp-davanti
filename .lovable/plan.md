

## Corrigir Header da Pagina de Detalhe da Vaga

### Problema

A pagina de detalhe da vaga (`/carreiras/:id`) nao tem o header azul gradiente (hero) que a pagina de listagem tem. O conteudo aparece colado no topo, sem identidade visual consistente.

### Solucao

Adicionar um mini-hero com o gradiente azul na pagina de detalhe, mostrando o titulo da vaga e o departamento. Isso cria consistencia visual com a pagina de listagem.

### Alteracoes

| Arquivo | O que muda |
|---------|-----------|
| `src/pages/CareerDetail.tsx` | Substituir o `<Header />` + `<div className="pt-20">` por um hero compacto com gradiente azul contendo o titulo da vaga, link de voltar e info basica |
| `src/components/careers/JobDetail.tsx` | Remover o link "Voltar as vagas" e o titulo `<h1>` do componente, pois eles passam para o hero do CareerDetail |

### Resultado Visual

```text
+--------------------------------------------------+
| [Logo]              Menu            [WhatsApp]    |  <- Header fixo
+--------------------------------------------------+
| ============= GRADIENTE AZUL =================== |
|                                                   |
|   <- Voltar as vagas                              |
|   Auxiliar Administrativo          (titulo)       |
|   Administrativo · Matriz - Ijui   (subtitulo)   |
|                                                   |
| ================================================= |
|                                                   |
|   [Sidebar]          [Conteudo da vaga]           |
|                                                   |
+--------------------------------------------------+
```

### Detalhes Tecnicos

- Reutilizar a classe `gradient-hero` ja existente no projeto
- Manter o `<Header />` dentro do CareerDetail (ele ja e fixo com `fixed top-0`)
- O hero tera `pt-28 pb-10 md:pt-36 md:pb-14` para respeitar o header fixo
- Remover o `<h1>` e o link "Voltar" de dentro do `JobDetail.tsx` para evitar duplicacao
- Mover o link "Voltar as vagas" para dentro do hero (sobre o gradiente azul, em branco)
