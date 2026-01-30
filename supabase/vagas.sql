-- Tabela de vagas
CREATE TABLE IF NOT EXISTS public.vagas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    empresa_id UUID REFERENCES public.empresas(id) ON DELETE CASCADE,
    titulo TEXT NOT NULL,
    descricao TEXT NOT NULL,
    requisitos TEXT,
    quantidade INTEGER DEFAULT 1,
    salario TEXT,
    tipo TEXT CHECK (tipo IN ('CLT', 'PJ', 'Estágio', 'Freelance', 'Outro')),
    status TEXT DEFAULT 'aberta' CHECK (status IN ('aberta', 'cerrada')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS vagas_empresa_id_idx ON public.vagas(empresa_id);
CREATE INDEX IF NOT EXISTS vagas_status_idx ON public.vagas(status);
CREATE INDEX IF NOT EXISTS vagas_created_at_idx ON public.vagas(created_at DESC);
