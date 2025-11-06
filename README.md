# Aqui Guaíra – Portal da Cidade

Portal comunitário de Guaíra (SP) desenvolvido em React + TypeScript com Vite, Tailwind e componentes shadcn-ui.

## Funcionalidades

- Card informativo "Sobre Guaíra" com âncora.
- Diretório de empresas com filtros (nome, categoria, bairro, distância) e favoritos persistidos.
- Página "Meus Locais" listando somente favoritos com filtros simplificados.
- Mural da cidade com postagem (drag & drop de imagens) e status pendente.
- Página "Sua Empresa" para cadastro (CNPJ, dados completos, logo, banner) e login.
- Modal detalhado de empresas com ações de copiar (WhatsApp, telefone, site, e‑mail) e toasts.
- Paginação traduzida (Anterior / Próximo) e UI responsiva.
- Upload avançado com preview e remoção para logo e banner.

## Stack

- React 18 + TypeScript
- Vite
- Tailwind CSS + tailwindcss-animate
- shadcn-ui (Radix + design system)
- React Hook Form + Zod (validações)
- Lucide Icons
- TanStack Query (reservado para futuros dados dinâmicos)

## Scripts

```sh
npm i        # instala dependências
npm run dev  # ambiente de desenvolvimento
npm run build # build para produção
npm run preview # pré-visualização do build
```

## Estrutura resumida

```
src/
	pages/        # Páginas principais (Index, Mural, Empresas, MeusLocais, SuaEmpresa)
	components/   # Componentes reutilizáveis e UI (shadcn)
	lib/          # Utilitários e dados mock
	hooks/        # Hooks personalizados
public/
	images/       # Imagens (logo.png, publi.png)
```

## Próximos passos sugeridos

- Persistir cadastros reais de empresas (API / backend).
- Autenticação real para login de empresas.
- Moderação de Mural com painel administrativo.
- Otimização de imagens (compressão, formatos modernos).
- Internacionalização (pt-BR / en-US) se necessário.

## Licença

Uso interno / comunitário. Ajuste conforme necessidade.

