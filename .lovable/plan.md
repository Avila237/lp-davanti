

## Adicionar Botao "Trabalhe Conosco" no Rodape

### O que muda

Adicionar um botao "Trabalhe Conosco" no rodape (`src/components/Footer.tsx`) que direciona para a pagina `/carreiras`.

### Alteracoes

| Arquivo | O que muda |
|---------|-----------|
| `src/components/Footer.tsx` | Importar `Link` do `react-router-dom`; adicionar botao "Trabalhe Conosco" na area de botoes do rodape, usando `Link to="/carreiras"` com estilo consistente aos demais botoes |

### Detalhes Tecnicos

- Importar `Link` de `react-router-dom` e o icone `Briefcase` de `lucide-react`
- Adicionar um novo `Button` com `variant="outline"` e estilo identico aos botoes "Ligar" e "Ver rota mais proxima" (`bg-white/10 text-white border-white/30 hover:bg-white/20`)
- Usar `asChild` no Button para envolver o `Link to="/carreiras"`
- Posicionar o botao junto aos demais na linha de CTAs do rodape

