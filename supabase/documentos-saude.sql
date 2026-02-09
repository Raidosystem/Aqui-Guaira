-- =============================================
-- TABELA DE DOCUMENTOS DE SAÚDE - AQUI GUAÍRA
-- Armazena atestados, receitas, encaminhamentos, exames etc.
-- Acesso privado: somente o dono do documento pode ver/editar/excluir
-- =============================================

CREATE TABLE IF NOT EXISTS documentos_saude (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  nome TEXT NOT NULL,
  tipo TEXT NOT NULL DEFAULT 'outros',
  url TEXT NOT NULL,
  tamanho TEXT,
  criado_em TIMESTAMPTZ DEFAULT NOW(),
  atualizado_em TIMESTAMPTZ DEFAULT NOW()
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_documentos_saude_user_id ON documentos_saude(user_id);
CREATE INDEX IF NOT EXISTS idx_documentos_saude_tipo ON documentos_saude(tipo);
CREATE INDEX IF NOT EXISTS idx_documentos_saude_criado_em ON documentos_saude(criado_em DESC);

-- Habilitar RLS - PRIVACIDADE TOTAL
ALTER TABLE documentos_saude ENABLE ROW LEVEL SECURITY;

-- Somente o dono pode VER seus documentos
CREATE POLICY "Usuário vê somente seus documentos"
  ON documentos_saude FOR SELECT
  USING (auth.uid() = user_id);

-- Somente usuários autenticados podem inserir (para si mesmos)
CREATE POLICY "Usuário insere seus próprios documentos"
  ON documentos_saude FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Somente o dono pode atualizar
CREATE POLICY "Usuário atualiza somente seus documentos"
  ON documentos_saude FOR UPDATE
  USING (auth.uid() = user_id);

-- Somente o dono pode excluir
CREATE POLICY "Usuário exclui somente seus documentos"
  ON documentos_saude FOR DELETE
  USING (auth.uid() = user_id);

-- Trigger para atualizar campo atualizado_em
CREATE OR REPLACE FUNCTION update_documentos_saude_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.atualizado_em = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_documentos_saude_updated_at
  BEFORE UPDATE ON documentos_saude
  FOR EACH ROW
  EXECUTE FUNCTION update_documentos_saude_updated_at();
