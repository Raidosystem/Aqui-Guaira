# Conferência visual da integração local

final result: passed

## Ampliação dos anúncios e mudança do cartão da cidade

- Anúncios agora ocupam toda a coluna principal. Em 1440px, área interna ampliada de 672,5×186px para 918×228px. Os três logos foram conferidos visualmente ampliados, carregados e com `object-fit: contain`, sem cortes ou distorção.
- Guaíra é a nossa casa foi movido para o espaço da antiga frase Juntos, fazemos uma Guaíra melhor, abaixo do Marketplace e ao lado do login. Existe somente um cartão; o antigo `.photo-quote` não está mais no DOM.
- Largura lateral preservada exatamente: 190,90625px antes e depois, dentro da coluna de 430px em desktop. Captura móvel em 390×844 confirma cartão de 161,8125px sem transbordamento, texto legível e botão Saiba mais contido.
- Clique no cartão navega para `/#sobre-guaira`. Fundo externo transparente, cores internas das marcas e código de rotação de 5000ms preservados. Prévia principal deixada com rotação ativa.
- Evidências: capturas dos três parceiros na aba Chrome 708057565; anúncio e cartão lateral em 390×844 na aba temporária 708057592. Build, ESLint do arquivo alterado e `git diff --check` passaram.

final result: passed

## Revisão vigente — carrossel de empresas parceiras

- Substituída a antiga grade de categorias em Destaques da cidade por Empresas em destaque, com ACIG, All Import e Grupo RaVal. As três marcas ocupam o mesmo anúncio, uma por vez.
- Fontes dos logos, sites consultados e prompt da reconstrução RaVal estão em `public/partners/FONTES.md`. O logo RaVal foi recriado a partir da foto fornecida e confirmado carregado na aba do usuário; foi corrigido o carregamento que havia falhado enquanto o arquivo ainda não existia.
- Composição refinada após feedback: logo maior à esquerda; identificação de parceria, chamada curta e acesso ao site à direita. Cores internas sólidas de cada marca preservadas. Somente o fundo externo/laterais da seção são transparentes, mostrando a foto normal da página. Os outros painéis mantêm o fundo creme.
- Evidências Chrome: aba do usuário 708057565 e aba de conferência 708057583. Capturas dos três anúncios em desktop; captura final RaVal em 390×844. DOM confirma fundo externo `rgba(0, 0, 0, 0)`, fundo interno RaVal `rgb(7, 19, 28)` e os três logos carregados. Sem rolagem horizontal no celular.
- Rotação medida em uma única chamada no navegador: ACIG em 1790625862608 ms, All Import em 1790625867728 ms e Grupo RaVal em 1790625872843 ms. Amostras a cada aproximadamente 5,12 segundos confirmam a sequência; intervalo configurado de 5000 ms. Altura do anúncio desktop estável em 186px.
- Controles de empresa anterior/próxima, seleção direta e pausa/início disponíveis. Seleção manual pausa a rotação; passar o mouse não interrompe a troca. Preferência de movimento reduzido inicia pausado.
- Conferência limitada à apresentação e navegação local. Não houve publicação, alteração no cadastro das empresas nem gravação remota.

final result: passed

## Referências e evidências

- Fonte visual inicial: http://127.0.0.1:5173/ e `/Users/gruporaval/Downloads/Aqui-Guaira-maquete-interativa/preview.jpg`.
- Fonte inicial do menu: `/Users/gruporaval/Desktop/Captura de Tela 2026-09-28 às 16.08.20.png` (2878×1214 pixels, captura em aproximadamente 2×, largura CSS equivalente 1439px). Refinamento posterior orientado pela captura `Captura de Tela 2026-09-28 às 16.17.47.png` e pelas escolhas explícitas de navegação do usuário.
- Implementação: http://127.0.0.1:5174/ — capturas Chrome da aba 708057566 exibidas inline nesta tarefa em 1440×900 CSS px, densidade 1×; captura móvel em 390×844. O instrumento forneceu imagens inline, sem caminho de arquivo persistente para a captura da implementação.
- Estado: inicial, visitante, empresa/mural reais carregados, marketplace vazio. A referência original tem conteúdo fictício e não representa o estado do banco.
- Comparação: referência e implementação apresentadas juntas na mesma chamada de comparação; comparação focal do menu com a captura fornecida e medidas DOM do mesmo componente em Serviços por Bairro. Para o menu, considerar somente a faixa do cabeçalho e normalizar mentalmente a captura fonte 2×; o restante da página Serviços não é a referência da inicial.

## Superfícies verificadas

- Tipografia: DM Sans nos controles, Playfair Display no hero/títulos. Após o refinamento, cabeçalho desktop com menu/botões 13px e altura 72px, marca maior, Empresas em dourado e Ferramentas com contorno dourado. Mobile mantém altura compacta de 64px.
- Espaçamento: grade da maquete preservada; corrigida sobreposição entre atalhos e destaques que existia no protótipo. Cabeçalho final ocupa toda a largura disponível, com margem superior de 12px e Marketplace começando 16px abaixo.
- Cores: verde escuro, creme e dourado da maquete; botões e contraste conferidos nas capturas.
- Imagens: fotos/brand fornecidos reutilizados; hashes das cópias conferidos. Mapa funcional substitui a imagem ilustrativa, com crédito ao OpenStreetMap.
- Conteúdo: dados comerciais fictícios substituídos por consultas reais e estados vazios. Mural/Vagas/Meus Locais correspondem a módulos existentes. Autenticação reutiliza diálogo real, em vez de apresentar os formulários simulados e login social da maquete como funcionais.

## Histórico de ajustes

1. A composição inicial mantinha sobreposição dos atalhos sobre Destaques; a integração usa altura automática no hero e separação antes da seção seguinte. Captura desktop posterior confirma que os blocos não se sobrepõem.
2. Pedido inicial de ajuste foi interpretado como estreitamento lateral. O usuário corrigiu: larguras originais restauradas, Marketplace reduzido verticalmente e posicionado sob cabeçalho de largura total. Captura posterior e DOM confirmam 430px de largura no Marketplace em 1440px.
3. Referência explícita de Serviços por Bairro: removidas diferenças desktop de logo/fonte/padding e seletor de tema. DOM nas duas rotas confirma cabeçalho 1392×64, top 12, fonte 12px e tema visível. Captura final confirma menu central e controles à direita.

Não há P0/P1/P2 visual pendente no escopo final da inicial e do cabeçalho. O item ativo é Início na página inicial, diferentemente de Serviços na captura fonte.

## Interações e limites

Busca combinada, categoria vazia, abertura de cadastro e navegação Serviços verificadas no navegador. Mobile sem overflow em 390px. Console da inicial sem erros na leitura efetuada. Nenhuma submissão autenticada nem gravação remota foi usada como teste. Os limites funcionais e erros de TypeScript anteriores estão em INTEGRACAO-LOCAL.md; o resultado visual não é autorização de publicação.

## Revisão vigente — cabeçalho, faixa e rodapé

- Evidência: Chrome, aba temporária 708057568, capturas inline em 1440×900 (inicial e rodapé), 1240×900 (cabeçalho de Empresas) e 390×844 (inicial, atalhos e rodapé). Sem rolagem horizontal nas medidas verificadas.
- Mantida a faixa de seis atalhos. Conteúdo final: Vagas de Empregos, Aqui Resolve, Mural, Saúde na Prática, Ocorrências e Pets e Adoção, na ordem solicitada. Ícones Lucide e descrições curtas; seis colunas no computador, duas linhas de três no celular.
- Menu Mais aberto e verificado: Painel da Cidade, Achados e Perdidos, Farmácia de Plantão, Escolas e Creches, Sua Empresa e Sobre Guaíra. Nenhum dos seis atalhos aparece nele.
- Ferramentas aberto e verificado: Busca CEP e Currículo apontam para as URLs originais centralizadas em `src/lib/ferramentas.ts`. Verificação de destinos e abertura do menu; não houve preenchimento nem envio nas ferramentas externas.
- Navegação móvel preserva todos os destinos e inclui destaque de Empresas e seção Ferramentas. Clique em Empresas fechou o menu e abriu `/empresas`, com o título Guia de Empresas visível.
- Rodapé: Explore e Comunidade substituídos por Emergências e Portal. Os três serviços e os oito números fornecidos foram conferidos; grupos lado a lado no desktop e empilhados no celular. Marca, Faça parte e créditos mantidos. Os três links de Portal usam o destino fornecido `/servicos-por-bairro#`; esta tarefa não criou páginas jurídicas ou de contato.
- Build e ESLint dos componentes alterados passaram. `git diff --check` passou. Sem P0/P1/P2 visual pendente neste escopo.

final result: passed
