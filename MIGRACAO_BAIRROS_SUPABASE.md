# 🚀 Migração: Sistema de Bairros para Supabase

Este guia explica como migrar o sistema "Serviços por Bairro" de arquivos JSON locais para o Supabase, tornando tudo 100% online.

## 📋 Pré-requisitos

- Acesso ao painel do Supabase (https://supabase.com)
- Projeto Supabase já configurado
- SQL Editor aberto no Supabase

## 🔧 Passo a Passo

### 1️⃣ Criar a Estrutura no Supabase

1. Acesse o Supabase Dashboard
2. Vá em **SQL Editor**
3. Clique em **New Query**
4. Copie todo o conteúdo do arquivo: `supabase/bairros-servicos-sistema.sql`
5. Cole no editor e clique em **Run** (ou pressione Ctrl+Enter)

✅ **O que foi criado:**
- Tabela `bairros` - Lista de todos os bairros
- Tabela `setores_coleta` - 4 setores com calendários
- Tabela `informacoes_municipio` - Dados gerais da cidade
- Políticas RLS (segurança)
- Índices para performance

### 2️⃣ Inserir os Bairros

1. Ainda no **SQL Editor**, crie uma **New Query**
2. Copie todo o conteúdo do arquivo: `supabase/inserir-bairros-guaira.sql`
3. Cole no editor e clique em **Run**

✅ **O que foi inserido:**
- 87 bairros únicos (removidas duplicatas)
- Associação com setores de coleta
- Serviços essenciais de cada bairro
- Agenda de coletas

### 3️⃣ Verificar os Dados

Execute estas queries para confirmar:

```sql
-- Ver total de bairros
SELECT COUNT(*) as total_bairros FROM bairros;

-- Ver bairros por setor
SELECT setor_coleta, COUNT(*) as total 
FROM bairros 
GROUP BY setor_coleta 
ORDER BY setor_coleta;

-- Ver os 4 setores
SELECT numero, semana, array_length(bairros, 1) as qtd_bairros 
FROM setores_coleta 
ORDER BY numero;

-- Ver informações do município
SELECT municipio, uf, atualizado_em FROM informacoes_municipio;
```

Resultados esperados:
- **Total de bairros:** 87
- **Setores:** 4 setores cadastrados
- **Informações:** Guaíra-SP cadastrado

## 🔄 Atualizar o Código React

### Opção A: Usar o Hook Customizado (Recomendado)

O arquivo `src/hooks/use-bairros.ts` já foi criado com hooks prontos:

```tsx
import { useBairros, useSetoresColeta, useInformacoesMunicipio } from '@/hooks/use-bairros';

function ServicosPorBairro() {
  const { data: bairros, isLoading } = useBairros();
  const { data: setores } = useSetoresColeta();
  const { data: infoMunicipio } = useInformacoesMunicipio();
  
  if (isLoading) return <div>Carregando...</div>;
  
  // Usar bairros, setores, infoMunicipio...
}
```

### Opção B: Buscar Diretamente

```tsx
import { supabase } from '@/lib/supabase';
import { useQuery } from '@tanstack/react-query';

const { data: bairros } = useQuery({
  queryKey: ['bairros'],
  queryFn: async () => {
    const { data } = await supabase
      .from('bairros')
      .select('*')
      .order('nome_exibicao', { ascending: true });
    return data;
  }
});
```

## 📝 Modificações Necessárias

### Arquivo: `src/pages/ServicosPorBairro.tsx`

**ANTES (usando JSON local):**
```tsx
import bairrosData from "@/data/bairros-guaira.json";
import coletaData from "@/data/coleta-lixo-guaira.json";

const BAIRROS = bairrosData.bairros;
const SETORES_COLETA = coletaData.setores;
```

**DEPOIS (usando Supabase):**
```tsx
import { useBairros, useSetoresColeta, useInformacoesMunicipio } from '@/hooks/use-bairros';

function ServicosPorBairro() {
  const { data: bairros = [], isLoading: loadingBairros } = useBairros();
  const { data: setores = [], isLoading: loadingSetores } = useSetoresColeta();
  const { data: infoMunicipio, isLoading: loadingInfo } = useInformacoesMunicipio();
  
  const isLoading = loadingBairros || loadingSetores || loadingInfo;
  
  // Resto do código continua igual, mas usando:
  // - bairros ao invés de BAIRROS
  // - setores ao invés de SETORES_COLETA
  // - infoMunicipio ao invés de dados hardcoded
}
```

## 🎯 Vantagens da Migração

### ✅ Antes (JSON Local)
- ❌ Dados só no código
- ❌ Precisa rebuild para atualizar
- ❌ Duplicatas no JSON (97 → 87 bairros)
- ❌ Sem validação de dados
- ❌ Difícil de gerenciar

### ✅ Depois (Supabase)
- ✅ Dados atualizáveis em tempo real
- ✅ Atualização sem rebuild
- ✅ Dados únicos garantidos
- ✅ Validação automática
- ✅ Interface admin para gerenciar
- ✅ Backup automático
- ✅ Escalável

## 🔐 Segurança (RLS)

As políticas configuradas garantem:

- **Leitura pública:** Todos podem ver bairros e setores
- **Escrita restrita:** Apenas admins podem adicionar/editar
- **Autenticação:** Via tabela `usuarios` existente

## 📊 Estatísticas da Migração

```
Total de registros:
├── Bairros: 87 (removidas 10 duplicatas)
├── Setores de Coleta: 4
├── Calendários: 48 meses (4 setores × 12 meses)
└── Informações Municipais: 1

Mapeamento de Setores:
├── Setor 1: 20 bairros
├── Setor 2: 21 bairros  
├── Setor 3: 25 bairros
└── Setor 4: 22 bairros

⚠️ Nota: Alguns bairros não possuem setor definido
    e precisarão ser classificados manualmente
```

## 🐛 Solução de Problemas

### Erro: "relation 'bairros' does not exist"
**Solução:** Execute o arquivo `bairros-servicos-sistema.sql` primeiro

### Erro: "duplicate key value violates unique constraint"
**Solução:** Tabela já tem dados. Use `TRUNCATE` ou rode o script novamente (usa UPSERT)

### Erro: "permission denied for table bairros"
**Solução:** Verifique se as políticas RLS foram criadas corretamente

### Bairros sem setor
**Solução:** Execute este SQL para atualizar manualmente:
```sql
UPDATE bairros 
SET setor_coleta = 1 
WHERE slug = 'nome-do-bairro-slug';
```

## 🚀 Deploy e Testes

### Testar Localmente
1. Execute os SQLs no Supabase
2. Atualize `ServicosPorBairro.tsx` para usar hooks
3. Teste a busca de bairros
4. Teste os detalhes de cada bairro
5. Verifique os calendários de coleta

### Deploy em Produção
1. Faça commit das mudanças
2. Push para o repositório
3. Vercel fará rebuild automático
4. Sistema funcionará 100% online

## 📞 Suporte

Se encontrar problemas:
1. Verifique os logs no Supabase Dashboard
2. Use o SQL Editor para queries de debug
3. Confira as políticas RLS na aba Authentication

## 🎉 Próximos Passos

Após a migração, você pode:
1. Criar painel admin para gerenciar bairros
2. Adicionar calendário de 2027
3. Incluir mais serviços essenciais
4. Criar sistema de notificações de coleta
5. Adicionar mapa interativo dos setores

---

**Criado em:** 28/01/2026  
**Versão:** 1.0  
**Sistema:** Aqui Guaíra - Serviços por Bairro
