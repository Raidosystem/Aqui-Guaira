# Atualização do Sistema de Cadastro de Usuários

## 📋 Resumo das Alterações

Este documento descreve as atualizações realizadas no sistema de cadastro de usuários do portal **Aqui Guaíra**, adicionando campos completos de cadastro e validações de unicidade.

## 🆕 Novos Campos Adicionados

### Formulário de Cadastro

O formulário de registro agora inclui os seguintes campos:

1. **Nome Completo** *(obrigatório)*
2. **CPF** *(obrigatório, único, 11 dígitos)*
3. **Telefone** *(obrigatório, com máscara)*
4. **Email** *(obrigatório, único)*
5. **Endereço Completo** *(obrigatório)*
6. **Bairro** *(obrigatório)*
7. **Cidade** *(padrão: Guaíra)*
8. **Estado** *(padrão: SP)*
9. **CEP** *(obrigatório, 8 dígitos)*
10. **Senha** *(obrigatório, mínimo 6 caracteres)*
11. **Confirmar Senha** *(obrigatório)*

### Máscaras de Formatação

- **CPF**: `000.000.000-00`
- **Telefone**: `(00) 00000-0000`
- **CEP**: `00000-000`

## 🔒 Validações Implementadas

### Validações de Unicidade

- **CPF**: Cada CPF pode criar apenas UMA conta
- **Email**: Cada email pode criar apenas UMA conta
- Validações implementadas tanto no frontend quanto no backend

### Validações de Formato

- **CPF**: Deve conter exatamente 11 dígitos numéricos
- **CEP**: Deve conter exatamente 8 dígitos numéricos
- **Senha**: Mínimo de 6 caracteres
- **Telefone**: Formatação automática com DDD

### Validações de Campos

- Todos os campos obrigatórios validados no frontend
- Mensagens de erro claras e específicas
- Confirmação de senha (deve coincidir)

## 🗄️ Alterações no Banco de Dados

### Arquivo SQL: `atualizar-usuarios-campos-completos.sql`

Este script SQL realiza as seguintes operações:

1. **Adiciona novos campos à tabela `usuarios`:**
   - `cpf` VARCHAR(11) UNIQUE
   - `telefone` VARCHAR(20)
   - `endereco` TEXT
   - `bairro` VARCHAR(100)
   - `cidade` VARCHAR(100) DEFAULT 'Guaíra'
   - `estado` VARCHAR(2) DEFAULT 'SP'
   - `cep` VARCHAR(8)

2. **Cria índices para performance:**
   - `idx_usuarios_cpf`
   - `idx_usuarios_email`
   - `idx_usuarios_telefone`

3. **Adiciona constraints de unicidade:**
   - `usuarios_cpf_unique`: Garante CPF único
   - `usuarios_email_unique`: Garante email único

4. **Adiciona validações de formato:**
   - `usuarios_cpf_check`: CPF deve ter 11 dígitos
   - `usuarios_cep_check`: CEP deve ter 8 dígitos

5. **Cria triggers automáticos:**
   - `trigger_validar_cpf_unico`: Valida CPF antes de inserir/atualizar
   - `trigger_validar_email_unico`: Valida email antes de inserir/atualizar

## 📁 Arquivos Modificados

### 1. `/src/components/LoginDialog.tsx`

**Alterações:**
- Adicionados 7 novos estados para os campos do formulário
- Implementadas máscaras de formatação automática (CPF, telefone, CEP)
- Adicionadas validações completas no `handleRegister`
- Formulário com scroll para acomodar todos os campos
- Layout responsivo em grid para cidade/estado e bairro/CEP

### 2. `/src/lib/supabase.ts`

**Alterações:**
- Função `criarOuLogarUsuario` atualizada com novos parâmetros:
  - `cpf`
  - `telefone`
  - `endereco`
  - `bairro`
  - `cidade`
  - `estado`
  - `cep`
- Todos os campos enviados para a API de cadastro

### 3. `/supabase/atualizar-usuarios-campos-completos.sql` *(NOVO)*

**Conteúdo:**
- Script completo de migração do banco de dados
- Adiciona todos os novos campos
- Cria índices e constraints
- Implementa triggers de validação
- Inclui comentários explicativos

## 🚀 Como Aplicar as Alterações

### 1. Executar o Script SQL no Supabase

```sql
-- Execute o arquivo:
-- supabase/atualizar-usuarios-campos-completos.sql
```

**Passos:**
1. Acesse o painel do Supabase
2. Vá em **SQL Editor**
3. Copie e cole o conteúdo do arquivo `atualizar-usuarios-campos-completos.sql`
4. Execute o script
5. Verifique se todas as alterações foram aplicadas com sucesso

### 2. Verificar a Estrutura da Tabela

Após executar o script, verifique a estrutura:

```sql
SELECT 
    column_name,
    data_type,
    character_maximum_length,
    column_default,
    is_nullable
FROM information_schema.columns
WHERE table_name = 'usuarios'
ORDER BY ordinal_position;
```

### 3. Atualizar a API Backend

**IMPORTANTE**: A API backend (`/api/auth`) precisa ser atualizada para:

1. Aceitar os novos campos no cadastro
2. Validar CPF e email únicos
3. Armazenar todos os campos no banco de dados

**Exemplo de atualização necessária no backend:**

```javascript
// No endpoint de registro (/api/auth?action=register)
const { email, senha, nome, cpf, telefone, endereco, bairro, cidade, estado, cep } = req.body;

// Validar CPF único
const cpfExistente = await db.usuarios.findOne({ cpf });
if (cpfExistente) {
  return res.status(400).json({ message: 'CPF já cadastrado' });
}

// Validar email único
const emailExistente = await db.usuarios.findOne({ email });
if (emailExistente) {
  return res.status(400).json({ message: 'Email já cadastrado' });
}

// Criar usuário com todos os campos
await db.usuarios.insert({
  email,
  nome,
  cpf,
  telefone,
  endereco,
  bairro,
  cidade,
  estado,
  cep,
  senha: hashedPassword,
  created_at: new Date()
});
```

## ✅ Funcionalidades Implementadas

### No Frontend

- ✅ Formulário completo com todos os campos
- ✅ Máscaras de formatação automática
- ✅ Validações em tempo real
- ✅ Mensagens de erro específicas
- ✅ Layout responsivo e scrollável
- ✅ Limpeza de campos após cadastro bem-sucedido

### No Banco de Dados

- ✅ Novos campos adicionados
- ✅ Índices criados para performance
- ✅ Constraints de unicidade (CPF e email)
- ✅ Validações de formato (CPF e CEP)
- ✅ Triggers automáticos de validação
- ✅ Mensagens de erro personalizadas

## 🔍 Testes Recomendados

### 1. Teste de Cadastro Normal

- Preencher todos os campos corretamente
- Verificar se o cadastro é criado com sucesso

### 2. Teste de CPF Duplicado

- Tentar cadastrar dois usuários com mesmo CPF
- Deve retornar erro: "CPF já cadastrado"

### 3. Teste de Email Duplicado

- Tentar cadastrar dois usuários com mesmo email
- Deve retornar erro: "Email já cadastrado"

### 4. Teste de Validações de Formato

- CPF com menos de 11 dígitos → Erro
- CEP com menos de 8 dígitos → Erro
- Senha com menos de 6 caracteres → Erro
- Senhas não coincidentes → Erro

### 5. Teste de Máscaras

- Digitar CPF e verificar formatação automática
- Digitar telefone e verificar formatação automática
- Digitar CEP e verificar formatação automática

## 📊 Estrutura Final da Tabela `usuarios`

```
usuarios
├── id (PRIMARY KEY)
├── email (UNIQUE)
├── nome
├── senha
├── cpf (UNIQUE, 11 dígitos)
├── telefone
├── endereco
├── bairro
├── cidade (padrão: 'Guaíra')
├── estado (padrão: 'SP')
├── cep (8 dígitos)
├── is_admin
├── created_at
└── updated_at
```

## 🎯 Benefícios das Alterações

1. **Dados Completos**: Cadastro completo de usuários com todas as informações necessárias
2. **Integridade**: Validações garantem dados consistentes e únicos
3. **Segurança**: CPF e email únicos evitam duplicações e fraudes
4. **UX Melhorada**: Máscaras automáticas facilitam o preenchimento
5. **Performance**: Índices otimizam consultas ao banco de dados
6. **Escalabilidade**: Estrutura preparada para futuras funcionalidades

## 📝 Próximos Passos

1. ✅ Executar script SQL no Supabase
2. ⏳ Atualizar API backend para aceitar novos campos
3. ⏳ Testar cadastro completo no ambiente de produção
4. ⏳ Monitorar logs para erros de validação
5. ⏳ Adicionar página de perfil do usuário (edição de dados)

## 🆘 Troubleshooting

### Erro: "CPF já cadastrado"
- Verifique se o CPF já existe no banco de dados
- Um CPF pode ter apenas uma conta

### Erro: "Email já cadastrado"
- Verifique se o email já existe no banco de dados
- Um email pode ter apenas uma conta

### Erro: "CPF inválido"
- CPF deve ter exatamente 11 dígitos numéricos
- Formatação é removida automaticamente

### Script SQL não executa
- Verifique se tem permissões de administrador
- Confirme que a tabela `usuarios` existe
- Execute os comandos em blocos menores se necessário

---

**Data da Atualização**: 28 de janeiro de 2026  
**Versão**: 2.0  
**Status**: Implementado no Frontend, Aguardando Backend
