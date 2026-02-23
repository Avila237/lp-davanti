

## Corrigir Navegação do Menu em Páginas Internas

### Problema

Os links do menu (Início, Produtos, Diferenciais, etc.) usam âncoras como `#produtos`, `#lojas`, etc. Isso funciona na página principal, mas em outras páginas como `/carreiras` os elementos com esses IDs não existem, então nada acontece ao clicar.

### Solução

Atualizar o `handleNavClick` no Header para detectar se o usuário está na home. Se não estiver, navegar para `/#secao` (home + âncora). Ao chegar na home, o scroll suave será feito automaticamente para a seção correta.

### Alterações

| Arquivo | O que muda |
|---------|-----------|
| `src/components/Header.tsx` | Importar `useNavigate`; no `handleNavClick`, se `pathname !== "/"`, usar `navigate("/" + href)` para ir à home com a âncora |

### Detalhes Técnicos

- Importar `useNavigate` de `react-router-dom`
- No `handleNavClick`: verificar `isHome`
  - Se **sim**: manter comportamento atual (scroll suave)
  - Se **não**: usar `navigate("/" + href)` para navegar à home — o `ScrollToTop` levará ao topo, e depois será necessário um pequeno `setTimeout` para fazer scroll até a seção após a navegação
- Alternativa mais simples: quando fora da home, usar `navigate("/")` e passar o hash como state, e na Index tratar o scroll. Porém a abordagem mais direta é usar `navigate("/" + href)` e na home detectar o hash na URL para fazer scroll.

A implementação mais limpa:
1. Quando fora da home, navegar para `/{href}` (ex: `/#produtos`)
2. Na página Index, adicionar um `useEffect` que verifica `location.hash` e faz scroll suave até o elemento correspondente

