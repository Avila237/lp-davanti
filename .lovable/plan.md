

## Melhorar Velocidade Percebida da Pagina de Carreiras

### Problema

A query ao banco retorna rapido (200 OK em milissegundos), mas a pagina mostra apenas o texto "Carregando vagas..." sem nenhum feedback visual, o que da a sensacao de lentidao. Alem disso, o React Query nao tem `staleTime` configurado, causando refetches desnecessarios a cada navegacao.

### Solucao

1. **Adicionar skeleton loading** -- substituir o texto "Carregando vagas..." por cards skeleton animados (shimmer) que simulam o layout final, dando feedback visual imediato.

2. **Configurar cache do React Query** -- adicionar `staleTime` de 5 minutos para que, ao voltar a pagina, os dados aparecam instantaneamente do cache.

### Alteracoes

| Arquivo | O que muda |
|---------|-----------|
| `src/pages/Careers.tsx` | Substituir texto de loading por componente skeleton; adicionar `staleTime: 5 * 60 * 1000` na query |

### Detalhes Tecnicos

- Usar o componente `Skeleton` ja existente em `src/components/ui/skeleton.tsx`
- Renderizar 3 cards skeleton com altura similar ao `JobCard` real
- Adicionar `staleTime: 300000` (5 min) no `useQuery` para cache entre navegacoes
- Nenhuma alteracao no backend necessaria

