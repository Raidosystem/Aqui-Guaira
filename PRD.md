# Aqui Guaíra - Portal da Cidade

Portal comunitário local para a cidade de Guaíra, SP, conectando moradores, empresas e serviços públicos em uma plataforma moderna e intuitiva.

**Experience Qualities**:
1. **Acolhedor**: Interface familiar que reflete o calor humano de uma comunidade pequena
2. **Confiável**: Design profissional que inspira credibilidade para empresas locais e serviços públicos
3. **Funcional**: Navegação clara e direta para encontrar informações rapidamente

**Complexity Level**: Light Application (multiple features with basic state)
- Múltiplas seções interativas com persistência de dados local, filtros dinâmicos e formulários de cadastro

## Essential Features

### Banner Hero Rotativo
- **Functionality**: Slider automático de banners promocionais com controles manuais
- **Purpose**: Destacar empresas locais e eventos da cidade gerando receita publicitária
- **Trigger**: Carregamento da página inicial
- **Progression**: Autoplay 5s → pausa no hover → navegação manual → loop infinito
- **Success criteria**: Transições suaves, responsivo, pausas corretamente

### Diretório de Empresas
- **Functionality**: Grade filtrada de empresas locais com busca e categorização
- **Purpose**: Facilitar descoberta de comércios e serviços locais
- **Trigger**: Acesso à seção empresas ou busca na home
- **Progression**: Busca/filtro → resultados dinâmicos → detalhes da empresa → contato
- **Success criteria**: Busca instantânea, filtros funcionais, informações completas

### Mural da População
- **Functionality**: Feed de postagens dos moradores com fotos e moderação
- **Purpose**: Criar engajamento comunitário e comunicação entre moradores
- **Trigger**: Envio de nova postagem ou visualização do feed
- **Progression**: Formulário → upload mídia → moderação → publicação → interação
- **Success criteria**: Upload funcional, moderação clara, feed atualizado

### Reportar Problemas
- **Functionality**: Sistema de tickets para problemas urbanos com geolocalização
- **Purpose**: Facilitar comunicação de problemas para a administração pública
- **Trigger**: Formulário de reporte de problema
- **Progression**: Formulário → localização → upload evidência → protocolo → acompanhamento
- **Success criteria**: Geolocalização precisa, uploads funcionais, status claro

### Sobre Guaíra
- **Functionality**: Página informativa com dados oficiais e pontos turísticos
- **Purpose**: Informar moradores e visitantes sobre a cidade
- **Trigger**: Navegação para seção "Sobre"
- **Progression**: Leitura → exploração de pontos turísticos → links externos
- **Success criteria**: Informações atualizadas, fontes confiáveis, navegação intuitiva

## Edge Case Handling
- **Conectividade**: Cache local para funcionar offline com dados básicos
- **Uploads grandes**: Compressão automática e validação de tamanho
- **Spam**: Rate limiting por IP e moderação obrigatória
- **Dados inválidos**: Validação rigorosa com mensagens claras de erro
- **Empresas duplicadas**: Verificação por CNPJ/nome antes do cadastro

## Design Direction
O design deve evocar profissionalismo municipal com toque humano - limpo e institucional mas acessível, refletindo a seriedade de um portal cívico sem perder o calor de uma comunidade pequena. Interface rica com informações densas mas bem organizadas.

## Color Selection
Triadic (três cores igualmente espaçadas) - usando verde institucional, azul confiança e laranja acolhimento para representar natureza, seriedade municipal e energia comunitária.

- **Primary Color**: Verde municipal `oklch(0.45 0.15 140)` - transmite natureza e oficialidade governamental
- **Secondary Colors**: Azul confiança `oklch(0.5 0.15 240)` para elementos informativos e links
- **Accent Color**: Laranja acolhimento `oklch(0.65 0.15 40)` para CTAs e destaques importantes
- **Foreground/Background Pairings**: 
  - Background (Branco `oklch(0.98 0 0)`): Texto escuro `oklch(0.15 0 0)` - Ratio 19.2:1 ✓
  - Primary (Verde `oklch(0.45 0.15 140)`): Texto branco `oklch(0.98 0 0)` - Ratio 6.8:1 ✓
  - Secondary (Azul `oklch(0.5 0.15 240)`): Texto branco `oklch(0.98 0 0)` - Ratio 5.4:1 ✓
  - Accent (Laranja `oklch(0.65 0.15 40)`): Texto escuro `oklch(0.15 0 0)` - Ratio 7.2:1 ✓

## Font Selection
Tipografia híbrida que combine autoridade institucional com acessibilidade - Inter para leitura fluida e títulos que não intimidem usuários menos familiarizados com tecnologia.

- **Typographic Hierarchy**:
  - H1 (Título do Portal): Inter Bold/32px/tight letter spacing
  - H2 (Seções): Inter SemiBold/24px/normal letter spacing  
  - H3 (Cards/Subtítulos): Inter Medium/18px/normal letter spacing
  - Body (Conteúdo): Inter Regular/16px/relaxed line-height
  - Small (Metadados): Inter Regular/14px/muted color

## Animations
Movimento sutil que reforce a credibilidade sem distrair - transições funcionais que guiem o olhar e confirmem ações, evitando excessos que comprometam a seriedade municipal.

- **Purposeful Meaning**: Animações discretas que reforcem a navegação e confirmem ações sem chamar atenção excessiva
- **Hierarchy of Movement**: Foco em transições de estado (hover, carregamento) e feedback de formulários

## Component Selection

- **Components**: 
  - Cards para empresas e postagens
  - Carousel para banner hero
  - Forms para cadastros e reportes
  - Tabs para organização de conteúdo
  - Badge para categorias e status
  - Dialog para detalhes expandidos
  - Input com máscaras para telefone/CNPJ
  - Textarea para descrições longas
  - Button com variantes (primary, secondary, ghost)

- **Customizations**: 
  - MapComponent personalizado para geolocalização
  - ImageUpload com preview e validação
  - StatusBadge para acompanhamento de tickets
  - CompanyCard com layout específico para negócios

- **States**: 
  - Buttons: rest/hover/active/disabled com feedback visual claro
  - Inputs: focus ring verde municipal, error states em vermelho suave
  - Cards: hover elevation sutil, selected state para filtros

- **Icon Selection**: Phosphor Icons com peso regular para clareza - MapPin para localização, Building para empresas, ChatCircle para mural, Warning para problemas

- **Spacing**: Sistema baseado em 4px (gap-4, p-6, m-8) para consistência visual e fácil manutenção

- **Mobile**: Layout empilhado com navegação por tabs, cards full-width, filtros em drawer lateral, touch targets mínimos de 44px