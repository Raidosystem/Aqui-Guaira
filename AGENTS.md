# Integração local do Aqui Guaíra

- Repositório de origem: `Raidosystem/Aqui-Guaira`; cópia de trabalho separada em `Downloads/Aqui-Guaira-integracao`.
- Decisão do usuário: usar o visual da maquete `../Aqui-Guaira-maquete-interativa` com as funcionalidades do repositório.
- Destinos exclusivos: ler `AMBIENTE-DO-PROJETO.md` antes de qualquer operação. Não acessar outro repositório, projeto Supabase ou projeto Vercel para este trabalho.
- Em 28/09/2026 o usuário autorizou expressamente backup, revisão de todos os caminhos e publicação deste layout em `Raidosystem/Aqui-Guaira` / `radiosystem/aqui-guaira`, após verificar o backup e os contratos afetados. Essa autorização substitui a restrição local anterior somente para esta entrega. Não estender a autorização a releases futuras.
- Não alterar schema, dados, policies, grants, credenciais ou configurações de outros projetos por inferência. Publicação deve preservar o backend existente, com evidência e possibilidade de retorno à versão anterior.
- Preservar autenticação, permissões e contratos existentes. Não executar cadastros, uploads, favoritos ou outras gravações remotas durante a revisão visual.
- Usar fotos reais de Guaíra da maquete. Dados demonstrativos não podem ser apresentados como dados públicos reais.
- Manter a maquete separada como referência. Preview local da integração na porta 5174; maquete na porta 5173.

## Ajuste visual aprovado — desktop

Correção explícita do usuário: NÃO estreitar o Marketplace lateralmente. Manter as larguras originais das colunas; baixar o início e reduzir a altura do Marketplace para que o cabeçalho ocupe toda a largura acima dele. Aplicar apenas acima de 1200px; preservar tablet e celular.

Referência exata do menu da página inicial no computador: captura fornecida pelo usuário `~/Desktop/Captura de Tela 2026-09-28 às 16.08.20.png`, mostrando o cabeçalho de Serviços por Bairro. Reutilizar o mesmo cabeçalho: largura total, logo à esquerda, navegação central, Entrar/Cadastrar à direita e seletor de tema visível, com a mesma tipografia, tamanhos e espaçamentos. O item ativo na inicial deve ser Início.

## Rodapé da página inicial

Substituir as colunas Explore e Comunidade por Emergências e Portal. Emergências deve conter Guarda Civil Municipal (199, 3331 2273, 3331 6064), Polícia Civil (3331 2360, 3331 2500) e Polícia Militar (190, 3331 3881, 3332 4362). Portal deve conter Termos de Uso, Política de Privacidade e Contato, preservando os destinos fornecidos pelo usuário (`/servicos-por-bairro#`). Organizar os serviços lado a lado no computador e empilhados no celular, mantendo a marca, Faça parte e os créditos.

## Cabeçalho e faixa de atalhos — refinamento posterior

Manter a faixa abaixo da busca. Os seis acessos escolhidos expressamente pelo usuário são: Vagas de Empregos, Aqui Resolve, Mural, Saúde na Prática, Ocorrências e Pets e Adoção. Retirá-los do menu Mais; concentrar Mural e Vagas na faixa para não repetir no cabeçalho. Preservar os acessos também na navegação móvel.

Destacar Empresas como principal acesso no cabeçalho e melhorar a apresentação da marca. Exibir Ferramentas como menu destacado, com Busca CEP e Currículo usando os links já existentes. Manter o cabeçalho em toda a largura e as larguras originais do Marketplace. Este refinamento substitui a exigência anterior de reproduzir todos os detalhes do cabeçalho da captura de Serviços.

No cabeçalho, Painel da Cidade deve ocupar o lugar de Serviços, com destino `/painel-cidade`. Manter Serviços em Mais, com destino `/servicos-por-bairro`, sem repetir Painel da Cidade nesse menu.

## Empresas em destaque — parceiros

Substituir Destaques da cidade por Empresas em destaque, com ACIG, All Import e Grupo RaVal identificados como parceiros do Aqui Guaíra conforme pedido do usuário. Mostrar uma empresa por vez no mesmo espaço, alternando a cada 5 segundos, com logo sem cortes, uma frase curta e link para o respectivo site. Manter o tamanho do anúncio estável entre as três empresas e adaptar ao celular. O logo do Grupo RaVal deve ser recriado com base na foto fornecida `~/Downloads/images.jpeg`, preservando o fundo escuro, símbolo e letras douradas. Não usar a foto inteira da folha de adesivos no anúncio.

Refinamento visual solicitado: logos maiores e anúncios mais bem apresentados. Correção expressa: SOMENTE o fundo externo e as laterais do bloco Empresas em destaque devem ficar transparentes. O anúncio interno e o fundo atrás de cada logo devem manter cores sólidas e destaque: branco/verde para ACIG, preto/laranja para All Import e preto/azul escuro/dourado para RaVal. Preservar os arquivos de marca e o fundo dos demais painéis. A troca automática a cada 5 segundos não deve parar apenas por passar o mouse sobre o anúncio; manter controle explícito de pausa e respeito ao movimento reduzido.

Ampliar Empresas em destaque para ocupar toda a largura da coluna principal, aumentando proporcionalmente os logos sem cortes ou deformação. Mover o cartão Guaíra é a nossa casa para o lugar da imagem/frase Juntos, fazemos uma Guaíra melhor, abaixo do Marketplace e ao lado do login. Preservar exatamente a largura dessa posição lateral e o acesso a Sobre Guaíra; remover somente a antiga frase/cartão substituído.
