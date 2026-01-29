# ✅ RESUMO: Arquivos SQL para Sistema Online

## 📁 Arquivos Criados

### 1. `supabase/bairros-servicos-sistema.sql`
**O que faz:** Cria toda a estrutura de tabelas no Supabase
- ✅ Tabela `bairros` (87 bairros)
- ✅ Tabela `setores_coleta` (4 setores com calendários)
- ✅ Tabela `informacoes_municipio` (dados de Guaíra-SP)
- ✅ Políticas RLS (segurança)
- ✅ Índices (performance)
- ✅ Triggers (atualização automática)

### 2. `supabase/inserir-bairros-guaira.sql`
**O que faz:** Insere todos os 87 bairros no banco
- ✅ Remove duplicatas (97 → 87 bairros)
- ✅ Associa bairros aos setores (1-4)
- ✅ Inclui serviços essenciais
- ✅ Inclui agendas de coleta

### 3. `src/hooks/use-bairros.ts`
**O que faz:** Hooks React para buscar dados do Supabase
- ✅ `useBairros()` - Lista todos os bairros
- ✅ `useBairro(slug)` - Busca 1 bairro
- ✅ `useSetoresColeta()` - Lista os 4 setores
- ✅ `useSetorColeta(numero)` - Busca 1 setor
- ✅ `useInformacoesMunicipio()` - Dados da cidade
- ✅ `useBairrosPorSetor(setor)` - Bairros de um setor

### 4. `scripts/migrar-bairros-para-supabase.py`
**O que faz:** Script Python que gerou o SQL de inserção
- ✅ Lê os arquivos JSON
- ✅ Remove duplicatas
- ✅ Mapeia setores
- ✅ Gera SQL otimizado

### 5. `MIGRACAO_BAIRROS_SUPABASE.md`
**O que faz:** Documentação completa da migração
- ✅ Passo a passo detalhado
- ✅ Exemplos de código
- ✅ Solução de problemas
- ✅ Estatísticas da migração

## 🚀 Como Executar (ORDEM CORRETA)

### Passo 1: Supabase Dashboard → SQL Editor
```sql
-- Execute PRIMEIRO: Cria as tabelas
-- Arquivo: supabase/bairros-servicos-sistema.sql
```

### Passo 2: Supabase Dashboard → SQL Editor  
```sql
-- Execute SEGUNDO: Insere os bairros
-- Arquivo: supabase/inserir-bairros-guaira.sql
```

### Passo 3: Código React
```tsx
// Substitua em src/pages/ServicosPorBairro.tsx:

// REMOVER:
import bairrosData from "@/data/bairros-guaira.json";
import coletaData from "@/data/coleta-lixo-guaira.json";
const BAIRROS = bairrosData.bairros;

// ADICIONAR:
import { useBairros, useSetoresColeta } from '@/hooks/use-bairros';

function ServicosPorBairro() {
  const { data: bairros = [], isLoading } = useBairros();
  const { data: setores = [] } = useSetoresColeta();
  
  if (isLoading) return <div>Carregando...</div>;
  
  // Usar 'bairros' ao invés de 'BAIRROS'
  // Usar 'setores' ao invés de 'coletaData.setores'
}
```

## 📊 Resultados Esperados

```
Banco de Dados:
├── 3 tabelas criadas
├── 87 bairros inseridos (duplicatas removidas)
├── 4 setores de coleta cadastrados
├── 1 município configurado (Guaíra-SP)
└── Políticas RLS ativas

Performance:
├── Cache de 30 minutos (bairros)
├── Cache de 1 hora (setores e município)
├── Índices otimizados
└── Queries rápidas

Segurança:
├── Leitura pública permitida
├── Escrita apenas para admins
└── RLS habilitado
```

## ✅ Checklist Final

Antes do deploy, confirme:

- [ ] SQL 1 executado com sucesso (bairros-servicos-sistema.sql)
- [ ] SQL 2 executado com sucesso (inserir-bairros-guaira.sql)
- [ ] Verificar: `SELECT COUNT(*) FROM bairros;` retorna 87
- [ ] Verificar: `SELECT COUNT(*) FROM setores_coleta;` retorna 4
- [ ] Hook `use-bairros.ts` criado em `src/hooks/`
- [ ] Código React atualizado para usar hooks
- [ ] Teste local funcionando
- [ ] Commit e push para produção

## 🎯 Benefícios

| Antes (JSON) | Depois (Supabase) |
|--------------|-------------------|
| Dados estáticos | ✅ Dados dinâmicos |
| 97 bairros (duplicatas) | ✅ 87 bairros únicos |
| Rebuild para atualizar | ✅ Atualização em tempo real |
| Sem validação | ✅ Validação automática |
| Difícil gerenciar | ✅ Interface admin |
| Sem backup | ✅ Backup automático |

## 📞 Verificação Rápida

Execute no Supabase SQL Editor para confirmar:

```sql
-- Deve retornar 87
SELECT COUNT(*) FROM bairros;

-- Deve retornar 4 linhas
SELECT * FROM setores_coleta ORDER BY numero;

-- Deve retornar "Guaíra-SP"
SELECT municipio, uf FROM informacoes_municipio;

-- Bairros por setor
SELECT 
  setor_coleta,
  COUNT(*) as total
FROM bairros
GROUP BY setor_coleta
ORDER BY setor_coleta;
```

## ⚡ Deploy Rápido (Se tiver pressa)

```bash
# 1. No Supabase: Execute os 2 SQLs
# 2. Faça commit e push
git add .
git commit -m "feat: migrar sistema de bairros para Supabase"
git push

# 3. Vercel fará deploy automático
# 4. Sistema 100% online! 🎉
```

---

**Status:** ✅ Pronto para executar  
**Tempo estimado:** 10-15 minutos  
**Complexidade:** Média  
**Reversível:** Sim (mantenha os JSONs como backup)
