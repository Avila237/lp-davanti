

## Pagina de Carreiras - Trabalhe na Davanti

### Visao Geral

Criar uma subpagina `/carreiras` com a mesma identidade visual da LP, inspirada no Notion Careers, para divulgar vagas de emprego. As vagas serao gerenciadas dinamicamente pelo banco de dados, e a candidatura sera feita via WhatsApp com mensagem pre-preenchida sobre a vaga.

### Estrutura da Pagina

A pagina tera duas "visoes":

1. **Listagem de vagas** (`/carreiras`) -- inspirada no Notion Careers
   - Header da Davanti (reutilizado)
   - Hero compacto com titulo "Trabalhe na Davanti" e texto motivacional
   - Filtro por departamento/loja (ex: Matriz, Loja 2, Loja 3)
   - Lista de vagas agrupadas por departamento, cada uma mostrando: titulo, loja/local, tipo (CLT, estagio, etc.)
   - Footer da Davanti (reutilizado)

2. **Detalhe da vaga** (`/carreiras/:id`) -- inspirada no Ashby/Notion
   - Layout com sidebar esquerda (local, tipo de contrato, departamento)
   - Conteudo principal com descricao da vaga, requisitos e beneficios
   - Botao "Candidatar-se pelo WhatsApp" que abre o WhatsApp com mensagem pre-preenchida com o nome da vaga

### Banco de Dados

Uma tabela `job_listings` para armazenar as vagas:

| Coluna | Tipo | Descricao |
|--------|------|-----------|
| id | uuid | Identificador unico |
| title | text | Titulo da vaga (ex: "Consultor(a) de Vendas") |
| department | text | Departamento (ex: "Vendas", "Administrativo") |
| location | text | Loja (ex: "Matriz", "Loja 2") |
| employment_type | text | Tipo (ex: "CLT", "Estagio", "Meio Periodo") |
| description | text | Descricao completa da vaga (Markdown) |
| requirements | text | Requisitos (Markdown) |
| benefits | text | Beneficios oferecidos (Markdown) |
| whatsapp_number | text | Numero do WhatsApp para candidatura |
| is_active | boolean | Se a vaga esta ativa (default: true) |
| created_at | timestamptz | Data de criacao |

RLS: Leitura publica (SELECT) para vagas ativas, sem INSERT/UPDATE/DELETE via cliente.

### Fluxo do Candidato

```text
Acessa /carreiras
    |
    v
Ve lista de vagas agrupadas por departamento
    |
    v
Clica em uma vaga
    |
    v
Acessa /carreiras/:id com detalhes completos
    |
    v
Clica "Candidatar-se pelo WhatsApp"
    |
    v
WhatsApp abre com mensagem:
"Ola, tenho interesse na vaga de [Titulo da Vaga] na [Loja]. Vi pelo site da Davanti."
```

### Arquivos a Criar

| Arquivo | Descricao |
|---------|-----------|
| `src/pages/Careers.tsx` | Pagina de listagem de vagas |
| `src/pages/CareerDetail.tsx` | Pagina de detalhe da vaga |
| `src/components/careers/CareersHero.tsx` | Hero compacto da pagina de carreiras |
| `src/components/careers/JobCard.tsx` | Card de cada vaga na listagem |
| `src/components/careers/JobDetail.tsx` | Conteudo detalhado da vaga |
| `src/components/careers/DepartmentFilter.tsx` | Filtro por departamento/loja |

### Arquivos a Modificar

| Arquivo | Alteracao |
|---------|-----------|
| `src/App.tsx` | Adicionar rotas `/carreiras` e `/carreiras/:id` |

### Design Visual

- Mesma paleta: navy escuro (`hsl(222,47%,11%)`), dourado (`hsl(45,93%,47%)`), fundo branco
- Header e Footer reutilizados da LP principal
- Cards das vagas com `shadow-elegant` e hover `shadow-glow`
- Hero compacto com `gradient-hero` (navy)
- Pagina de detalhe com layout sidebar + conteudo, limpo e tipografico como o Ashby

### Gestao das Vagas

As vagas serao gerenciadas pelo banco de dados do Lovable Cloud. Para adicionar, editar ou remover vagas, voce podera usar o painel do backend diretamente. A pagina refletira automaticamente as vagas ativas cadastradas.

