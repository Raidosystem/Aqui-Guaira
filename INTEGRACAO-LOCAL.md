# Integração local — 28/09/2026

> Registro histórico da etapa local. O pedido posterior do usuário autorizou backup e publicação. O estado e os limites dessa entrega estão em `PUBLICACAO-LAYOUT.md`, e os destinos exclusivos estão em `AMBIENTE-DO-PROJETO.md`.

Base clonada de Raidosystem/Aqui-Guaira: `6cecc6046c6352ce93571a0f5a6b62fc4b436cff`.
Branch local: `codex/integracao-maquete-local`.

- Integração: http://127.0.0.1:5174/
- Maquete preservada: http://127.0.0.1:5173/
- Início anterior para comparação (somente desenvolvimento): http://127.0.0.1:5174/inicio-original

## Resultado desta etapa

Visual da maquete na inicial, fotos originais de Guaíra copiadas com hashes idênticos, cabeçalho compartilhado com os módulos do portal e paleta aplicada aos componentes existentes. Busca da inicial transfere nome, bairro e categoria para Empresas. O mapa usa coordenadas do catálogo e OpenStreetMap, sem solicitar localização automaticamente. Empresa e mural usam dados públicos do backend configurado. Marketplace apresenta estado vazio real, sem os produtos fictícios da maquete. Acesso de entrada/cadastro reutiliza o diálogo existente.

Empresas em destaque substitui a grade de categorias por um carrossel local dos parceiros indicados pelo usuário: ACIG, All Import e Grupo RaVal, um anúncio a cada 5 segundos. Logos locais e links para os sites oficiais; origem dos arquivos em `public/partners/FONTES.md`. Fundo externo transparente, anúncios internos com identidade e cores próprias. Nenhum parceiro foi cadastrado ou alterado no backend.

O usuário corrigiu o ajuste desktop: manter a largura do Marketplace; baixar seu topo e reduzir sua altura para o menu ocupar toda a largura. A referência final do menu é a captura da página Serviços por Bairro fornecida às 16:08:20. Abaixo de 1201px esses últimos ajustes não são aplicados.

## Verificações

- Build Vite concluído. Mantidos avisos de tamanho de bundle/importação dinâmica já presentes na estrutura do projeto.
- ESLint dos arquivos novos TypeScript/TSX: passou. `git diff --check`: passou.
- TypeScript: 7 diagnósticos em Dashboard.tsx/EmpresasAntigo.tsx. A mesma checagem sobre os fontes de HEAD retornou os mesmos 7 diagnósticos, sem erro adicional da integração. Foi usado override de execução `--ignoreDeprecations 5.0` devido à configuração original `6.0`; o tsconfig não foi alterado.
- GETs públicos Supabase: empresas aprovadas/ativas retornou 1 registro; mural aprovado retornou 1 registro; anúncios ativos retornou 0. As três consultas retornaram HTTP 200.
- Chrome: busca ALL-IMPORT + Centro transferida e 1 resultado exibido; categoria Alimentação e Bebidas aplicada com 0 resultados e mensagem explícita; mapa carregado com marcador; cadastro abriu na aba Criar Conta sem envio; navegação Serviços abriu o módulo existente.
- Desktop 1440px: cabeçalho em toda a largura (1392px), atualizado para 72px de altura e fontes de 13px, Empresas destacado e Ferramentas com Busca CEP/Currículo. Marketplace manteve a largura original e 16px de separação abaixo do cabeçalho. Cabeçalho também conferido em 1240px.
- Mobile 390×844: página sem overflow horizontal; navegação, faixa de seis atalhos e rodapé adaptados. Ajuste vertical do Marketplace permanece exclusivo acima de 1200px. Rodapé da inicial agora contém Emergências e Portal, conforme números e destinos fornecidos pelo usuário.
- Console da inicial consultado sem erros/avisos; imagens carregadas.

## Limites

As páginas internas mantêm seus layouts e contratos existentes, com novo cabeçalho/paleta. Não se declarou uma reimplementação completa de cada módulo.

Login autenticado, cadastro enviado, gravação de favoritos, uploads e fluxos administrativos não foram executados: a validação local não autoriza gravações remotas. O marketplace está vazio, portanto cartões preenchidos, ordenação por preço e detalhe com registro real ainda não têm prova real. Há lacuna anterior no repositório: os cards da página Marketplace apontam para `/anuncio/:id`, rota ausente em App.tsx; não foi ampliado o escopo para corrigir esse fluxo nesta etapa.

Nenhum mock de backend foi usado como prova. Nenhuma migration, commit, push, PR, merge ou deploy foi executado. A leitura final de origin/main retornou o mesmo SHA da clonagem. Backup da versão remota será preparado após acertarmos a versão local e antes de qualquer discussão de envio, conforme pedido do usuário.
