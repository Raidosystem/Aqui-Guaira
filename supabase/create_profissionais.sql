-- Create table for Service Providers (Aqui Resolve)
CREATE TABLE IF NOT EXISTS public.profissionais (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    user_id uuid REFERENCES auth.users(id),
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    
    nome text NOT NULL,
    cpf text, -- Optional for privacy in public listing, but good for admin
    descricao text,
    whatsapp text NOT NULL,
    telefone text,
    
    -- Categories and Service Areas
    categorias text[] DEFAULT '{}', -- IDs from categorias-servicos.json
    bairros_atendidos text[] DEFAULT '{}',
    
    -- Flags
    atende_24h boolean DEFAULT false,
    atende_hoje boolean DEFAULT false,
    orcamento_gratis boolean DEFAULT false,
    
    -- System Status
    status text DEFAULT 'pendente' CHECK (status IN ('pendente', 'aprovado', 'rejeitado')),
    verificado boolean DEFAULT false,
    destaque boolean DEFAULT false,
    
    -- Stats
    visualizacoes integer DEFAULT 0,
    avaliacao_media numeric(2,1) DEFAULT 0,
    total_avaliacoes integer DEFAULT 0,
    
    CONSTRAINT profissionais_pkey PRIMARY KEY (id)
);

-- Enable RLS
ALTER TABLE public.profissionais ENABLE ROW LEVEL SECURITY;

-- Policies
-- 1. Everyone can view approved professionals
CREATE POLICY "Public can view approved professionals" ON public.profissionais
    FOR SELECT USING (status = 'aprovado');

-- 2. Users can view their own pending/rejected profiles
CREATE POLICY "Users can view own profile" ON public.profissionais
    FOR SELECT USING (auth.uid() = user_id);

-- 3. Users can create their own profile
CREATE POLICY "Users can create profile" ON public.profissionais
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 4. Users can update their own profile
CREATE POLICY "Users can update own profile" ON public.profissionais
    FOR UPDATE USING (auth.uid() = user_id);

-- 5. Admins can do everything (handled via service_role or admin boolean in metadata if needed, 
--    but typically RLS for admins is complex without custom claims. 
--    We often use a boolean is_admin in public.users table for app-level logic, 
--    but for RLS we might rely on the 'admin' view or bypass RLS for admin dashboard queries if connected as service role or using specific policies).
--    Let's add a policy for generic 'authenticated' for now and handle logic in app, 
--    OR just assume the admin uses a privileged client or we add specific logic.
--    For simplicity, let's allow "Users" table is_admin check if we can join? 
--    Supabase simple RLS usually doesn't join well. 
--    We will assume Admin uses the implementation in the Admin page which likely might use a specific role or just filtering.
--    Actually, let's create a policy that allows everything if the user is in the 'admins' table or has is_admin=true.
--    Checking public.users(is_admin) in RLS:

CREATE POLICY "Admins can manage all" ON public.profissionais
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE users.id = auth.uid() AND users.is_admin = true
        )
    );

-- Grant permissions
GRANT ALL ON public.profissionais TO anon;
GRANT ALL ON public.profissionais TO authenticated;
GRANT ALL ON public.profissionais TO service_role;
