# Publicação do layout — 28/09/2026

## Plano e limites da entrega

1. Conferir os destinos de `AMBIENTE-DO-PROJETO.md`.
2. Copiar o Git remoto, gerar bundle completo e arquivo do código, restaurar em outra pasta e verificar integridade.
3. Comparar arquivos, rotas e contratos com a versão publicada.
4. Exercitar os módulos públicos, as consultas da inicial, imagens e navegação no Chrome; conferir desktop/celular e temas.
5. Construir na Vercel com variáveis de produção, mantendo o domínio principal na versão anterior durante a validação.
6. Registrar a entrega no GitHub e conferir a implantação ligada ao mesmo commit no domínio principal.

Autorização: pedido expresso do usuário em 28/09/2026 para backup e publicação deste layout. Não inclui migrations ou alterações de permissões. Os componentes existentes continuam responsáveis pelas operações de cadastro, login, favoritos, uploads e administração.

## Backup e recuperação

- Versão anterior: `6cecc6046c6352ce93571a0f5a6b62fc4b436cff`.
- Tag remota: `backup/antes-layout-2026-09-28`, confirmada por `git ls-remote`.
- Backup local: `~/Backups/Aqui-Guaira/20260928-171843/`.
- Bundle: `github-completo.bundle`, SHA-256 `c935c7076179905892032966eb89040aa7128e89aa820a68c9fa94599a7d6945`.
- Código: `codigo-antes-do-layout.tar.gz`, SHA-256 `80fdcfa60a02e7dc10be8475231e021a3b8b089381c1173dabb0c73d6ecc21b2`.
- Restauração executada: clone do bundle em outra pasta, `git fsck --full`, HEAD e árvore conferidos. Árvore: `0025e1f341972e93ac686d0ac0fe51e195b8d420`.
- Deploy anterior: `dpl_9EqNHt8hJeCCYdu6JFTwFMBJZnRE`, `https://aqui-guaira-jnbm5439t-radiosystem.vercel.app`.

Se houver regressão desta entrega, conferir o projeto vinculado e retornar o domínio ao deploy anterior com o fluxo de rollback da Vercel. Para desfazer código, criar um novo commit de reversão; nunca reescrever histórico ou usar force push. Para recuperação independente: `git clone github-completo.bundle restauracao`. Este backup cobre código e histórico Git; não é um backup dos dados Supabase. Nenhuma migration faz parte da entrega.

## Preservação conferida

- Todos os 214 arquivos rastreados na versão anterior permanecem no projeto.
- Todas as 22 declarações de rotas de páginas, mais a rota de erro, permanecem registradas.
- `src/lib/supabase.ts` mantém integralmente as funções existentes a partir da criação do cliente. A configuração agora rejeita URL de outro projeto e chave JWT com referência/papel indevido, sem fallback antigo.
- `AuthContext`, telas administrativas, formulários, scripts SQL, configuração Vercel, dependências e lockfile foram preservados.
- A inicial anterior está em `OriginalHome.tsx`, com o cabeçalho anterior; a rota de comparação só existe em desenvolvimento.
- A busca da inicial usa o catálogo existente, transferindo nome e bairro. Mantida a compatibilidade com links antigos de categoria e empresa.
- O seletor de tema continua funcional: a nova paleta clara não sobrescreve as variáveis do tema escuro.

## Matriz de caminhos

Verificação visual de abertura no Chrome, além de leituras reais quando indicadas. A abertura de um formulário não comprova sua gravação.

| Caminho | Evidência e limite |
| --- | --- |
| `/` | Dados reais de empresa/mural; marketplace vazio; mapa; busca; três logos; carrossel; menus e diálogo de cadastro |
| `/empresas` | Catálogo retornou 1 empresa; busca por nome/bairro e acesso ao perfil |
| `/perfil-de-empresa` | Sem ID retorna ao catálogo; com ID abre perfil real e contatos |
| `/perfil-de-empresa/:slug` | Perfil real `all-import` aberto na Vercel por slug |
| `/mural` | Publicação existente carregada; nenhuma publicação criada |
| `/mural/meus-posts` | Sem sessão redireciona ao mural |
| `/meus-locais` | Exibe a exigência de login, sem gravar favoritos |
| `/sua-empresa` | Formulário de cadastro existente abre; envio não executado |
| `/dashboard` | Sem sessão retorna a Sua Empresa com aviso de acesso negado |
| `/admin` | Formulário administrativo existente abre |
| `/admin/dashboard` | Sem sessão retorna ao login administrativo |
| `/marketplace` | Categorias reais carregadas e estado vazio de anúncios |
| `/farmacia-plantao` | Tela e busca existentes abrem |
| `/saude-na-pratica` | 26 unidades exibidas; documentos privados não acessados |
| `/servicos-por-bairro` | Bairros e busca existentes abrem |
| `/aqui-resolve` | Profissional existente carregado |
| `/vagas-emprego` | Vaga existente carregada |
| `/achados-perdidos` | Tela e filtros existentes abrem |
| `/pets-perdidos` | Tela e filtros existentes abrem |
| `/painel-cidade` | Abas existentes abrem |
| `/escolas-creches` | Unidades e contatos existentes exibidos |
| `/ocorrencias` | Tela abre e exige login; existe pendência anterior de estrutura no backend |
| `*` | Componente de página não encontrada preservado |

## Contratos externos testados

- GitHub: leitura de refs, clone integral, push da tag de backup e releitura.
- Filesystem: bundle, hash, clone de restauração e integridade Git.
- Supabase autorizado: projeto `ACTIVE_HEALTHY`, PostgreSQL 17.6.1.063; consultas reais pelo cliente público (`anon`) com os filtros e campos usados na inicial.
- HTTP 200: `empresas` (1 registro), `listings_with_category` (0), `mural_posts` (1), configurações públicas Auth e imagem pública do Storage.
- Vercel: projeto/organização/repositório/branch conferidos; build remoto com variáveis de produção e Chrome em `https://aqui-guaira-c9d7swvza-radiosystem.vercel.app` (`dpl_22FGkuKTvsrkDtSEA5bRxboPqXAK`, STAGED durante a revisão). Domínio principal confirmado ainda no deploy anterior nessa etapa.

## Mocks usados

Nenhum mock foi usado como prova de backend. Valores sintéticos de URL/JWT foram usados apenas para verificar a rejeição local de configurações indevidas, sem requisições para esses destinos.

## Contratos reais executados

Leituras públicas e carregamento no navegador descritos acima; navegação para o perfil real; verificações do serviço de hospedagem e do backup. Navegação pode acionar os contadores de visualização já existentes. Não foram criados usuários, anúncios, posts, favoritos, documentos ou registros administrativos de teste.

## Gaps não provados e pendências anteriores

- Login com credenciais válidas e fluxos de gravação/administração não foram declarados aprovados sem execução. O código desses fluxos foi mantido. Solicitação de acesso manual à prévia foi apresentada ao usuário.
- Não há anúncios ativos para validar um anúncio real. A rota `/anuncio/:id` referenciada pelo Marketplace já estava ausente no código original; não foi criada nesta entrega visual.
- O backend atual não apresentou a relação `ocorrencias` na conferência de catálogo; GET público retornou HTTP 404 / `PGRST205`. O módulo anterior já a referencia. Uma implementação/correção desse fluxo depende de revisão específica do banco.
- Foram observadas configurações de segurança legadas que requerem revisão separada. Nenhuma policy, grant ou configuração Auth foi alterada para passar nos testes.
- TypeScript mantém 7 diagnósticos anteriores em `Dashboard.tsx`/`EmpresasAntigo.tsx`, comparados com a base. Build e lint dos novos componentes passam. O build preserva avisos de tamanho de bundle e dependências antigas.
- Links de Termos/Privacidade/Contato mantêm os destinos provisórios fornecidos pelo usuário; não representam documentos legais publicados.

Esta é uma publicação visual com preservação de código e navegação; não representa certificação integral de todos os fluxos históricos nem correção das pendências de backend acima.
