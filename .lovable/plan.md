

## Corrigir Scroll ao Navegar para /carreiras

### Problema

Ao clicar em "Trabalhe Conosco" no rodape, a pagina `/carreiras` abre mas nao rola para o topo. O usuario ve o meio ou final da pagina.

### Causa

O React Router nao faz scroll para o topo automaticamente ao navegar entre rotas. E necessario adicionar esse comportamento manualmente.

### Solucao

Adicionar um componente `ScrollToTop` que escuta mudancas de rota e faz `window.scrollTo(0, 0)` automaticamente.

### Alteracoes

| Arquivo | O que muda |
|---------|-----------|
| `src/components/ScrollToTop.tsx` | Criar componente que usa `useLocation` e `useEffect` para rolar ao topo a cada mudanca de rota |
| `src/App.tsx` | Importar e adicionar `<ScrollToTop />` dentro do `<BrowserRouter>`, antes das rotas |

### Detalhes Tecnicos

- Criar `ScrollToTop.tsx` com:
  ```
  useEffect(() => { window.scrollTo(0, 0); }, [pathname]);
  ```
- Colocar `<ScrollToTop />` logo apos o `<BrowserRouter>` (ou `<Router>`) no `App.tsx`
- Isso corrige o problema para todas as navegacoes entre paginas, nao apenas "Trabalhe Conosco"

