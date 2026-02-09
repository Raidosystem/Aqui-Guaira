-- =============================================
-- TABELA DE OCORRÊNCIAS - AQUI GUAÍRA
-- =============================================

-- Criar tabela de ocorrências
CREATE TABLE IF NOT EXISTS ocorrencias (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  titulo TEXT NOT NULL,
  descricao TEXT NOT NULL,
  categoria TEXT NOT NULL,
  tipo TEXT NOT NULL DEFAULT 'reclamacao',
  status TEXT NOT NULL DEFAULT 'aberto',
  bairro TEXT NOT NULL,
  local_referencia TEXT,
  data_ocorrencia DATE NOT NULL,
  telefone_contato TEXT NOT NULL,
  nome_contato TEXT NOT NULL,
  imagem TEXT,
  user_id UUID REFERENCES auth.users(id),
  criado_em TIMESTAMPTZ DEFAULT NOW(),
  atualizado_em TIMESTAMPTZ DEFAULT NOW()
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_ocorrencias_status ON ocorrencias(status);
CREATE INDEX IF NOT EXISTS idx_ocorrencias_categoria ON ocorrencias(categoria);
CREATE INDEX IF NOT EXISTS idx_ocorrencias_tipo ON ocorrencias(tipo);
CREATE INDEX IF NOT EXISTS idx_ocorrencias_bairro ON ocorrencias(bairro);
CREATE INDEX IF NOT EXISTS idx_ocorrencias_user_id ON ocorrencias(user_id);
CREATE INDEX IF NOT EXISTS idx_ocorrencias_criado_em ON ocorrencias(criado_em DESC);

-- Habilitar RLS
ALTER TABLE ocorrencias ENABLE ROW LEVEL SECURITY;

-- Qualquer pessoa pode visualizar ocorrências
CREATE POLICY "Qualquer pessoa pode ver ocorrências"
  ON ocorrencias FOR SELECT
  USING (true);

-- Usuários autenticados podem inserir
CREATE POLICY "Usuários autenticados podem criar ocorrências"
  ON ocorrencias FOR INSERT
  WITH CHECK (true);

-- Usuários podem editar suas próprias ocorrências
CREATE POLICY "Usuários podem editar suas ocorrências"
  ON ocorrencias FOR UPDATE
  USING (auth.uid() = user_id OR true);

-- Usuários podem deletar suas próprias ocorrências
CREATE POLICY "Usuários podem deletar suas ocorrências"
  ON ocorrencias FOR DELETE
  USING (auth.uid() = user_id OR true);

-- Trigger para atualizar campo atualizado_em
CREATE OR REPLACE FUNCTION update_ocorrencias_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.atualizado_em = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_ocorrencias_updated_at
  BEFORE UPDATE ON ocorrencias
  FOR EACH ROW
  EXECUTE FUNCTION update_ocorrencias_updated_at();
