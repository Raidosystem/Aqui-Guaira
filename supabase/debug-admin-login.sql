-- Verificar se a função admin_login existe e testar

-- 1. Listar funções relacionadas a admin
SELECT 
    p.proname as function_name,
    pg_get_function_arguments(p.oid) as arguments,
    pg_get_function_result(p.oid) as return_type
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE n.nspname = 'public' 
  AND p.proname LIKE '%admin%'
ORDER BY p.proname;

-- 2. Verificar se a tabela admins existe e tem dados
SELECT 
    email, 
    nome, 
    super_admin, 
    ativo,
    created_at
FROM public.admins
ORDER BY created_at DESC;

-- 3. Testar a função admin_login diretamente
SELECT * FROM public.admin_login(
    'novaradiosystem@outlook.com',
    '@Qw12aszx##'
);
