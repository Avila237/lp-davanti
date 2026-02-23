

## Ajustar Logo para Redirecionar à Página Principal

### Problema

Atualmente, o logo e o nome "Óptica Davanti" no Header usam uma âncora `#inicio` com scroll suave. Isso funciona na página principal, mas em outras páginas (como `/carreiras`) não leva o usuário de volta à home.

### Solução

Substituir o `<a href="#inicio">` por um `<Link to="/">` do React Router. Quando o usuário já estiver na home (`/`), fazer scroll suave até o topo. Quando estiver em outra página, navegar para `/`.

### Alterações

| Arquivo | O que muda |
|---------|-----------|
| `src/components/Header.tsx` | Importar `Link` e `useLocation` do `react-router-dom`; substituir o `<a>` do logo por lógica que usa `Link to="/"` ou scroll suave dependendo da rota atual |

### Detalhes Técnicos

- Importar `useLocation` e `Link` de `react-router-dom`
- Usar `useLocation().pathname` para verificar se o usuário está na home
- Se `pathname === "/"`: fazer scroll suave para o topo (comportamento atual)
- Se `pathname !== "/"`: usar `Link to="/"` para navegar à home
- Manter a mesma aparência visual (logo + texto "Óptica Davanti")

