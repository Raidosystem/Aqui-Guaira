-- Atualizar senha do super admin

UPDATE public.admins 
SET senha_hash = crypt('testesuperadmin', gen_salt('bf'))
WHERE email = 'novaradiosystem@outlook.com' AND super_admin = TRUE;

-- Verificar atualização
SELECT email, nome, super_admin, ativo 
FROM public.admins 
WHERE email = 'novaradiosystem@outlook.com';
