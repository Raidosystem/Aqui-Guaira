-- ============================================
-- Adicionar campos de CNAE e CNPJ em empresas
-- ============================================

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'empresas' AND column_name = 'cnpj'
  ) THEN
    ALTER TABLE public.empresas ADD COLUMN cnpj text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'empresas' AND column_name = 'cnae'
  ) THEN
    ALTER TABLE public.empresas ADD COLUMN cnae text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'empresas' AND column_name = 'cnae_secundario'
  ) THEN
    ALTER TABLE public.empresas ADD COLUMN cnae_secundario text;
  END IF;
END $$;

-- Constraints de formato e unicidade
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'empresas_cnpj_unique'
  ) THEN
    ALTER TABLE public.empresas ADD CONSTRAINT empresas_cnpj_unique UNIQUE (cnpj);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'empresas_cnpj_check'
  ) THEN
    ALTER TABLE public.empresas
      ADD CONSTRAINT empresas_cnpj_check
      CHECK (cnpj ~ '^[0-9]{14}$' OR cnpj IS NULL);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'empresas_cnae_check'
  ) THEN
    ALTER TABLE public.empresas
      ADD CONSTRAINT empresas_cnae_check
      CHECK (cnae ~ '^[0-9]{7}$' OR cnae IS NULL);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'empresas_cnae_secundario_check'
  ) THEN
    ALTER TABLE public.empresas
      ADD CONSTRAINT empresas_cnae_secundario_check
      CHECK (cnae_secundario ~ '^[0-9]{7}$' OR cnae_secundario IS NULL);
  END IF;
END $$;

-- Índices úteis
CREATE INDEX IF NOT EXISTS empresas_cnpj_idx ON public.empresas(cnpj);
CREATE INDEX IF NOT EXISTS empresas_cnae_idx ON public.empresas(cnae);
CREATE INDEX IF NOT EXISTS empresas_cnae_secundario_idx ON public.empresas(cnae_secundario);
