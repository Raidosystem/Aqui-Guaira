# Aqui Guaíra — destinos exclusivos

Esta é a lista permitida para agentes, scripts e operações deste projeto. Conferir identidade antes de ler ou escrever. Não usar recursos de outro projeto nem valores antigos encontrados no histórico ou em scripts de implantação. Se houver divergência, interromper a operação dependente.

| Recurso | Destino permitido |
| --- | --- |
| GitHub | https://github.com/Raidosystem/Aqui-Guaira |
| Remote Git | https://github.com/Raidosystem/Aqui-Guaira.git |
| Branch de produção | `main` |
| Supabase | https://supabase.com/dashboard/project/kdyjebtzuniisxecaslm |
| API Supabase | https://kdyjebtzuniisxecaslm.supabase.co |
| Vercel | https://vercel.com/radiosystem/aqui-guaira |
| ID Vercel | `prj_rmgsbHY7DxJOhJeK7neukBb370iy` |
| Equipe Vercel | `radiosystem` / `team_dnmuHkJ2MWu49wRYLR4BMqte` |
| Site | https://aquiguaira.com.br |

As prévias devem pertencer ao mesmo ID de projeto Vercel. Não criar outro projeto como alternativa. Preservar os links públicos existentes de parceiros e ferramentas; esses links não autorizam administrar seus ambientes.

## Configuração e proteção

- O cliente depende de `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY`; nunca usar chave de serviço no frontend.
- Não usar fallback para outro Supabase. O cliente rejeita URL fora da lista e chave JWT de outro projeto/papel.
- Não copiar segredos para relatórios, commits ou mensagens. Arquivos de ambiente sensíveis permanecem locais.
- Não executar os SQL históricos de `supabase/` automaticamente: vários são procedimentos administrativos, não uma sequência segura de migrations.
- Não alterar banco, Storage, Auth, RLS, domínios ou permissões como efeito colateral de uma publicação visual.
- Confirmar `git remote get-url origin`, branch/HEAD e `.vercel/project.json` antes de push/deploy. A configuração da Vercel deve apontar para o GitHub desta tabela.

## Entrega autorizada em 28/09/2026

O usuário autorizou publicar o layout aprovado depois de um backup restaurável e da revisão dos caminhos e integrações. Essa entrega mantém as páginas e funções existentes, sem migrations. Ver `PUBLICACAO-LAYOUT.md` para plano, evidências, limites e recuperação. Novas implementações seguem pedidos posteriores.
