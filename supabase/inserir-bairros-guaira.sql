-- =====================================================
-- INSERÇÃO DE BAIRROS DE GUAÍRA-SP
-- Gerado automaticamente pelo script migrar-bairros-para-supabase.py
-- =====================================================

INSERT INTO public.bairros (slug, nome_exibicao, grupo_coleta, setor_coleta, servicos_essenciais, agenda)
VALUES (
  'aniceto-carlos-nogueira',
  'Aniceto Carlos Nogueira',
  NULL,
  1,
  '{}'::jsonb,
  '{"lixo_domestico": {"herda_regra_geral": true}, "poda_arvores": {"herda_regra_geral": true}, "entulho_construcao": {"herda_regra_geral": true}, "limpeza_quintal_galhos_folhas_volumosos": {"tipo": "por_grupo", "janelas": []}}'::jsonb
)
ON CONFLICT (slug) DO UPDATE SET
  nome_exibicao = EXCLUDED.nome_exibicao,
  grupo_coleta = EXCLUDED.grupo_coleta,
  setor_coleta = EXCLUDED.setor_coleta,
  servicos_essenciais = EXCLUDED.servicos_essenciais,
  agenda = EXCLUDED.agenda;

INSERT INTO public.bairros (slug, nome_exibicao, grupo_coleta, setor_coleta, servicos_essenciais, agenda)
VALUES (
  'area-rural-de-guaira',
  'Área Rural de Guaíra',
  NULL,
  NULL,
  '{}'::jsonb,
  '{"lixo_domestico": {"herda_regra_geral": true}, "poda_arvores": {"herda_regra_geral": true}, "entulho_construcao": {"herda_regra_geral": true}, "limpeza_quintal_galhos_folhas_volumosos": {"tipo": "por_grupo", "janelas": []}}'::jsonb
)
ON CONFLICT (slug) DO UPDATE SET
  nome_exibicao = EXCLUDED.nome_exibicao,
  grupo_coleta = EXCLUDED.grupo_coleta,
  setor_coleta = EXCLUDED.setor_coleta,
  servicos_essenciais = EXCLUDED.servicos_essenciais,
  agenda = EXCLUDED.agenda;

INSERT INTO public.bairros (slug, nome_exibicao, grupo_coleta, setor_coleta, servicos_essenciais, agenda)
VALUES (
  'associacao-nipo-brasileira',
  'Associação Nipo-Brasileira',
  NULL,
  NULL,
  '{}'::jsonb,
  '{"lixo_domestico": {"herda_regra_geral": true}, "poda_arvores": {"herda_regra_geral": true}, "entulho_construcao": {"herda_regra_geral": true}, "limpeza_quintal_galhos_folhas_volumosos": {"tipo": "por_grupo", "janelas": []}}'::jsonb
)
ON CONFLICT (slug) DO UPDATE SET
  nome_exibicao = EXCLUDED.nome_exibicao,
  grupo_coleta = EXCLUDED.grupo_coleta,
  setor_coleta = EXCLUDED.setor_coleta,
  servicos_essenciais = EXCLUDED.servicos_essenciais,
  agenda = EXCLUDED.agenda;

INSERT INTO public.bairros (slug, nome_exibicao, grupo_coleta, setor_coleta, servicos_essenciais, agenda)
VALUES (
  'campos-eliseos',
  'Campos Elíseos',
  NULL,
  NULL,
  '{}'::jsonb,
  '{"lixo_domestico": {"herda_regra_geral": true}, "poda_arvores": {"herda_regra_geral": true}, "entulho_construcao": {"herda_regra_geral": true}, "limpeza_quintal_galhos_folhas_volumosos": {"tipo": "por_grupo", "janelas": []}}'::jsonb
)
ON CONFLICT (slug) DO UPDATE SET
  nome_exibicao = EXCLUDED.nome_exibicao,
  grupo_coleta = EXCLUDED.grupo_coleta,
  setor_coleta = EXCLUDED.setor_coleta,
  servicos_essenciais = EXCLUDED.servicos_essenciais,
  agenda = EXCLUDED.agenda;

INSERT INTO public.bairros (slug, nome_exibicao, grupo_coleta, setor_coleta, servicos_essenciais, agenda)
VALUES (
  'centro',
  'Centro',
  NULL,
  2,
  '{}'::jsonb,
  '{"lixo_domestico": {"herda_regra_geral": true}, "poda_arvores": {"herda_regra_geral": true}, "entulho_construcao": {"herda_regra_geral": true}, "limpeza_quintal_galhos_folhas_volumosos": {"tipo": "por_grupo", "janelas": []}}'::jsonb
)
ON CONFLICT (slug) DO UPDATE SET
  nome_exibicao = EXCLUDED.nome_exibicao,
  grupo_coleta = EXCLUDED.grupo_coleta,
  setor_coleta = EXCLUDED.setor_coleta,
  servicos_essenciais = EXCLUDED.servicos_essenciais,
  agenda = EXCLUDED.agenda;

INSERT INTO public.bairros (slug, nome_exibicao, grupo_coleta, setor_coleta, servicos_essenciais, agenda)
VALUES (
  'centro-geral',
  'Centro / Geral',
  NULL,
  NULL,
  '{}'::jsonb,
  '{"lixo_domestico": {"herda_regra_geral": true}, "poda_arvores": {"herda_regra_geral": true}, "entulho_construcao": {"herda_regra_geral": true}, "limpeza_quintal_galhos_folhas_volumosos": {"tipo": "por_grupo", "janelas": []}}'::jsonb
)
ON CONFLICT (slug) DO UPDATE SET
  nome_exibicao = EXCLUDED.nome_exibicao,
  grupo_coleta = EXCLUDED.grupo_coleta,
  setor_coleta = EXCLUDED.setor_coleta,
  servicos_essenciais = EXCLUDED.servicos_essenciais,
  agenda = EXCLUDED.agenda;

INSERT INTO public.bairros (slug, nome_exibicao, grupo_coleta, setor_coleta, servicos_essenciais, agenda)
VALUES (
  'conjunto-habitacional-abdala-elias',
  'Conjunto Habitacional Abdala Elias',
  NULL,
  NULL,
  '{}'::jsonb,
  '{"lixo_domestico": {"herda_regra_geral": true}, "poda_arvores": {"herda_regra_geral": true}, "entulho_construcao": {"herda_regra_geral": true}, "limpeza_quintal_galhos_folhas_volumosos": {"tipo": "por_grupo", "janelas": []}}'::jsonb
)
ON CONFLICT (slug) DO UPDATE SET
  nome_exibicao = EXCLUDED.nome_exibicao,
  grupo_coleta = EXCLUDED.grupo_coleta,
  setor_coleta = EXCLUDED.setor_coleta,
  servicos_essenciais = EXCLUDED.servicos_essenciais,
  agenda = EXCLUDED.agenda;

INSERT INTO public.bairros (slug, nome_exibicao, grupo_coleta, setor_coleta, servicos_essenciais, agenda)
VALUES (
  'conjunto-habitacional-antonio-nogueira-lelis',
  'Conjunto Habitacional Antonio Nogueira Lelis',
  NULL,
  NULL,
  '{}'::jsonb,
  '{"lixo_domestico": {"herda_regra_geral": true}, "poda_arvores": {"herda_regra_geral": true}, "entulho_construcao": {"herda_regra_geral": true}, "limpeza_quintal_galhos_folhas_volumosos": {"tipo": "por_grupo", "janelas": []}}'::jsonb
)
ON CONFLICT (slug) DO UPDATE SET
  nome_exibicao = EXCLUDED.nome_exibicao,
  grupo_coleta = EXCLUDED.grupo_coleta,
  setor_coleta = EXCLUDED.setor_coleta,
  servicos_essenciais = EXCLUDED.servicos_essenciais,
  agenda = EXCLUDED.agenda;

INSERT INTO public.bairros (slug, nome_exibicao, grupo_coleta, setor_coleta, servicos_essenciais, agenda)
VALUES (
  'conjunto-habitacional-gabriel-garcia-de-carvalho',
  'Conjunto Habitacional Gabriel Garcia de Carvalho',
  NULL,
  NULL,
  '{}'::jsonb,
  '{"lixo_domestico": {"herda_regra_geral": true}, "poda_arvores": {"herda_regra_geral": true}, "entulho_construcao": {"herda_regra_geral": true}, "limpeza_quintal_galhos_folhas_volumosos": {"tipo": "por_grupo", "janelas": []}}'::jsonb
)
ON CONFLICT (slug) DO UPDATE SET
  nome_exibicao = EXCLUDED.nome_exibicao,
  grupo_coleta = EXCLUDED.grupo_coleta,
  setor_coleta = EXCLUDED.setor_coleta,
  servicos_essenciais = EXCLUDED.servicos_essenciais,
  agenda = EXCLUDED.agenda;

INSERT INTO public.bairros (slug, nome_exibicao, grupo_coleta, setor_coleta, servicos_essenciais, agenda)
VALUES (
  'conjunto-habitacional-geralda-geltrudes-da-silva',
  'Conjunto Habitacional Geralda Geltrudes da Silva',
  NULL,
  NULL,
  '{}'::jsonb,
  '{"lixo_domestico": {"herda_regra_geral": true}, "poda_arvores": {"herda_regra_geral": true}, "entulho_construcao": {"herda_regra_geral": true}, "limpeza_quintal_galhos_folhas_volumosos": {"tipo": "por_grupo", "janelas": []}}'::jsonb
)
ON CONFLICT (slug) DO UPDATE SET
  nome_exibicao = EXCLUDED.nome_exibicao,
  grupo_coleta = EXCLUDED.grupo_coleta,
  setor_coleta = EXCLUDED.setor_coleta,
  servicos_essenciais = EXCLUDED.servicos_essenciais,
  agenda = EXCLUDED.agenda;

INSERT INTO public.bairros (slug, nome_exibicao, grupo_coleta, setor_coleta, servicos_essenciais, agenda)
VALUES (
  'conjunto-habitacional-padre-mario-lano',
  'Conjunto Habitacional Padre Mário Lano',
  NULL,
  NULL,
  '{}'::jsonb,
  '{"lixo_domestico": {"herda_regra_geral": true}, "poda_arvores": {"herda_regra_geral": true}, "entulho_construcao": {"herda_regra_geral": true}, "limpeza_quintal_galhos_folhas_volumosos": {"tipo": "por_grupo", "janelas": []}}'::jsonb
)
ON CONFLICT (slug) DO UPDATE SET
  nome_exibicao = EXCLUDED.nome_exibicao,
  grupo_coleta = EXCLUDED.grupo_coleta,
  setor_coleta = EXCLUDED.setor_coleta,
  servicos_essenciais = EXCLUDED.servicos_essenciais,
  agenda = EXCLUDED.agenda;

INSERT INTO public.bairros (slug, nome_exibicao, grupo_coleta, setor_coleta, servicos_essenciais, agenda)
VALUES (
  'conjunto-habitacional-prefeito-jose-pugliesi',
  'Conjunto Habitacional Prefeito José Pugliesi',
  NULL,
  NULL,
  '{}'::jsonb,
  '{"lixo_domestico": {"herda_regra_geral": true}, "poda_arvores": {"herda_regra_geral": true}, "entulho_construcao": {"herda_regra_geral": true}, "limpeza_quintal_galhos_folhas_volumosos": {"tipo": "por_grupo", "janelas": []}}'::jsonb
)
ON CONFLICT (slug) DO UPDATE SET
  nome_exibicao = EXCLUDED.nome_exibicao,
  grupo_coleta = EXCLUDED.grupo_coleta,
  setor_coleta = EXCLUDED.setor_coleta,
  servicos_essenciais = EXCLUDED.servicos_essenciais,
  agenda = EXCLUDED.agenda;

INSERT INTO public.bairros (slug, nome_exibicao, grupo_coleta, setor_coleta, servicos_essenciais, agenda)
VALUES (
  'conjunto-habitacional-vereador-luiz-dutra-do-prado',
  'Conjunto Habitacional Vereador Luiz Dutra do Prado',
  NULL,
  NULL,
  '{}'::jsonb,
  '{"lixo_domestico": {"herda_regra_geral": true}, "poda_arvores": {"herda_regra_geral": true}, "entulho_construcao": {"herda_regra_geral": true}, "limpeza_quintal_galhos_folhas_volumosos": {"tipo": "por_grupo", "janelas": []}}'::jsonb
)
ON CONFLICT (slug) DO UPDATE SET
  nome_exibicao = EXCLUDED.nome_exibicao,
  grupo_coleta = EXCLUDED.grupo_coleta,
  setor_coleta = EXCLUDED.setor_coleta,
  servicos_essenciais = EXCLUDED.servicos_essenciais,
  agenda = EXCLUDED.agenda;

INSERT INTO public.bairros (slug, nome_exibicao, grupo_coleta, setor_coleta, servicos_essenciais, agenda)
VALUES (
  'conjunto-residencial-antonio-garcia',
  'Conjunto Residencial Antônio Garcia',
  NULL,
  NULL,
  '{}'::jsonb,
  '{"lixo_domestico": {"herda_regra_geral": true}, "poda_arvores": {"herda_regra_geral": true}, "entulho_construcao": {"herda_regra_geral": true}, "limpeza_quintal_galhos_folhas_volumosos": {"tipo": "por_grupo", "janelas": []}}'::jsonb
)
ON CONFLICT (slug) DO UPDATE SET
  nome_exibicao = EXCLUDED.nome_exibicao,
  grupo_coleta = EXCLUDED.grupo_coleta,
  setor_coleta = EXCLUDED.setor_coleta,
  servicos_essenciais = EXCLUDED.servicos_essenciais,
  agenda = EXCLUDED.agenda;

INSERT INTO public.bairros (slug, nome_exibicao, grupo_coleta, setor_coleta, servicos_essenciais, agenda)
VALUES (
  'desmembramento-barros',
  'Desmembramento Barros',
  NULL,
  NULL,
  '{}'::jsonb,
  '{"lixo_domestico": {"herda_regra_geral": true}, "poda_arvores": {"herda_regra_geral": true}, "entulho_construcao": {"herda_regra_geral": true}, "limpeza_quintal_galhos_folhas_volumosos": {"tipo": "por_grupo", "janelas": []}}'::jsonb
)
ON CONFLICT (slug) DO UPDATE SET
  nome_exibicao = EXCLUDED.nome_exibicao,
  grupo_coleta = EXCLUDED.grupo_coleta,
  setor_coleta = EXCLUDED.setor_coleta,
  servicos_essenciais = EXCLUDED.servicos_essenciais,
  agenda = EXCLUDED.agenda;

INSERT INTO public.bairros (slug, nome_exibicao, grupo_coleta, setor_coleta, servicos_essenciais, agenda)
VALUES (
  'desmembramento-chacara-bela-vista',
  'Desmembramento Chácara Bela Vista',
  NULL,
  NULL,
  '{}'::jsonb,
  '{"lixo_domestico": {"herda_regra_geral": true}, "poda_arvores": {"herda_regra_geral": true}, "entulho_construcao": {"herda_regra_geral": true}, "limpeza_quintal_galhos_folhas_volumosos": {"tipo": "por_grupo", "janelas": []}}'::jsonb
)
ON CONFLICT (slug) DO UPDATE SET
  nome_exibicao = EXCLUDED.nome_exibicao,
  grupo_coleta = EXCLUDED.grupo_coleta,
  setor_coleta = EXCLUDED.setor_coleta,
  servicos_essenciais = EXCLUDED.servicos_essenciais,
  agenda = EXCLUDED.agenda;

INSERT INTO public.bairros (slug, nome_exibicao, grupo_coleta, setor_coleta, servicos_essenciais, agenda)
VALUES (
  'desmembramento-chacara-delfim',
  'Desmembramento Chácara Delfim',
  NULL,
  NULL,
  '{}'::jsonb,
  '{"lixo_domestico": {"herda_regra_geral": true}, "poda_arvores": {"herda_regra_geral": true}, "entulho_construcao": {"herda_regra_geral": true}, "limpeza_quintal_galhos_folhas_volumosos": {"tipo": "por_grupo", "janelas": []}}'::jsonb
)
ON CONFLICT (slug) DO UPDATE SET
  nome_exibicao = EXCLUDED.nome_exibicao,
  grupo_coleta = EXCLUDED.grupo_coleta,
  setor_coleta = EXCLUDED.setor_coleta,
  servicos_essenciais = EXCLUDED.servicos_essenciais,
  agenda = EXCLUDED.agenda;

INSERT INTO public.bairros (slug, nome_exibicao, grupo_coleta, setor_coleta, servicos_essenciais, agenda)
VALUES (
  'desmembramento-chacara-nossa-senhora',
  'Desmembramento Chácara Nossa Senhora',
  NULL,
  NULL,
  '{}'::jsonb,
  '{"lixo_domestico": {"herda_regra_geral": true}, "poda_arvores": {"herda_regra_geral": true}, "entulho_construcao": {"herda_regra_geral": true}, "limpeza_quintal_galhos_folhas_volumosos": {"tipo": "por_grupo", "janelas": []}}'::jsonb
)
ON CONFLICT (slug) DO UPDATE SET
  nome_exibicao = EXCLUDED.nome_exibicao,
  grupo_coleta = EXCLUDED.grupo_coleta,
  setor_coleta = EXCLUDED.setor_coleta,
  servicos_essenciais = EXCLUDED.servicos_essenciais,
  agenda = EXCLUDED.agenda;

INSERT INTO public.bairros (slug, nome_exibicao, grupo_coleta, setor_coleta, servicos_essenciais, agenda)
VALUES (
  'desmembramento-chacara-santa-luzia',
  'Desmembramento Chácara Santa Luzia',
  NULL,
  NULL,
  '{}'::jsonb,
  '{"lixo_domestico": {"herda_regra_geral": true}, "poda_arvores": {"herda_regra_geral": true}, "entulho_construcao": {"herda_regra_geral": true}, "limpeza_quintal_galhos_folhas_volumosos": {"tipo": "por_grupo", "janelas": []}}'::jsonb
)
ON CONFLICT (slug) DO UPDATE SET
  nome_exibicao = EXCLUDED.nome_exibicao,
  grupo_coleta = EXCLUDED.grupo_coleta,
  setor_coleta = EXCLUDED.setor_coleta,
  servicos_essenciais = EXCLUDED.servicos_essenciais,
  agenda = EXCLUDED.agenda;

INSERT INTO public.bairros (slug, nome_exibicao, grupo_coleta, setor_coleta, servicos_essenciais, agenda)
VALUES (
  'desmembramento-chacara-santa-quiteria',
  'Desmembramento Chácara Santa Quitéria',
  NULL,
  NULL,
  '{}'::jsonb,
  '{"lixo_domestico": {"herda_regra_geral": true}, "poda_arvores": {"herda_regra_geral": true}, "entulho_construcao": {"herda_regra_geral": true}, "limpeza_quintal_galhos_folhas_volumosos": {"tipo": "por_grupo", "janelas": []}}'::jsonb
)
ON CONFLICT (slug) DO UPDATE SET
  nome_exibicao = EXCLUDED.nome_exibicao,
  grupo_coleta = EXCLUDED.grupo_coleta,
  setor_coleta = EXCLUDED.setor_coleta,
  servicos_essenciais = EXCLUDED.servicos_essenciais,
  agenda = EXCLUDED.agenda;

INSERT INTO public.bairros (slug, nome_exibicao, grupo_coleta, setor_coleta, servicos_essenciais, agenda)
VALUES (
  'desmembramento-dona-taninha',
  'Desmembramento Dona Tâninha',
  NULL,
  NULL,
  '{}'::jsonb,
  '{"lixo_domestico": {"herda_regra_geral": true}, "poda_arvores": {"herda_regra_geral": true}, "entulho_construcao": {"herda_regra_geral": true}, "limpeza_quintal_galhos_folhas_volumosos": {"tipo": "por_grupo", "janelas": []}}'::jsonb
)
ON CONFLICT (slug) DO UPDATE SET
  nome_exibicao = EXCLUDED.nome_exibicao,
  grupo_coleta = EXCLUDED.grupo_coleta,
  setor_coleta = EXCLUDED.setor_coleta,
  servicos_essenciais = EXCLUDED.servicos_essenciais,
  agenda = EXCLUDED.agenda;

INSERT INTO public.bairros (slug, nome_exibicao, grupo_coleta, setor_coleta, servicos_essenciais, agenda)
VALUES (
  'desmembramento-ernesto-pacheco',
  'Desmembramento Ernesto Pacheco',
  NULL,
  NULL,
  '{}'::jsonb,
  '{"lixo_domestico": {"herda_regra_geral": true}, "poda_arvores": {"herda_regra_geral": true}, "entulho_construcao": {"herda_regra_geral": true}, "limpeza_quintal_galhos_folhas_volumosos": {"tipo": "por_grupo", "janelas": []}}'::jsonb
)
ON CONFLICT (slug) DO UPDATE SET
  nome_exibicao = EXCLUDED.nome_exibicao,
  grupo_coleta = EXCLUDED.grupo_coleta,
  setor_coleta = EXCLUDED.setor_coleta,
  servicos_essenciais = EXCLUDED.servicos_essenciais,
  agenda = EXCLUDED.agenda;

INSERT INTO public.bairros (slug, nome_exibicao, grupo_coleta, setor_coleta, servicos_essenciais, agenda)
VALUES (
  'desmembramento-fazenda-antas',
  'Desmembramento Fazenda Antas',
  NULL,
  NULL,
  '{}'::jsonb,
  '{"lixo_domestico": {"herda_regra_geral": true}, "poda_arvores": {"herda_regra_geral": true}, "entulho_construcao": {"herda_regra_geral": true}, "limpeza_quintal_galhos_folhas_volumosos": {"tipo": "por_grupo", "janelas": []}}'::jsonb
)
ON CONFLICT (slug) DO UPDATE SET
  nome_exibicao = EXCLUDED.nome_exibicao,
  grupo_coleta = EXCLUDED.grupo_coleta,
  setor_coleta = EXCLUDED.setor_coleta,
  servicos_essenciais = EXCLUDED.servicos_essenciais,
  agenda = EXCLUDED.agenda;

INSERT INTO public.bairros (slug, nome_exibicao, grupo_coleta, setor_coleta, servicos_essenciais, agenda)
VALUES (
  'desmembramento-fazenda-sao-judas-tadeu',
  'Desmembramento Fazenda São Judas Tadeu',
  NULL,
  NULL,
  '{}'::jsonb,
  '{"lixo_domestico": {"herda_regra_geral": true}, "poda_arvores": {"herda_regra_geral": true}, "entulho_construcao": {"herda_regra_geral": true}, "limpeza_quintal_galhos_folhas_volumosos": {"tipo": "por_grupo", "janelas": []}}'::jsonb
)
ON CONFLICT (slug) DO UPDATE SET
  nome_exibicao = EXCLUDED.nome_exibicao,
  grupo_coleta = EXCLUDED.grupo_coleta,
  setor_coleta = EXCLUDED.setor_coleta,
  servicos_essenciais = EXCLUDED.servicos_essenciais,
  agenda = EXCLUDED.agenda;

INSERT INTO public.bairros (slug, nome_exibicao, grupo_coleta, setor_coleta, servicos_essenciais, agenda)
VALUES (
  'desmembramento-joaquim-baixote',
  'Desmembramento Joaquim Baixote',
  NULL,
  NULL,
  '{}'::jsonb,
  '{"lixo_domestico": {"herda_regra_geral": true}, "poda_arvores": {"herda_regra_geral": true}, "entulho_construcao": {"herda_regra_geral": true}, "limpeza_quintal_galhos_folhas_volumosos": {"tipo": "por_grupo", "janelas": []}}'::jsonb
)
ON CONFLICT (slug) DO UPDATE SET
  nome_exibicao = EXCLUDED.nome_exibicao,
  grupo_coleta = EXCLUDED.grupo_coleta,
  setor_coleta = EXCLUDED.setor_coleta,
  servicos_essenciais = EXCLUDED.servicos_essenciais,
  agenda = EXCLUDED.agenda;

INSERT INTO public.bairros (slug, nome_exibicao, grupo_coleta, setor_coleta, servicos_essenciais, agenda)
VALUES (
  'desmembramento-katsumi-miura',
  'Desmembramento Katsumi Miura',
  NULL,
  NULL,
  '{}'::jsonb,
  '{"lixo_domestico": {"herda_regra_geral": true}, "poda_arvores": {"herda_regra_geral": true}, "entulho_construcao": {"herda_regra_geral": true}, "limpeza_quintal_galhos_folhas_volumosos": {"tipo": "por_grupo", "janelas": []}}'::jsonb
)
ON CONFLICT (slug) DO UPDATE SET
  nome_exibicao = EXCLUDED.nome_exibicao,
  grupo_coleta = EXCLUDED.grupo_coleta,
  setor_coleta = EXCLUDED.setor_coleta,
  servicos_essenciais = EXCLUDED.servicos_essenciais,
  agenda = EXCLUDED.agenda;

INSERT INTO public.bairros (slug, nome_exibicao, grupo_coleta, setor_coleta, servicos_essenciais, agenda)
VALUES (
  'desmembramento-recreio-santa-isabel',
  'Desmembramento Recreio Santa Isabel',
  NULL,
  NULL,
  '{}'::jsonb,
  '{"lixo_domestico": {"herda_regra_geral": true}, "poda_arvores": {"herda_regra_geral": true}, "entulho_construcao": {"herda_regra_geral": true}, "limpeza_quintal_galhos_folhas_volumosos": {"tipo": "por_grupo", "janelas": []}}'::jsonb
)
ON CONFLICT (slug) DO UPDATE SET
  nome_exibicao = EXCLUDED.nome_exibicao,
  grupo_coleta = EXCLUDED.grupo_coleta,
  setor_coleta = EXCLUDED.setor_coleta,
  servicos_essenciais = EXCLUDED.servicos_essenciais,
  agenda = EXCLUDED.agenda;

INSERT INTO public.bairros (slug, nome_exibicao, grupo_coleta, setor_coleta, servicos_essenciais, agenda)
VALUES (
  'desmembramento-reis-e-marques',
  'Desmembramento Reis e Marques',
  NULL,
  NULL,
  '{}'::jsonb,
  '{"lixo_domestico": {"herda_regra_geral": true}, "poda_arvores": {"herda_regra_geral": true}, "entulho_construcao": {"herda_regra_geral": true}, "limpeza_quintal_galhos_folhas_volumosos": {"tipo": "por_grupo", "janelas": []}}'::jsonb
)
ON CONFLICT (slug) DO UPDATE SET
  nome_exibicao = EXCLUDED.nome_exibicao,
  grupo_coleta = EXCLUDED.grupo_coleta,
  setor_coleta = EXCLUDED.setor_coleta,
  servicos_essenciais = EXCLUDED.servicos_essenciais,
  agenda = EXCLUDED.agenda;

INSERT INTO public.bairros (slug, nome_exibicao, grupo_coleta, setor_coleta, servicos_essenciais, agenda)
VALUES (
  'desmembramento-rialga',
  'Desmembramento Rialga',
  NULL,
  NULL,
  '{}'::jsonb,
  '{"lixo_domestico": {"herda_regra_geral": true}, "poda_arvores": {"herda_regra_geral": true}, "entulho_construcao": {"herda_regra_geral": true}, "limpeza_quintal_galhos_folhas_volumosos": {"tipo": "por_grupo", "janelas": []}}'::jsonb
)
ON CONFLICT (slug) DO UPDATE SET
  nome_exibicao = EXCLUDED.nome_exibicao,
  grupo_coleta = EXCLUDED.grupo_coleta,
  setor_coleta = EXCLUDED.setor_coleta,
  servicos_essenciais = EXCLUDED.servicos_essenciais,
  agenda = EXCLUDED.agenda;

INSERT INTO public.bairros (slug, nome_exibicao, grupo_coleta, setor_coleta, servicos_essenciais, agenda)
VALUES (
  'desmembramento-santa-elydia',
  'Desmembramento Santa Elýdia',
  NULL,
  NULL,
  '{}'::jsonb,
  '{"lixo_domestico": {"herda_regra_geral": true}, "poda_arvores": {"herda_regra_geral": true}, "entulho_construcao": {"herda_regra_geral": true}, "limpeza_quintal_galhos_folhas_volumosos": {"tipo": "por_grupo", "janelas": []}}'::jsonb
)
ON CONFLICT (slug) DO UPDATE SET
  nome_exibicao = EXCLUDED.nome_exibicao,
  grupo_coleta = EXCLUDED.grupo_coleta,
  setor_coleta = EXCLUDED.setor_coleta,
  servicos_essenciais = EXCLUDED.servicos_essenciais,
  agenda = EXCLUDED.agenda;

INSERT INTO public.bairros (slug, nome_exibicao, grupo_coleta, setor_coleta, servicos_essenciais, agenda)
VALUES (
  'desmembramento-santo-antonio',
  'Desmembramento Santo Antônio',
  NULL,
  NULL,
  '{}'::jsonb,
  '{"lixo_domestico": {"herda_regra_geral": true}, "poda_arvores": {"herda_regra_geral": true}, "entulho_construcao": {"herda_regra_geral": true}, "limpeza_quintal_galhos_folhas_volumosos": {"tipo": "por_grupo", "janelas": []}}'::jsonb
)
ON CONFLICT (slug) DO UPDATE SET
  nome_exibicao = EXCLUDED.nome_exibicao,
  grupo_coleta = EXCLUDED.grupo_coleta,
  setor_coleta = EXCLUDED.setor_coleta,
  servicos_essenciais = EXCLUDED.servicos_essenciais,
  agenda = EXCLUDED.agenda;

INSERT INTO public.bairros (slug, nome_exibicao, grupo_coleta, setor_coleta, servicos_essenciais, agenda)
VALUES (
  'desmembramento-sao-francisco',
  'Desmembramento São Francisco',
  NULL,
  NULL,
  '{}'::jsonb,
  '{"lixo_domestico": {"herda_regra_geral": true}, "poda_arvores": {"herda_regra_geral": true}, "entulho_construcao": {"herda_regra_geral": true}, "limpeza_quintal_galhos_folhas_volumosos": {"tipo": "por_grupo", "janelas": []}}'::jsonb
)
ON CONFLICT (slug) DO UPDATE SET
  nome_exibicao = EXCLUDED.nome_exibicao,
  grupo_coleta = EXCLUDED.grupo_coleta,
  setor_coleta = EXCLUDED.setor_coleta,
  servicos_essenciais = EXCLUDED.servicos_essenciais,
  agenda = EXCLUDED.agenda;

INSERT INTO public.bairros (slug, nome_exibicao, grupo_coleta, setor_coleta, servicos_essenciais, agenda)
VALUES (
  'desmembramento-sitio-santa-quiteria',
  'Desmembramento Sítio Santa Quitéria',
  NULL,
  NULL,
  '{}'::jsonb,
  '{"lixo_domestico": {"herda_regra_geral": true}, "poda_arvores": {"herda_regra_geral": true}, "entulho_construcao": {"herda_regra_geral": true}, "limpeza_quintal_galhos_folhas_volumosos": {"tipo": "por_grupo", "janelas": []}}'::jsonb
)
ON CONFLICT (slug) DO UPDATE SET
  nome_exibicao = EXCLUDED.nome_exibicao,
  grupo_coleta = EXCLUDED.grupo_coleta,
  setor_coleta = EXCLUDED.setor_coleta,
  servicos_essenciais = EXCLUDED.servicos_essenciais,
  agenda = EXCLUDED.agenda;

INSERT INTO public.bairros (slug, nome_exibicao, grupo_coleta, setor_coleta, servicos_essenciais, agenda)
VALUES (
  'desmembramento-thobias-landim',
  'Desmembramento Thobias Landim',
  NULL,
  3,
  '{}'::jsonb,
  '{"lixo_domestico": {"herda_regra_geral": true}, "poda_arvores": {"herda_regra_geral": true}, "entulho_construcao": {"herda_regra_geral": true}, "limpeza_quintal_galhos_folhas_volumosos": {"tipo": "por_grupo", "janelas": []}}'::jsonb
)
ON CONFLICT (slug) DO UPDATE SET
  nome_exibicao = EXCLUDED.nome_exibicao,
  grupo_coleta = EXCLUDED.grupo_coleta,
  setor_coleta = EXCLUDED.setor_coleta,
  servicos_essenciais = EXCLUDED.servicos_essenciais,
  agenda = EXCLUDED.agenda;

INSERT INTO public.bairros (slug, nome_exibicao, grupo_coleta, setor_coleta, servicos_essenciais, agenda)
VALUES (
  'distrito-industrial-i',
  'Distrito Industrial I',
  NULL,
  NULL,
  '{}'::jsonb,
  '{"lixo_domestico": {"herda_regra_geral": true}, "poda_arvores": {"herda_regra_geral": true}, "entulho_construcao": {"herda_regra_geral": true}, "limpeza_quintal_galhos_folhas_volumosos": {"tipo": "por_grupo", "janelas": []}}'::jsonb
)
ON CONFLICT (slug) DO UPDATE SET
  nome_exibicao = EXCLUDED.nome_exibicao,
  grupo_coleta = EXCLUDED.grupo_coleta,
  setor_coleta = EXCLUDED.setor_coleta,
  servicos_essenciais = EXCLUDED.servicos_essenciais,
  agenda = EXCLUDED.agenda;

INSERT INTO public.bairros (slug, nome_exibicao, grupo_coleta, setor_coleta, servicos_essenciais, agenda)
VALUES (
  'distrito-industrial-luiz-carlos-nogueira',
  'Distrito Industrial Luiz Carlos Nogueira',
  NULL,
  NULL,
  '{}'::jsonb,
  '{"lixo_domestico": {"herda_regra_geral": true}, "poda_arvores": {"herda_regra_geral": true}, "entulho_construcao": {"herda_regra_geral": true}, "limpeza_quintal_galhos_folhas_volumosos": {"tipo": "por_grupo", "janelas": []}}'::jsonb
)
ON CONFLICT (slug) DO UPDATE SET
  nome_exibicao = EXCLUDED.nome_exibicao,
  grupo_coleta = EXCLUDED.grupo_coleta,
  setor_coleta = EXCLUDED.setor_coleta,
  servicos_essenciais = EXCLUDED.servicos_essenciais,
  agenda = EXCLUDED.agenda;

INSERT INTO public.bairros (slug, nome_exibicao, grupo_coleta, setor_coleta, servicos_essenciais, agenda)
VALUES (
  'doutor-fabio-talarico',
  'Doutor Fábio Talarico',
  NULL,
  NULL,
  '{}'::jsonb,
  '{"lixo_domestico": {"herda_regra_geral": true}, "poda_arvores": {"herda_regra_geral": true}, "entulho_construcao": {"herda_regra_geral": true}, "limpeza_quintal_galhos_folhas_volumosos": {"tipo": "por_grupo", "janelas": []}}'::jsonb
)
ON CONFLICT (slug) DO UPDATE SET
  nome_exibicao = EXCLUDED.nome_exibicao,
  grupo_coleta = EXCLUDED.grupo_coleta,
  setor_coleta = EXCLUDED.setor_coleta,
  servicos_essenciais = EXCLUDED.servicos_essenciais,
  agenda = EXCLUDED.agenda;

INSERT INTO public.bairros (slug, nome_exibicao, grupo_coleta, setor_coleta, servicos_essenciais, agenda)
VALUES (
  'estancia-morada-nova',
  'Estância Morada Nova',
  NULL,
  NULL,
  '{}'::jsonb,
  '{"lixo_domestico": {"herda_regra_geral": true}, "poda_arvores": {"herda_regra_geral": true}, "entulho_construcao": {"herda_regra_geral": true}, "limpeza_quintal_galhos_folhas_volumosos": {"tipo": "por_grupo", "janelas": []}}'::jsonb
)
ON CONFLICT (slug) DO UPDATE SET
  nome_exibicao = EXCLUDED.nome_exibicao,
  grupo_coleta = EXCLUDED.grupo_coleta,
  setor_coleta = EXCLUDED.setor_coleta,
  servicos_essenciais = EXCLUDED.servicos_essenciais,
  agenda = EXCLUDED.agenda;

INSERT INTO public.bairros (slug, nome_exibicao, grupo_coleta, setor_coleta, servicos_essenciais, agenda)
VALUES (
  'etelvina-santana-da-silva',
  'Etelvina Santana da Silva',
  NULL,
  NULL,
  '{}'::jsonb,
  '{"lixo_domestico": {"herda_regra_geral": true}, "poda_arvores": {"herda_regra_geral": true}, "entulho_construcao": {"herda_regra_geral": true}, "limpeza_quintal_galhos_folhas_volumosos": {"tipo": "por_grupo", "janelas": []}}'::jsonb
)
ON CONFLICT (slug) DO UPDATE SET
  nome_exibicao = EXCLUDED.nome_exibicao,
  grupo_coleta = EXCLUDED.grupo_coleta,
  setor_coleta = EXCLUDED.setor_coleta,
  servicos_essenciais = EXCLUDED.servicos_essenciais,
  agenda = EXCLUDED.agenda;

INSERT INTO public.bairros (slug, nome_exibicao, grupo_coleta, setor_coleta, servicos_essenciais, agenda)
VALUES (
  'guaira',
  'Guaíra',
  NULL,
  NULL,
  '{}'::jsonb,
  '{"lixo_domestico": {"herda_regra_geral": true}, "poda_arvores": {"herda_regra_geral": true}, "entulho_construcao": {"herda_regra_geral": true}, "limpeza_quintal_galhos_folhas_volumosos": {"tipo": "por_grupo", "janelas": []}}'::jsonb
)
ON CONFLICT (slug) DO UPDATE SET
  nome_exibicao = EXCLUDED.nome_exibicao,
  grupo_coleta = EXCLUDED.grupo_coleta,
  setor_coleta = EXCLUDED.setor_coleta,
  servicos_essenciais = EXCLUDED.servicos_essenciais,
  agenda = EXCLUDED.agenda;

INSERT INTO public.bairros (slug, nome_exibicao, grupo_coleta, setor_coleta, servicos_essenciais, agenda)
VALUES (
  'industrial',
  'Industrial',
  NULL,
  NULL,
  '{}'::jsonb,
  '{"lixo_domestico": {"herda_regra_geral": true}, "poda_arvores": {"herda_regra_geral": true}, "entulho_construcao": {"herda_regra_geral": true}, "limpeza_quintal_galhos_folhas_volumosos": {"tipo": "por_grupo", "janelas": []}}'::jsonb
)
ON CONFLICT (slug) DO UPDATE SET
  nome_exibicao = EXCLUDED.nome_exibicao,
  grupo_coleta = EXCLUDED.grupo_coleta,
  setor_coleta = EXCLUDED.setor_coleta,
  servicos_essenciais = EXCLUDED.servicos_essenciais,
  agenda = EXCLUDED.agenda;

INSERT INTO public.bairros (slug, nome_exibicao, grupo_coleta, setor_coleta, servicos_essenciais, agenda)
VALUES (
  'jardim-alegria',
  'Jardim Alegria',
  NULL,
  3,
  '{}'::jsonb,
  '{"lixo_domestico": {"herda_regra_geral": true}, "poda_arvores": {"herda_regra_geral": true}, "entulho_construcao": {"herda_regra_geral": true}, "limpeza_quintal_galhos_folhas_volumosos": {"tipo": "por_grupo", "janelas": []}}'::jsonb
)
ON CONFLICT (slug) DO UPDATE SET
  nome_exibicao = EXCLUDED.nome_exibicao,
  grupo_coleta = EXCLUDED.grupo_coleta,
  setor_coleta = EXCLUDED.setor_coleta,
  servicos_essenciais = EXCLUDED.servicos_essenciais,
  agenda = EXCLUDED.agenda;

INSERT INTO public.bairros (slug, nome_exibicao, grupo_coleta, setor_coleta, servicos_essenciais, agenda)
VALUES (
  'jardim-california',
  'Jardim Califórnia',
  NULL,
  1,
  '{}'::jsonb,
  '{"lixo_domestico": {"herda_regra_geral": true}, "poda_arvores": {"herda_regra_geral": true}, "entulho_construcao": {"herda_regra_geral": true}, "limpeza_quintal_galhos_folhas_volumosos": {"tipo": "por_grupo", "janelas": []}}'::jsonb
)
ON CONFLICT (slug) DO UPDATE SET
  nome_exibicao = EXCLUDED.nome_exibicao,
  grupo_coleta = EXCLUDED.grupo_coleta,
  setor_coleta = EXCLUDED.setor_coleta,
  servicos_essenciais = EXCLUDED.servicos_essenciais,
  agenda = EXCLUDED.agenda;

INSERT INTO public.bairros (slug, nome_exibicao, grupo_coleta, setor_coleta, servicos_essenciais, agenda)
VALUES (
  'jardim-das-acacias',
  'Jardim das Acácias',
  NULL,
  3,
  '{}'::jsonb,
  '{"lixo_domestico": {"herda_regra_geral": true}, "poda_arvores": {"herda_regra_geral": true}, "entulho_construcao": {"herda_regra_geral": true}, "limpeza_quintal_galhos_folhas_volumosos": {"tipo": "por_grupo", "janelas": []}}'::jsonb
)
ON CONFLICT (slug) DO UPDATE SET
  nome_exibicao = EXCLUDED.nome_exibicao,
  grupo_coleta = EXCLUDED.grupo_coleta,
  setor_coleta = EXCLUDED.setor_coleta,
  servicos_essenciais = EXCLUDED.servicos_essenciais,
  agenda = EXCLUDED.agenda;

INSERT INTO public.bairros (slug, nome_exibicao, grupo_coleta, setor_coleta, servicos_essenciais, agenda)
VALUES (
  'jardim-de-monet',
  'Jardim de Monet',
  NULL,
  NULL,
  '{}'::jsonb,
  '{"lixo_domestico": {"herda_regra_geral": true}, "poda_arvores": {"herda_regra_geral": true}, "entulho_construcao": {"herda_regra_geral": true}, "limpeza_quintal_galhos_folhas_volumosos": {"tipo": "por_grupo", "janelas": []}}'::jsonb
)
ON CONFLICT (slug) DO UPDATE SET
  nome_exibicao = EXCLUDED.nome_exibicao,
  grupo_coleta = EXCLUDED.grupo_coleta,
  setor_coleta = EXCLUDED.setor_coleta,
  servicos_essenciais = EXCLUDED.servicos_essenciais,
  agenda = EXCLUDED.agenda;

INSERT INTO public.bairros (slug, nome_exibicao, grupo_coleta, setor_coleta, servicos_essenciais, agenda)
VALUES (
  'jardim-eldorado',
  'Jardim Eldorado',
  NULL,
  3,
  '{}'::jsonb,
  '{"lixo_domestico": {"herda_regra_geral": true}, "poda_arvores": {"herda_regra_geral": true}, "entulho_construcao": {"herda_regra_geral": true}, "limpeza_quintal_galhos_folhas_volumosos": {"tipo": "por_grupo", "janelas": []}}'::jsonb
)
ON CONFLICT (slug) DO UPDATE SET
  nome_exibicao = EXCLUDED.nome_exibicao,
  grupo_coleta = EXCLUDED.grupo_coleta,
  setor_coleta = EXCLUDED.setor_coleta,
  servicos_essenciais = EXCLUDED.servicos_essenciais,
  agenda = EXCLUDED.agenda;

INSERT INTO public.bairros (slug, nome_exibicao, grupo_coleta, setor_coleta, servicos_essenciais, agenda)
VALUES (
  'jardim-eliza',
  'Jardim Eliza',
  NULL,
  4,
  '{}'::jsonb,
  '{"lixo_domestico": {"herda_regra_geral": true}, "poda_arvores": {"herda_regra_geral": true}, "entulho_construcao": {"herda_regra_geral": true}, "limpeza_quintal_galhos_folhas_volumosos": {"tipo": "por_grupo", "janelas": []}}'::jsonb
)
ON CONFLICT (slug) DO UPDATE SET
  nome_exibicao = EXCLUDED.nome_exibicao,
  grupo_coleta = EXCLUDED.grupo_coleta,
  setor_coleta = EXCLUDED.setor_coleta,
  servicos_essenciais = EXCLUDED.servicos_essenciais,
  agenda = EXCLUDED.agenda;

INSERT INTO public.bairros (slug, nome_exibicao, grupo_coleta, setor_coleta, servicos_essenciais, agenda)
VALUES (
  'jardim-ligia',
  'Jardim Lígia',
  NULL,
  NULL,
  '{}'::jsonb,
  '{"lixo_domestico": {"herda_regra_geral": true}, "poda_arvores": {"herda_regra_geral": true}, "entulho_construcao": {"herda_regra_geral": true}, "limpeza_quintal_galhos_folhas_volumosos": {"tipo": "por_grupo", "janelas": []}}'::jsonb
)
ON CONFLICT (slug) DO UPDATE SET
  nome_exibicao = EXCLUDED.nome_exibicao,
  grupo_coleta = EXCLUDED.grupo_coleta,
  setor_coleta = EXCLUDED.setor_coleta,
  servicos_essenciais = EXCLUDED.servicos_essenciais,
  agenda = EXCLUDED.agenda;

INSERT INTO public.bairros (slug, nome_exibicao, grupo_coleta, setor_coleta, servicos_essenciais, agenda)
VALUES (
  'jardim-ligia-2',
  'Jardim Lígia 2',
  NULL,
  NULL,
  '{}'::jsonb,
  '{"lixo_domestico": {"herda_regra_geral": true}, "poda_arvores": {"herda_regra_geral": true}, "entulho_construcao": {"herda_regra_geral": true}, "limpeza_quintal_galhos_folhas_volumosos": {"tipo": "por_grupo", "janelas": []}}'::jsonb
)
ON CONFLICT (slug) DO UPDATE SET
  nome_exibicao = EXCLUDED.nome_exibicao,
  grupo_coleta = EXCLUDED.grupo_coleta,
  setor_coleta = EXCLUDED.setor_coleta,
  servicos_essenciais = EXCLUDED.servicos_essenciais,
  agenda = EXCLUDED.agenda;

INSERT INTO public.bairros (slug, nome_exibicao, grupo_coleta, setor_coleta, servicos_essenciais, agenda)
VALUES (
  'jardim-ligia-ii',
  'Jardim Lígia II',
  NULL,
  NULL,
  '{}'::jsonb,
  '{"lixo_domestico": {"herda_regra_geral": true}, "poda_arvores": {"herda_regra_geral": true}, "entulho_construcao": {"herda_regra_geral": true}, "limpeza_quintal_galhos_folhas_volumosos": {"tipo": "por_grupo", "janelas": []}}'::jsonb
)
ON CONFLICT (slug) DO UPDATE SET
  nome_exibicao = EXCLUDED.nome_exibicao,
  grupo_coleta = EXCLUDED.grupo_coleta,
  setor_coleta = EXCLUDED.setor_coleta,
  servicos_essenciais = EXCLUDED.servicos_essenciais,
  agenda = EXCLUDED.agenda;

INSERT INTO public.bairros (slug, nome_exibicao, grupo_coleta, setor_coleta, servicos_essenciais, agenda)
VALUES (
  'jardim-palmares',
  'Jardim Palmares',
  NULL,
  NULL,
  '{}'::jsonb,
  '{"lixo_domestico": {"herda_regra_geral": true}, "poda_arvores": {"herda_regra_geral": true}, "entulho_construcao": {"herda_regra_geral": true}, "limpeza_quintal_galhos_folhas_volumosos": {"tipo": "por_grupo", "janelas": []}}'::jsonb
)
ON CONFLICT (slug) DO UPDATE SET
  nome_exibicao = EXCLUDED.nome_exibicao,
  grupo_coleta = EXCLUDED.grupo_coleta,
  setor_coleta = EXCLUDED.setor_coleta,
  servicos_essenciais = EXCLUDED.servicos_essenciais,
  agenda = EXCLUDED.agenda;

INSERT INTO public.bairros (slug, nome_exibicao, grupo_coleta, setor_coleta, servicos_essenciais, agenda)
VALUES (
  'jardim-paulista',
  'Jardim Paulista',
  NULL,
  4,
  '{}'::jsonb,
  '{"lixo_domestico": {"herda_regra_geral": true}, "poda_arvores": {"herda_regra_geral": true}, "entulho_construcao": {"herda_regra_geral": true}, "limpeza_quintal_galhos_folhas_volumosos": {"tipo": "por_grupo", "janelas": []}}'::jsonb
)
ON CONFLICT (slug) DO UPDATE SET
  nome_exibicao = EXCLUDED.nome_exibicao,
  grupo_coleta = EXCLUDED.grupo_coleta,
  setor_coleta = EXCLUDED.setor_coleta,
  servicos_essenciais = EXCLUDED.servicos_essenciais,
  agenda = EXCLUDED.agenda;

INSERT INTO public.bairros (slug, nome_exibicao, grupo_coleta, setor_coleta, servicos_essenciais, agenda)
VALUES (
  'jardim-sao-francisco-i',
  'Jardim São Francisco I',
  NULL,
  NULL,
  '{}'::jsonb,
  '{"lixo_domestico": {"herda_regra_geral": true}, "poda_arvores": {"herda_regra_geral": true}, "entulho_construcao": {"herda_regra_geral": true}, "limpeza_quintal_galhos_folhas_volumosos": {"tipo": "por_grupo", "janelas": []}}'::jsonb
)
ON CONFLICT (slug) DO UPDATE SET
  nome_exibicao = EXCLUDED.nome_exibicao,
  grupo_coleta = EXCLUDED.grupo_coleta,
  setor_coleta = EXCLUDED.setor_coleta,
  servicos_essenciais = EXCLUDED.servicos_essenciais,
  agenda = EXCLUDED.agenda;

INSERT INTO public.bairros (slug, nome_exibicao, grupo_coleta, setor_coleta, servicos_essenciais, agenda)
VALUES (
  'jardim-solaris',
  'Jardim Solaris',
  NULL,
  1,
  '{}'::jsonb,
  '{"lixo_domestico": {"herda_regra_geral": true}, "poda_arvores": {"herda_regra_geral": true}, "entulho_construcao": {"herda_regra_geral": true}, "limpeza_quintal_galhos_folhas_volumosos": {"tipo": "por_grupo", "janelas": []}}'::jsonb
)
ON CONFLICT (slug) DO UPDATE SET
  nome_exibicao = EXCLUDED.nome_exibicao,
  grupo_coleta = EXCLUDED.grupo_coleta,
  setor_coleta = EXCLUDED.setor_coleta,
  servicos_essenciais = EXCLUDED.servicos_essenciais,
  agenda = EXCLUDED.agenda;

INSERT INTO public.bairros (slug, nome_exibicao, grupo_coleta, setor_coleta, servicos_essenciais, agenda)
VALUES (
  'joao-vaccaro',
  'João Vaccaro',
  NULL,
  4,
  '{}'::jsonb,
  '{"lixo_domestico": {"herda_regra_geral": true}, "poda_arvores": {"herda_regra_geral": true}, "entulho_construcao": {"herda_regra_geral": true}, "limpeza_quintal_galhos_folhas_volumosos": {"tipo": "por_grupo", "janelas": []}}'::jsonb
)
ON CONFLICT (slug) DO UPDATE SET
  nome_exibicao = EXCLUDED.nome_exibicao,
  grupo_coleta = EXCLUDED.grupo_coleta,
  setor_coleta = EXCLUDED.setor_coleta,
  servicos_essenciais = EXCLUDED.servicos_essenciais,
  agenda = EXCLUDED.agenda;

INSERT INTO public.bairros (slug, nome_exibicao, grupo_coleta, setor_coleta, servicos_essenciais, agenda)
VALUES (
  'joaquim-pereira-lelis',
  'Joaquim Pereira Lelis',
  NULL,
  NULL,
  '{}'::jsonb,
  '{"lixo_domestico": {"herda_regra_geral": true}, "poda_arvores": {"herda_regra_geral": true}, "entulho_construcao": {"herda_regra_geral": true}, "limpeza_quintal_galhos_folhas_volumosos": {"tipo": "por_grupo", "janelas": []}}'::jsonb
)
ON CONFLICT (slug) DO UPDATE SET
  nome_exibicao = EXCLUDED.nome_exibicao,
  grupo_coleta = EXCLUDED.grupo_coleta,
  setor_coleta = EXCLUDED.setor_coleta,
  servicos_essenciais = EXCLUDED.servicos_essenciais,
  agenda = EXCLUDED.agenda;

INSERT INTO public.bairros (slug, nome_exibicao, grupo_coleta, setor_coleta, servicos_essenciais, agenda)
VALUES (
  'loteamento-sao-jose',
  'Loteamento São José',
  NULL,
  NULL,
  '{}'::jsonb,
  '{"lixo_domestico": {"herda_regra_geral": true}, "poda_arvores": {"herda_regra_geral": true}, "entulho_construcao": {"herda_regra_geral": true}, "limpeza_quintal_galhos_folhas_volumosos": {"tipo": "por_grupo", "janelas": []}}'::jsonb
)
ON CONFLICT (slug) DO UPDATE SET
  nome_exibicao = EXCLUDED.nome_exibicao,
  grupo_coleta = EXCLUDED.grupo_coleta,
  setor_coleta = EXCLUDED.setor_coleta,
  servicos_essenciais = EXCLUDED.servicos_essenciais,
  agenda = EXCLUDED.agenda;

INSERT INTO public.bairros (slug, nome_exibicao, grupo_coleta, setor_coleta, servicos_essenciais, agenda)
VALUES (
  'maraca',
  'Maracá',
  NULL,
  3,
  '{}'::jsonb,
  '{"lixo_domestico": {"herda_regra_geral": true}, "poda_arvores": {"herda_regra_geral": true}, "entulho_construcao": {"herda_regra_geral": true}, "limpeza_quintal_galhos_folhas_volumosos": {"tipo": "por_grupo", "janelas": []}}'::jsonb
)
ON CONFLICT (slug) DO UPDATE SET
  nome_exibicao = EXCLUDED.nome_exibicao,
  grupo_coleta = EXCLUDED.grupo_coleta,
  setor_coleta = EXCLUDED.setor_coleta,
  servicos_essenciais = EXCLUDED.servicos_essenciais,
  agenda = EXCLUDED.agenda;

INSERT INTO public.bairros (slug, nome_exibicao, grupo_coleta, setor_coleta, servicos_essenciais, agenda)
VALUES (
  'morada-do-sol',
  'Morada do Sol',
  NULL,
  3,
  '{}'::jsonb,
  '{"lixo_domestico": {"herda_regra_geral": true}, "poda_arvores": {"herda_regra_geral": true}, "entulho_construcao": {"herda_regra_geral": true}, "limpeza_quintal_galhos_folhas_volumosos": {"tipo": "por_grupo", "janelas": []}}'::jsonb
)
ON CONFLICT (slug) DO UPDATE SET
  nome_exibicao = EXCLUDED.nome_exibicao,
  grupo_coleta = EXCLUDED.grupo_coleta,
  setor_coleta = EXCLUDED.setor_coleta,
  servicos_essenciais = EXCLUDED.servicos_essenciais,
  agenda = EXCLUDED.agenda;

INSERT INTO public.bairros (slug, nome_exibicao, grupo_coleta, setor_coleta, servicos_essenciais, agenda)
VALUES (
  'paranoa',
  'Paranoá',
  NULL,
  3,
  '{}'::jsonb,
  '{"lixo_domestico": {"herda_regra_geral": true}, "poda_arvores": {"herda_regra_geral": true}, "entulho_construcao": {"herda_regra_geral": true}, "limpeza_quintal_galhos_folhas_volumosos": {"tipo": "por_grupo", "janelas": []}}'::jsonb
)
ON CONFLICT (slug) DO UPDATE SET
  nome_exibicao = EXCLUDED.nome_exibicao,
  grupo_coleta = EXCLUDED.grupo_coleta,
  setor_coleta = EXCLUDED.setor_coleta,
  servicos_essenciais = EXCLUDED.servicos_essenciais,
  agenda = EXCLUDED.agenda;

INSERT INTO public.bairros (slug, nome_exibicao, grupo_coleta, setor_coleta, servicos_essenciais, agenda)
VALUES (
  'portal-do-lago',
  'Portal do Lago',
  NULL,
  3,
  '{}'::jsonb,
  '{"lixo_domestico": {"herda_regra_geral": true}, "poda_arvores": {"herda_regra_geral": true}, "entulho_construcao": {"herda_regra_geral": true}, "limpeza_quintal_galhos_folhas_volumosos": {"tipo": "por_grupo", "janelas": []}}'::jsonb
)
ON CONFLICT (slug) DO UPDATE SET
  nome_exibicao = EXCLUDED.nome_exibicao,
  grupo_coleta = EXCLUDED.grupo_coleta,
  setor_coleta = EXCLUDED.setor_coleta,
  servicos_essenciais = EXCLUDED.servicos_essenciais,
  agenda = EXCLUDED.agenda;

INSERT INTO public.bairros (slug, nome_exibicao, grupo_coleta, setor_coleta, servicos_essenciais, agenda)
VALUES (
  'recreio-sao-bernardo',
  'Recreio São Bernardo',
  NULL,
  NULL,
  '{}'::jsonb,
  '{"lixo_domestico": {"herda_regra_geral": true}, "poda_arvores": {"herda_regra_geral": true}, "entulho_construcao": {"herda_regra_geral": true}, "limpeza_quintal_galhos_folhas_volumosos": {"tipo": "por_grupo", "janelas": []}}'::jsonb
)
ON CONFLICT (slug) DO UPDATE SET
  nome_exibicao = EXCLUDED.nome_exibicao,
  grupo_coleta = EXCLUDED.grupo_coleta,
  setor_coleta = EXCLUDED.setor_coleta,
  servicos_essenciais = EXCLUDED.servicos_essenciais,
  agenda = EXCLUDED.agenda;

INSERT INTO public.bairros (slug, nome_exibicao, grupo_coleta, setor_coleta, servicos_essenciais, agenda)
VALUES (
  'residencial-antonio-manoel-da-silva',
  'Residencial Antônio Manoel da Silva',
  NULL,
  NULL,
  '{}'::jsonb,
  '{"lixo_domestico": {"herda_regra_geral": true}, "poda_arvores": {"herda_regra_geral": true}, "entulho_construcao": {"herda_regra_geral": true}, "limpeza_quintal_galhos_folhas_volumosos": {"tipo": "por_grupo", "janelas": []}}'::jsonb
)
ON CONFLICT (slug) DO UPDATE SET
  nome_exibicao = EXCLUDED.nome_exibicao,
  grupo_coleta = EXCLUDED.grupo_coleta,
  setor_coleta = EXCLUDED.setor_coleta,
  servicos_essenciais = EXCLUDED.servicos_essenciais,
  agenda = EXCLUDED.agenda;

INSERT INTO public.bairros (slug, nome_exibicao, grupo_coleta, setor_coleta, servicos_essenciais, agenda)
VALUES (
  'residencial-cidade-jardim',
  'Residencial Cidade Jardim',
  NULL,
  2,
  '{}'::jsonb,
  '{"lixo_domestico": {"herda_regra_geral": true}, "poda_arvores": {"herda_regra_geral": true}, "entulho_construcao": {"herda_regra_geral": true}, "limpeza_quintal_galhos_folhas_volumosos": {"tipo": "por_grupo", "janelas": []}}'::jsonb
)
ON CONFLICT (slug) DO UPDATE SET
  nome_exibicao = EXCLUDED.nome_exibicao,
  grupo_coleta = EXCLUDED.grupo_coleta,
  setor_coleta = EXCLUDED.setor_coleta,
  servicos_essenciais = EXCLUDED.servicos_essenciais,
  agenda = EXCLUDED.agenda;

INSERT INTO public.bairros (slug, nome_exibicao, grupo_coleta, setor_coleta, servicos_essenciais, agenda)
VALUES (
  'residencial-dona-ira',
  'Residencial Dona Ira',
  NULL,
  3,
  '{}'::jsonb,
  '{"lixo_domestico": {"herda_regra_geral": true}, "poda_arvores": {"herda_regra_geral": true}, "entulho_construcao": {"herda_regra_geral": true}, "limpeza_quintal_galhos_folhas_volumosos": {"tipo": "por_grupo", "janelas": []}}'::jsonb
)
ON CONFLICT (slug) DO UPDATE SET
  nome_exibicao = EXCLUDED.nome_exibicao,
  grupo_coleta = EXCLUDED.grupo_coleta,
  setor_coleta = EXCLUDED.setor_coleta,
  servicos_essenciais = EXCLUDED.servicos_essenciais,
  agenda = EXCLUDED.agenda;

INSERT INTO public.bairros (slug, nome_exibicao, grupo_coleta, setor_coleta, servicos_essenciais, agenda)
VALUES (
  'residencial-dr-orlando-garcia-junqueira',
  'Residencial Dr. Orlando Garcia Junqueira',
  NULL,
  NULL,
  '{}'::jsonb,
  '{"lixo_domestico": {"herda_regra_geral": true}, "poda_arvores": {"herda_regra_geral": true}, "entulho_construcao": {"herda_regra_geral": true}, "limpeza_quintal_galhos_folhas_volumosos": {"tipo": "por_grupo", "janelas": []}}'::jsonb
)
ON CONFLICT (slug) DO UPDATE SET
  nome_exibicao = EXCLUDED.nome_exibicao,
  grupo_coleta = EXCLUDED.grupo_coleta,
  setor_coleta = EXCLUDED.setor_coleta,
  servicos_essenciais = EXCLUDED.servicos_essenciais,
  agenda = EXCLUDED.agenda;

INSERT INTO public.bairros (slug, nome_exibicao, grupo_coleta, setor_coleta, servicos_essenciais, agenda)
VALUES (
  'residencial-julieta',
  'Residencial Julieta',
  NULL,
  NULL,
  '{}'::jsonb,
  '{"lixo_domestico": {"herda_regra_geral": true}, "poda_arvores": {"herda_regra_geral": true}, "entulho_construcao": {"herda_regra_geral": true}, "limpeza_quintal_galhos_folhas_volumosos": {"tipo": "por_grupo", "janelas": []}}'::jsonb
)
ON CONFLICT (slug) DO UPDATE SET
  nome_exibicao = EXCLUDED.nome_exibicao,
  grupo_coleta = EXCLUDED.grupo_coleta,
  setor_coleta = EXCLUDED.setor_coleta,
  servicos_essenciais = EXCLUDED.servicos_essenciais,
  agenda = EXCLUDED.agenda;

INSERT INTO public.bairros (slug, nome_exibicao, grupo_coleta, setor_coleta, servicos_essenciais, agenda)
VALUES (
  'residencial-maria-luiza',
  'Residencial Maria Luiza',
  NULL,
  NULL,
  '{}'::jsonb,
  '{"lixo_domestico": {"herda_regra_geral": true}, "poda_arvores": {"herda_regra_geral": true}, "entulho_construcao": {"herda_regra_geral": true}, "limpeza_quintal_galhos_folhas_volumosos": {"tipo": "por_grupo", "janelas": []}}'::jsonb
)
ON CONFLICT (slug) DO UPDATE SET
  nome_exibicao = EXCLUDED.nome_exibicao,
  grupo_coleta = EXCLUDED.grupo_coleta,
  setor_coleta = EXCLUDED.setor_coleta,
  servicos_essenciais = EXCLUDED.servicos_essenciais,
  agenda = EXCLUDED.agenda;

INSERT INTO public.bairros (slug, nome_exibicao, grupo_coleta, setor_coleta, servicos_essenciais, agenda)
VALUES (
  'residencial-nadia',
  'Residencial Nádia',
  NULL,
  NULL,
  '{}'::jsonb,
  '{"lixo_domestico": {"herda_regra_geral": true}, "poda_arvores": {"herda_regra_geral": true}, "entulho_construcao": {"herda_regra_geral": true}, "limpeza_quintal_galhos_folhas_volumosos": {"tipo": "por_grupo", "janelas": []}}'::jsonb
)
ON CONFLICT (slug) DO UPDATE SET
  nome_exibicao = EXCLUDED.nome_exibicao,
  grupo_coleta = EXCLUDED.grupo_coleta,
  setor_coleta = EXCLUDED.setor_coleta,
  servicos_essenciais = EXCLUDED.servicos_essenciais,
  agenda = EXCLUDED.agenda;

INSERT INTO public.bairros (slug, nome_exibicao, grupo_coleta, setor_coleta, servicos_essenciais, agenda)
VALUES (
  'residencial-nadia-4',
  'Residencial Nadia 4',
  NULL,
  NULL,
  '{}'::jsonb,
  '{"lixo_domestico": {"herda_regra_geral": true}, "poda_arvores": {"herda_regra_geral": true}, "entulho_construcao": {"herda_regra_geral": true}, "limpeza_quintal_galhos_folhas_volumosos": {"tipo": "por_grupo", "janelas": []}}'::jsonb
)
ON CONFLICT (slug) DO UPDATE SET
  nome_exibicao = EXCLUDED.nome_exibicao,
  grupo_coleta = EXCLUDED.grupo_coleta,
  setor_coleta = EXCLUDED.setor_coleta,
  servicos_essenciais = EXCLUDED.servicos_essenciais,
  agenda = EXCLUDED.agenda;

INSERT INTO public.bairros (slug, nome_exibicao, grupo_coleta, setor_coleta, servicos_essenciais, agenda)
VALUES (
  'residencial-nadia-iv',
  'Residencial Nádia IV',
  NULL,
  NULL,
  '{}'::jsonb,
  '{"lixo_domestico": {"herda_regra_geral": true}, "poda_arvores": {"herda_regra_geral": true}, "entulho_construcao": {"herda_regra_geral": true}, "limpeza_quintal_galhos_folhas_volumosos": {"tipo": "por_grupo", "janelas": []}}'::jsonb
)
ON CONFLICT (slug) DO UPDATE SET
  nome_exibicao = EXCLUDED.nome_exibicao,
  grupo_coleta = EXCLUDED.grupo_coleta,
  setor_coleta = EXCLUDED.setor_coleta,
  servicos_essenciais = EXCLUDED.servicos_essenciais,
  agenda = EXCLUDED.agenda;

INSERT INTO public.bairros (slug, nome_exibicao, grupo_coleta, setor_coleta, servicos_essenciais, agenda)
VALUES (
  'residencial-nautico-e-pesca-rio-pardo',
  'Residencial Náutico e Pesca Rio Pardo',
  NULL,
  NULL,
  '{}'::jsonb,
  '{"lixo_domestico": {"herda_regra_geral": true}, "poda_arvores": {"herda_regra_geral": true}, "entulho_construcao": {"herda_regra_geral": true}, "limpeza_quintal_galhos_folhas_volumosos": {"tipo": "por_grupo", "janelas": []}}'::jsonb
)
ON CONFLICT (slug) DO UPDATE SET
  nome_exibicao = EXCLUDED.nome_exibicao,
  grupo_coleta = EXCLUDED.grupo_coleta,
  setor_coleta = EXCLUDED.setor_coleta,
  servicos_essenciais = EXCLUDED.servicos_essenciais,
  agenda = EXCLUDED.agenda;

INSERT INTO public.bairros (slug, nome_exibicao, grupo_coleta, setor_coleta, servicos_essenciais, agenda)
VALUES (
  'residencial-nobre-ville',
  'Residencial Nobre Ville',
  NULL,
  NULL,
  '{}'::jsonb,
  '{"lixo_domestico": {"herda_regra_geral": true}, "poda_arvores": {"herda_regra_geral": true}, "entulho_construcao": {"herda_regra_geral": true}, "limpeza_quintal_galhos_folhas_volumosos": {"tipo": "por_grupo", "janelas": []}}'::jsonb
)
ON CONFLICT (slug) DO UPDATE SET
  nome_exibicao = EXCLUDED.nome_exibicao,
  grupo_coleta = EXCLUDED.grupo_coleta,
  setor_coleta = EXCLUDED.setor_coleta,
  servicos_essenciais = EXCLUDED.servicos_essenciais,
  agenda = EXCLUDED.agenda;

INSERT INTO public.bairros (slug, nome_exibicao, grupo_coleta, setor_coleta, servicos_essenciais, agenda)
VALUES (
  'residencial-nova-guaira',
  'Residencial Nova Guaíra',
  NULL,
  1,
  '{}'::jsonb,
  '{"lixo_domestico": {"herda_regra_geral": true}, "poda_arvores": {"herda_regra_geral": true}, "entulho_construcao": {"herda_regra_geral": true}, "limpeza_quintal_galhos_folhas_volumosos": {"tipo": "por_grupo", "janelas": []}}'::jsonb
)
ON CONFLICT (slug) DO UPDATE SET
  nome_exibicao = EXCLUDED.nome_exibicao,
  grupo_coleta = EXCLUDED.grupo_coleta,
  setor_coleta = EXCLUDED.setor_coleta,
  servicos_essenciais = EXCLUDED.servicos_essenciais,
  agenda = EXCLUDED.agenda;

INSERT INTO public.bairros (slug, nome_exibicao, grupo_coleta, setor_coleta, servicos_essenciais, agenda)
VALUES (
  'residencial-portinari',
  'Residencial Portinari',
  NULL,
  1,
  '{}'::jsonb,
  '{"lixo_domestico": {"herda_regra_geral": true}, "poda_arvores": {"herda_regra_geral": true}, "entulho_construcao": {"herda_regra_geral": true}, "limpeza_quintal_galhos_folhas_volumosos": {"tipo": "por_grupo", "janelas": []}}'::jsonb
)
ON CONFLICT (slug) DO UPDATE SET
  nome_exibicao = EXCLUDED.nome_exibicao,
  grupo_coleta = EXCLUDED.grupo_coleta,
  setor_coleta = EXCLUDED.setor_coleta,
  servicos_essenciais = EXCLUDED.servicos_essenciais,
  agenda = EXCLUDED.agenda;

INSERT INTO public.bairros (slug, nome_exibicao, grupo_coleta, setor_coleta, servicos_essenciais, agenda)
VALUES (
  'residencial-r-guimaraes',
  'Residencial R. Guimarães',
  NULL,
  1,
  '{}'::jsonb,
  '{"lixo_domestico": {"herda_regra_geral": true}, "poda_arvores": {"herda_regra_geral": true}, "entulho_construcao": {"herda_regra_geral": true}, "limpeza_quintal_galhos_folhas_volumosos": {"tipo": "por_grupo", "janelas": []}}'::jsonb
)
ON CONFLICT (slug) DO UPDATE SET
  nome_exibicao = EXCLUDED.nome_exibicao,
  grupo_coleta = EXCLUDED.grupo_coleta,
  setor_coleta = EXCLUDED.setor_coleta,
  servicos_essenciais = EXCLUDED.servicos_essenciais,
  agenda = EXCLUDED.agenda;

INSERT INTO public.bairros (slug, nome_exibicao, grupo_coleta, setor_coleta, servicos_essenciais, agenda)
VALUES (
  'residencial-reynaldo-stein',
  'Residencial Reynaldo Stein',
  NULL,
  NULL,
  '{}'::jsonb,
  '{"lixo_domestico": {"herda_regra_geral": true}, "poda_arvores": {"herda_regra_geral": true}, "entulho_construcao": {"herda_regra_geral": true}, "limpeza_quintal_galhos_folhas_volumosos": {"tipo": "por_grupo", "janelas": []}}'::jsonb
)
ON CONFLICT (slug) DO UPDATE SET
  nome_exibicao = EXCLUDED.nome_exibicao,
  grupo_coleta = EXCLUDED.grupo_coleta,
  setor_coleta = EXCLUDED.setor_coleta,
  servicos_essenciais = EXCLUDED.servicos_essenciais,
  agenda = EXCLUDED.agenda;

INSERT INTO public.bairros (slug, nome_exibicao, grupo_coleta, setor_coleta, servicos_essenciais, agenda)
VALUES (
  'residencial-santa-terezinha',
  'Residencial Santa Terezinha',
  NULL,
  NULL,
  '{}'::jsonb,
  '{"lixo_domestico": {"herda_regra_geral": true}, "poda_arvores": {"herda_regra_geral": true}, "entulho_construcao": {"herda_regra_geral": true}, "limpeza_quintal_galhos_folhas_volumosos": {"tipo": "por_grupo", "janelas": []}}'::jsonb
)
ON CONFLICT (slug) DO UPDATE SET
  nome_exibicao = EXCLUDED.nome_exibicao,
  grupo_coleta = EXCLUDED.grupo_coleta,
  setor_coleta = EXCLUDED.setor_coleta,
  servicos_essenciais = EXCLUDED.servicos_essenciais,
  agenda = EXCLUDED.agenda;

INSERT INTO public.bairros (slug, nome_exibicao, grupo_coleta, setor_coleta, servicos_essenciais, agenda)
VALUES (
  'residencial-tais',
  'Residencial Taís',
  NULL,
  1,
  '{}'::jsonb,
  '{"lixo_domestico": {"herda_regra_geral": true}, "poda_arvores": {"herda_regra_geral": true}, "entulho_construcao": {"herda_regra_geral": true}, "limpeza_quintal_galhos_folhas_volumosos": {"tipo": "por_grupo", "janelas": []}}'::jsonb
)
ON CONFLICT (slug) DO UPDATE SET
  nome_exibicao = EXCLUDED.nome_exibicao,
  grupo_coleta = EXCLUDED.grupo_coleta,
  setor_coleta = EXCLUDED.setor_coleta,
  servicos_essenciais = EXCLUDED.servicos_essenciais,
  agenda = EXCLUDED.agenda;

INSERT INTO public.bairros (slug, nome_exibicao, grupo_coleta, setor_coleta, servicos_essenciais, agenda)
VALUES (
  'residencial-thobias-landim',
  'Residencial Thobias Landim',
  NULL,
  NULL,
  '{}'::jsonb,
  '{"lixo_domestico": {"herda_regra_geral": true}, "poda_arvores": {"herda_regra_geral": true}, "entulho_construcao": {"herda_regra_geral": true}, "limpeza_quintal_galhos_folhas_volumosos": {"tipo": "por_grupo", "janelas": []}}'::jsonb
)
ON CONFLICT (slug) DO UPDATE SET
  nome_exibicao = EXCLUDED.nome_exibicao,
  grupo_coleta = EXCLUDED.grupo_coleta,
  setor_coleta = EXCLUDED.setor_coleta,
  servicos_essenciais = EXCLUDED.servicos_essenciais,
  agenda = EXCLUDED.agenda;

INSERT INTO public.bairros (slug, nome_exibicao, grupo_coleta, setor_coleta, servicos_essenciais, agenda)
VALUES (
  'residencial-zenaide',
  'Residencial Zenaide',
  NULL,
  NULL,
  '{}'::jsonb,
  '{"lixo_domestico": {"herda_regra_geral": true}, "poda_arvores": {"herda_regra_geral": true}, "entulho_construcao": {"herda_regra_geral": true}, "limpeza_quintal_galhos_folhas_volumosos": {"tipo": "por_grupo", "janelas": []}}'::jsonb
)
ON CONFLICT (slug) DO UPDATE SET
  nome_exibicao = EXCLUDED.nome_exibicao,
  grupo_coleta = EXCLUDED.grupo_coleta,
  setor_coleta = EXCLUDED.setor_coleta,
  servicos_essenciais = EXCLUDED.servicos_essenciais,
  agenda = EXCLUDED.agenda;

INSERT INTO public.bairros (slug, nome_exibicao, grupo_coleta, setor_coleta, servicos_essenciais, agenda)
VALUES (
  'santa-helena',
  'Santa Helena',
  NULL,
  NULL,
  '{}'::jsonb,
  '{"lixo_domestico": {"herda_regra_geral": true}, "poda_arvores": {"herda_regra_geral": true}, "entulho_construcao": {"herda_regra_geral": true}, "limpeza_quintal_galhos_folhas_volumosos": {"tipo": "por_grupo", "janelas": []}}'::jsonb
)
ON CONFLICT (slug) DO UPDATE SET
  nome_exibicao = EXCLUDED.nome_exibicao,
  grupo_coleta = EXCLUDED.grupo_coleta,
  setor_coleta = EXCLUDED.setor_coleta,
  servicos_essenciais = EXCLUDED.servicos_essenciais,
  agenda = EXCLUDED.agenda;

INSERT INTO public.bairros (slug, nome_exibicao, grupo_coleta, setor_coleta, servicos_essenciais, agenda)
VALUES (
  'terra-do-sol',
  'Terra do Sol',
  NULL,
  NULL,
  '{}'::jsonb,
  '{"lixo_domestico": {"herda_regra_geral": true}, "poda_arvores": {"herda_regra_geral": true}, "entulho_construcao": {"herda_regra_geral": true}, "limpeza_quintal_galhos_folhas_volumosos": {"tipo": "por_grupo", "janelas": []}}'::jsonb
)
ON CONFLICT (slug) DO UPDATE SET
  nome_exibicao = EXCLUDED.nome_exibicao,
  grupo_coleta = EXCLUDED.grupo_coleta,
  setor_coleta = EXCLUDED.setor_coleta,
  servicos_essenciais = EXCLUDED.servicos_essenciais,
  agenda = EXCLUDED.agenda;

INSERT INTO public.bairros (slug, nome_exibicao, grupo_coleta, setor_coleta, servicos_essenciais, agenda)
VALUES (
  'vila-miguel-fabiano',
  'Vila Miguel Fabiano',
  NULL,
  NULL,
  '{}'::jsonb,
  '{"lixo_domestico": {"herda_regra_geral": true}, "poda_arvores": {"herda_regra_geral": true}, "entulho_construcao": {"herda_regra_geral": true}, "limpeza_quintal_galhos_folhas_volumosos": {"tipo": "por_grupo", "janelas": []}}'::jsonb
)
ON CONFLICT (slug) DO UPDATE SET
  nome_exibicao = EXCLUDED.nome_exibicao,
  grupo_coleta = EXCLUDED.grupo_coleta,
  setor_coleta = EXCLUDED.setor_coleta,
  servicos_essenciais = EXCLUDED.servicos_essenciais,
  agenda = EXCLUDED.agenda;

INSERT INTO public.bairros (slug, nome_exibicao, grupo_coleta, setor_coleta, servicos_essenciais, agenda)
VALUES (
  'vila-nossa-senhora-aparecida',
  'Vila Nossa Senhora Aparecida',
  NULL,
  NULL,
  '{}'::jsonb,
  '{"lixo_domestico": {"herda_regra_geral": true}, "poda_arvores": {"herda_regra_geral": true}, "entulho_construcao": {"herda_regra_geral": true}, "limpeza_quintal_galhos_folhas_volumosos": {"tipo": "por_grupo", "janelas": []}}'::jsonb
)
ON CONFLICT (slug) DO UPDATE SET
  nome_exibicao = EXCLUDED.nome_exibicao,
  grupo_coleta = EXCLUDED.grupo_coleta,
  setor_coleta = EXCLUDED.setor_coleta,
  servicos_essenciais = EXCLUDED.servicos_essenciais,
  agenda = EXCLUDED.agenda;

INSERT INTO public.bairros (slug, nome_exibicao, grupo_coleta, setor_coleta, servicos_essenciais, agenda)
VALUES (
  'vila-sao-bom-jesus-lapa',
  'Vila São Bom Jesus Lapa',
  NULL,
  NULL,
  '{}'::jsonb,
  '{"lixo_domestico": {"herda_regra_geral": true}, "poda_arvores": {"herda_regra_geral": true}, "entulho_construcao": {"herda_regra_geral": true}, "limpeza_quintal_galhos_folhas_volumosos": {"tipo": "por_grupo", "janelas": []}}'::jsonb
)
ON CONFLICT (slug) DO UPDATE SET
  nome_exibicao = EXCLUDED.nome_exibicao,
  grupo_coleta = EXCLUDED.grupo_coleta,
  setor_coleta = EXCLUDED.setor_coleta,
  servicos_essenciais = EXCLUDED.servicos_essenciais,
  agenda = EXCLUDED.agenda;

INSERT INTO public.bairros (slug, nome_exibicao, grupo_coleta, setor_coleta, servicos_essenciais, agenda)
VALUES (
  'vivendas-do-bom-jardim',
  'Vivendas do Bom Jardim',
  NULL,
  2,
  '{}'::jsonb,
  '{"lixo_domestico": {"herda_regra_geral": true}, "poda_arvores": {"herda_regra_geral": true}, "entulho_construcao": {"herda_regra_geral": true}, "limpeza_quintal_galhos_folhas_volumosos": {"tipo": "por_grupo", "janelas": []}}'::jsonb
)
ON CONFLICT (slug) DO UPDATE SET
  nome_exibicao = EXCLUDED.nome_exibicao,
  grupo_coleta = EXCLUDED.grupo_coleta,
  setor_coleta = EXCLUDED.setor_coleta,
  servicos_essenciais = EXCLUDED.servicos_essenciais,
  agenda = EXCLUDED.agenda;


-- =====================================================
-- ESTATÍSTICAS DA MIGRAÇÃO
-- =====================================================
-- Total de bairros inseridos: 87
-- Setor 1: 7 bairros
-- Setor 2: 3 bairros
-- Setor 3: 9 bairros
-- Setor 4: 3 bairros
-- Sem setor definido: 65 bairros

-- Bairros sem setor de coleta definido:
-- • Área Rural de Guaíra
-- • Associação Nipo-Brasileira
-- • Campos Elíseos
-- • Centro / Geral
-- • Conjunto Habitacional Abdala Elias
-- • Conjunto Habitacional Antonio Nogueira Lelis
-- • Conjunto Habitacional Gabriel Garcia de Carvalho
-- • Conjunto Habitacional Geralda Geltrudes da Silva
-- • Conjunto Habitacional Padre Mário Lano
-- • Conjunto Habitacional Prefeito José Pugliesi
-- • Conjunto Habitacional Vereador Luiz Dutra do Prado
-- • Conjunto Residencial Antônio Garcia
-- • Desmembramento Barros
-- • Desmembramento Chácara Bela Vista
-- • Desmembramento Chácara Delfim
-- • Desmembramento Chácara Nossa Senhora
-- • Desmembramento Chácara Santa Luzia
-- • Desmembramento Chácara Santa Quitéria
-- • Desmembramento Dona Tâninha
-- • Desmembramento Ernesto Pacheco
-- • Desmembramento Fazenda Antas
-- • Desmembramento Fazenda São Judas Tadeu
-- • Desmembramento Joaquim Baixote
-- • Desmembramento Katsumi Miura
-- • Desmembramento Recreio Santa Isabel
-- • Desmembramento Reis e Marques
-- • Desmembramento Rialga
-- • Desmembramento Santa Elýdia
-- • Desmembramento Santo Antônio
-- • Desmembramento São Francisco
-- • Desmembramento Sítio Santa Quitéria
-- • Distrito Industrial I
-- • Distrito Industrial Luiz Carlos Nogueira
-- • Doutor Fábio Talarico
-- • Estância Morada Nova
-- • Etelvina Santana da Silva
-- • Guaíra
-- • Industrial
-- • Jardim de Monet
-- • Jardim Lígia
-- • Jardim Lígia 2
-- • Jardim Lígia II
-- • Jardim Palmares
-- • Jardim São Francisco I
-- • Joaquim Pereira Lelis
-- • Loteamento São José
-- • Recreio São Bernardo
-- • Residencial Antônio Manoel da Silva
-- • Residencial Dr. Orlando Garcia Junqueira
-- • Residencial Julieta
-- • Residencial Maria Luiza
-- • Residencial Nádia
-- • Residencial Nadia 4
-- • Residencial Nádia IV
-- • Residencial Náutico e Pesca Rio Pardo
-- • Residencial Nobre Ville
-- • Residencial Reynaldo Stein
-- • Residencial Santa Terezinha
-- • Residencial Thobias Landim
-- • Residencial Zenaide
-- • Santa Helena
-- • Terra do Sol
-- • Vila Miguel Fabiano
-- • Vila Nossa Senhora Aparecida
-- • Vila São Bom Jesus Lapa