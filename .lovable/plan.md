

## Painel Admin Unificado

### Resumo

Transformar a pagina `/admin/ab` em um painel admin completo com duas abas:
1. **Relatorio A/B** (funcionalidade atual, mantida intacta)
2. **Vagas de Emprego** (CRUD completo para gerenciar `job_listings`)

A autenticacao continua usando a mesma senha ADMIN_PASSWORD via edge function. Uma vez autenticado, o admin pode navegar entre as abas sem precisar digitar a senha novamente.

### Arquitetura

O gerenciamento de vagas precisa de uma edge function dedicada (`admin-jobs`) que valida a senha e executa operacoes CRUD com service role (bypass RLS), ja que a tabela `job_listings` nao permite INSERT/UPDATE/DELETE pelo cliente.

```text
Tela de login (senha)
    |
    v
Validacao via edge function (ADMIN_PASSWORD)
    |
    v
Painel com Tabs
    |-- Relatorio A/B (dados via ab-stats, como hoje)
    |-- Vagas de Emprego (CRUD via admin-jobs)
         |-- Listar vagas (ativas + inativas)
         |-- Criar nova vaga
         |-- Editar vaga existente
         |-- Ativar/desativar vaga
         |-- Excluir vaga
```

### Arquivos a Criar

| Arquivo | Descricao |
|---------|-----------|
| `supabase/functions/admin-jobs/index.ts` | Edge function para CRUD de vagas com autenticacao por ADMIN_PASSWORD |
| `src/components/admin/AdminLayout.tsx` | Layout do painel com tabs (Relatorio A/B, Vagas) |
| `src/components/admin/ABReport.tsx` | Conteudo do relatorio A/B (extraido do AdminAB.tsx atual) |
| `src/components/admin/JobsManager.tsx` | Listagem e gerenciamento de vagas |
| `src/components/admin/JobForm.tsx` | Formulario de criar/editar vaga |

### Arquivos a Modificar

| Arquivo | Alteracao |
|---------|-----------|
| `src/pages/AdminAB.tsx` | Refatorar para usar AdminLayout com tabs; a tela de senha fica neste nivel e repassa a senha autenticada para os componentes filhos |

### Edge Function `admin-jobs`

Recebe a senha + acao no body. Acoes suportadas:

- `list` -- retorna todas as vagas (ativas e inativas)
- `create` -- cria nova vaga
- `update` -- atualiza vaga existente (por id)
- `delete` -- remove vaga (por id)
- `toggle` -- ativa/desativa vaga (por id)

Reutiliza a mesma logica de autenticacao (constant-time comparison, rate limiting) da `ab-stats`.

### Interface do Gerenciador de Vagas

- Tabela com todas as vagas mostrando: titulo, departamento, local, tipo, status (ativa/inativa)
- Botao "Nova Vaga" abre formulario
- Cada linha tem acoes: editar, ativar/desativar, excluir
- Formulario com campos: titulo, departamento, local, tipo de contrato, numero WhatsApp, descricao, requisitos, beneficios
- Campos de texto longo (descricao, requisitos, beneficios) usam textarea

### Detalhes Tecnicos

- A senha e armazenada em estado React apos autenticacao bem-sucedida e enviada em cada chamada de edge function (stateless, sem tokens/sessoes)
- Tabs implementadas com componente Tabs do Radix UI (ja disponivel no projeto)
- A aba de Relatorio A/B mantem exatamente a mesma interface e logica atuais
- Nenhuma alteracao no banco de dados e necessaria (a tabela `job_listings` ja existe com todos os campos)
- Nenhuma alteracao nas RLS policies (a edge function usa service role para bypass)

