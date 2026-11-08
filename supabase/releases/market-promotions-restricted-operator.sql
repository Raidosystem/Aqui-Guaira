BEGIN;

SET LOCAL lock_timeout = '5s';

DO $preflight$
BEGIN
  IF to_regprocedure('aqui_private.session_active()') IS NULL
    OR to_regprocedure('aqui_private.owns_company(uuid)') IS NULL
    OR to_regprocedure('aqui_private.is_admin()') IS NULL
    OR NOT EXISTS (
      SELECT FROM pg_catalog.pg_class
      WHERE oid = to_regclass('public.empresas') AND relrowsecurity
    )
    OR NOT EXISTS (
      SELECT FROM pg_catalog.pg_class
      WHERE oid = to_regclass('public.vagas') AND relrowsecurity
    ) THEN
    RAISE EXCEPTION 'Prerequisitos de sessao, propriedade ou RLS ausentes.';
  END IF;
  IF to_regclass('public.promocoes_mercado') IS NOT NULL
    OR to_regclass('public.promocoes_mercado_encartes') IS NOT NULL
    OR to_regclass('aqui_private.market_promotion_operators') IS NOT NULL THEN
    RAISE EXCEPTION 'Estruturas de promocoes ja existem. Inspecione antes de instalar.';
  END IF;
END;
$preflight$;

-- Origem 20261107154313_market_promotions.sql
CREATE FUNCTION aqui_private.is_market(p_empresa_id uuid)
RETURNS boolean LANGUAGE sql STABLE SET search_path = pg_catalog AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.empresas e
    LEFT JOIN public.categorias c ON c.id = e.categoria_id
    WHERE e.id = p_empresa_id AND e.status = 'aprovado' AND e.ativa IS TRUE
      AND (
        regexp_replace(coalesce(e.cnae, ''), '[^0-9]', '', 'g') IN ('4711301', '4711302', '4712100')
        OR lower(btrim(c.nome)) IN (
          'supermercado', 'supermercados', 'hipermercado', 'minimercado',
          'mercearia', 'varejo alimentar (mercados)'
        )
      )
  );
$$;

CREATE FUNCTION aqui_private.valid_market_items(p_items jsonb, p_published boolean)
RETURNS boolean LANGUAGE plpgsql IMMUTABLE SET search_path = pg_catalog AS $$
DECLARE item jsonb;
BEGIN
  IF jsonb_typeof(p_items) <> 'array' THEN RETURN false; END IF;
  IF jsonb_array_length(p_items) NOT BETWEEN 1 AND 60 THEN RETURN false; END IF;

  FOR item IN SELECT value FROM jsonb_array_elements(p_items) LOOP
    IF jsonb_typeof(item) <> 'object' THEN RETURN false; END IF;
    IF NOT (item ?& ARRAY['produto', 'preco_centavos', 'unidade', 'condicoes'])
       OR item - ARRAY['produto', 'preco_centavos', 'unidade', 'condicoes'] <> '{}'::jsonb
       OR jsonb_typeof(item->'produto') <> 'string'
       OR jsonb_typeof(item->'unidade') <> 'string'
       OR jsonb_typeof(item->'condicoes') <> 'string'
       OR char_length(item->>'produto') > 120
       OR char_length(item->>'unidade') > 35
       OR char_length(item->>'condicoes') > 160
       OR jsonb_typeof(item->'preco_centavos') NOT IN ('number', 'null')
    THEN RETURN false; END IF;

    IF jsonb_typeof(item->'preco_centavos') = 'number' AND (
      (item->>'preco_centavos') !~ '^[0-9]{1,8}$'
      OR (item->>'preco_centavos')::numeric NOT BETWEEN 1 AND 99999999
    ) THEN RETURN false; END IF;

    IF p_published AND (
      btrim(item->>'produto') = '' OR btrim(item->>'unidade') = ''
      OR jsonb_typeof(item->'preco_centavos') = 'null'
    ) THEN RETURN false; END IF;
  END LOOP;
  RETURN true;
END;
$$;

REVOKE ALL ON FUNCTION aqui_private.is_market(uuid), aqui_private.valid_market_items(jsonb, boolean) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION aqui_private.is_market(uuid) TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION aqui_private.valid_market_items(jsonb, boolean) TO authenticated, service_role;

CREATE TABLE public.promocoes_mercado (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id uuid NOT NULL REFERENCES public.empresas(id),
  titulo text NOT NULL CHECK (char_length(btrim(titulo)) BETWEEN 1 AND 80),
  itens jsonb NOT NULL,
  validade date CHECK (validade BETWEEN '2000-01-01' AND '9999-12-31'),
  status text NOT NULL DEFAULT 'rascunho' CHECK (status IN ('rascunho', 'publicada', 'arquivada')),
  revisao uuid NOT NULL DEFAULT gen_random_uuid(),
  atualizado_em timestamptz NOT NULL DEFAULT now(),
  CHECK (status <> 'publicada' OR validade IS NOT NULL),
  CHECK (aqui_private.valid_market_items(itens, status = 'publicada'))
);

CREATE FUNCTION aqui_private.touch_market_promotion()
RETURNS trigger LANGUAGE plpgsql SET search_path = pg_catalog AS $$
BEGIN
  NEW.revisao := gen_random_uuid();
  NEW.atualizado_em := now();
  RETURN NEW;
END;
$$;

REVOKE ALL ON FUNCTION aqui_private.touch_market_promotion() FROM PUBLIC, anon, authenticated;
CREATE TRIGGER market_promotion_revision BEFORE UPDATE ON public.promocoes_mercado
  FOR EACH ROW EXECUTE FUNCTION aqui_private.touch_market_promotion();

CREATE INDEX market_promotions_owner ON public.promocoes_mercado (empresa_id, atualizado_em DESC);
CREATE INDEX market_promotions_public ON public.promocoes_mercado (validade, id) WHERE status = 'publicada';

ALTER TABLE public.promocoes_mercado ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.promocoes_mercado FROM PUBLIC, anon, authenticated;
GRANT SELECT ON public.promocoes_mercado TO anon, authenticated;
GRANT INSERT (id, empresa_id, titulo, itens, validade, status),
      UPDATE (titulo, itens, validade, status) ON public.promocoes_mercado TO authenticated;

CREATE POLICY market_promotion_public_read ON public.promocoes_mercado FOR SELECT TO anon, authenticated
  USING (status = 'publicada' AND validade >= (now() AT TIME ZONE 'America/Sao_Paulo')::date
         AND aqui_private.is_market(empresa_id));
CREATE POLICY market_promotion_owner_read ON public.promocoes_mercado FOR SELECT TO authenticated
  USING (aqui_private.owns_company(empresa_id));
CREATE POLICY market_promotion_owner_insert ON public.promocoes_mercado FOR INSERT TO authenticated
  WITH CHECK (aqui_private.owns_company(empresa_id) AND aqui_private.is_market(empresa_id)
              AND (status <> 'publicada' OR validade >= (now() AT TIME ZONE 'America/Sao_Paulo')::date));
CREATE POLICY market_promotion_owner_update ON public.promocoes_mercado FOR UPDATE TO authenticated
  USING (aqui_private.owns_company(empresa_id))
  WITH CHECK (aqui_private.owns_company(empresa_id)
              AND (status = 'arquivada' OR aqui_private.is_market(empresa_id))
              AND (status <> 'publicada' OR validade >= (now() AT TIME ZONE 'America/Sao_Paulo')::date));

CREATE FUNCTION public.pode_gerenciar_promocoes(p_empresa_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY INVOKER SET search_path = pg_catalog AS $$
  SELECT aqui_private.owns_company(p_empresa_id) AND aqui_private.is_market(p_empresa_id);
$$;
REVOKE ALL ON FUNCTION public.pode_gerenciar_promocoes(uuid) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.pode_gerenciar_promocoes(uuid) TO authenticated;

CREATE FUNCTION public.buscar_ofertas_mercado(p_produto text DEFAULT '', p_mercado text DEFAULT '', p_offset integer DEFAULT 0)
RETURNS TABLE (
  promocao_id uuid, ordem bigint, empresa_id uuid, mercado text, produto text,
  unidade text, preco_centavos integer, condicoes text, validade date
)
LANGUAGE sql STABLE SECURITY INVOKER SET search_path = pg_catalog AS $$
  SELECT p.id, i.ordem, e.id, e.nome, i.item->>'produto', i.item->>'unidade',
         (i.item->>'preco_centavos')::integer, i.item->>'condicoes', p.validade
  FROM public.promocoes_mercado p
  JOIN public.empresas e ON e.id = p.empresa_id
  CROSS JOIN LATERAL jsonb_array_elements(p.itens) WITH ORDINALITY AS i(item, ordem)
  WHERE p.status = 'publicada' AND p.validade >= (now() AT TIME ZONE 'America/Sao_Paulo')::date
    AND aqui_private.is_market(p.empresa_id)
    AND strpos(
      translate(lower(i.item->>'produto'), 'áàâãäéèêëíìîïóòôõöúùûüç', 'aaaaaeeeeiiiiooooouuuuc'),
      translate(lower(left(btrim(coalesce(p_produto, '')), 100)), 'áàâãäéèêëíìîïóòôõöúùûüç', 'aaaaaeeeeiiiiooooouuuuc')
    ) > 0
    AND strpos(
      translate(lower(e.nome), 'áàâãäéèêëíìîïóòôõöúùûüç', 'aaaaaeeeeiiiiooooouuuuc'),
      translate(lower(left(btrim(coalesce(p_mercado, '')), 100)), 'áàâãäéèêëíìîïóòôõöúùûüç', 'aaaaaeeeeiiiiooooouuuuc')
    ) > 0
  ORDER BY p.validade, e.nome, p.id, i.ordem
  LIMIT 25 OFFSET least(greatest(coalesce(p_offset, 0), 0), 20000);
$$;
REVOKE ALL ON FUNCTION public.buscar_ofertas_mercado(text, text, integer) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.buscar_ofertas_mercado(text, text, integer) TO anon, authenticated;

-- Origem 20261107232020_market_promotion_expiry.sql
-- Keep existing promotions in the seller's archive once their validity ends.
ALTER TABLE public.promocoes_mercado
  ADD COLUMN acao_ao_vencer text DEFAULT 'arquivar';

ALTER TABLE public.promocoes_mercado
  ALTER COLUMN acao_ao_vencer DROP DEFAULT,
  ADD CONSTRAINT market_promotion_expiry_action
    CHECK (acao_ao_vencer IN ('arquivar', 'retirar')),
  ADD CONSTRAINT market_promotion_published_expiry_action
    CHECK (status <> 'publicada' OR acao_ao_vencer IS NOT NULL);

GRANT INSERT (acao_ao_vencer), UPDATE (acao_ao_vencer)
  ON public.promocoes_mercado TO authenticated;

-- Origem 20261107235346_market_promotion_ocr_review.sql
ALTER TABLE public.promocoes_mercado
  ADD COLUMN revisao_ocr jsonb NOT NULL DEFAULT '[]'::jsonb,
  ADD CONSTRAINT market_promotion_ocr_review_shape CHECK (
    CASE WHEN jsonb_typeof(revisao_ocr) = 'array' AND jsonb_typeof(itens) = 'array' THEN
      revisao_ocr = '[]'::jsonb OR (
        jsonb_array_length(revisao_ocr) = jsonb_array_length(itens)
        AND octet_length(revisao_ocr::text) <= 65536
        AND NOT jsonb_path_exists(revisao_ocr, 'strict $[*] ? (@.type() != "array")')
        AND NOT jsonb_path_exists(revisao_ocr, 'strict $[*][*] ? (@.type() != "string")', '{}', true)
      )
    ELSE false END
  ),
  ADD CONSTRAINT market_promotion_ocr_review_required
    CHECK (status <> 'publicada' OR revisao_ocr = '[]'::jsonb);

-- Notes use the same row-level ownership rules and cannot exist in a public promotion.
GRANT INSERT (revisao_ocr), UPDATE (revisao_ocr)
  ON public.promocoes_mercado TO authenticated;

-- Origem 20261108000217_market_promotion_flyer_photo.sql
CREATE TABLE public.promocoes_mercado_encartes (
  promocao_id uuid PRIMARY KEY REFERENCES public.promocoes_mercado(id),
  mime text NOT NULL,
  conteudo bytea NOT NULL CHECK (octet_length(conteudo) BETWEEN 1 AND 12582912),
  hash text GENERATED ALWAYS AS (encode(sha256(conteudo), 'hex')) STORED,
  CONSTRAINT market_flyer_image_type CHECK (
    CASE mime
      WHEN 'image/jpeg' THEN substring(conteudo FROM 1 FOR 3) = decode('ffd8ff', 'hex')
      WHEN 'image/png' THEN substring(conteudo FROM 1 FOR 8) = decode('89504e470d0a1a0a', 'hex')
      WHEN 'image/webp' THEN substring(conteudo FROM 1 FOR 4) = decode('52494646', 'hex')
        AND substring(conteudo FROM 9 FOR 4) = decode('57454250', 'hex')
      ELSE false
    END
  )
);

ALTER TABLE public.promocoes_mercado_encartes ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.promocoes_mercado_encartes FROM PUBLIC, anon, authenticated;
GRANT SELECT, INSERT (promocao_id, mime, conteudo), UPDATE (mime, conteudo)
  ON public.promocoes_mercado_encartes TO authenticated;

CREATE POLICY market_flyer_owner ON public.promocoes_mercado_encartes FOR ALL TO authenticated
  USING (EXISTS (
    SELECT FROM public.promocoes_mercado p
    WHERE p.id = promocao_id AND aqui_private.owns_company(p.empresa_id)
  ))
  WITH CHECK (EXISTS (
    SELECT FROM public.promocoes_mercado p
    WHERE p.id = promocao_id AND aqui_private.owns_company(p.empresa_id)
  ));

CREATE FUNCTION public.salvar_promocao_com_encarte(
  p_empresa_id uuid, p_id uuid, p_revisao uuid, p_dados jsonb, p_mime text, p_foto text
)
RETURNS SETOF public.promocoes_mercado
LANGUAGE plpgsql SECURITY INVOKER SET search_path = pg_catalog AS $$
DECLARE saved public.promocoes_mercado%ROWTYPE;
BEGIN
  IF p_revisao IS NULL THEN
    INSERT INTO public.promocoes_mercado (id, empresa_id, titulo, itens, validade, acao_ao_vencer, revisao_ocr, status)
    VALUES (p_id, p_empresa_id, p_dados->>'titulo', p_dados->'itens', (p_dados->>'validade')::date,
      p_dados->>'acao_ao_vencer', p_dados->'revisao_ocr', p_dados->>'status')
    RETURNING * INTO saved;
  ELSE
    UPDATE public.promocoes_mercado
    SET titulo = p_dados->>'titulo',
        itens = p_dados->'itens',
        validade = (p_dados->>'validade')::date,
        acao_ao_vencer = p_dados->>'acao_ao_vencer',
        revisao_ocr = p_dados->'revisao_ocr',
        status = p_dados->>'status'
    WHERE id = p_id AND empresa_id = p_empresa_id AND revisao = p_revisao
    RETURNING * INTO saved;
  END IF;

  IF NOT FOUND THEN RETURN; END IF;

  INSERT INTO public.promocoes_mercado_encartes (promocao_id, mime, conteudo)
  VALUES (saved.id, p_mime, decode(p_foto, 'base64'))
  ON CONFLICT (promocao_id) DO UPDATE SET mime = EXCLUDED.mime, conteudo = EXCLUDED.conteudo;

  RETURN NEXT saved;
END;
$$;

CREATE FUNCTION public.ler_encarte_promocao(p_id uuid)
RETURNS TABLE (mime text, base64 text)
LANGUAGE sql STABLE SECURITY INVOKER SET search_path = pg_catalog AS $$
  SELECT e.mime, encode(e.conteudo, 'base64')
  FROM public.promocoes_mercado_encartes e
  WHERE e.promocao_id = p_id;
$$;

REVOKE ALL ON FUNCTION public.salvar_promocao_com_encarte(uuid, uuid, uuid, jsonb, text, text),
  public.ler_encarte_promocao(uuid) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.salvar_promocao_com_encarte(uuid, uuid, uuid, jsonb, text, text),
  public.ler_encarte_promocao(uuid) TO authenticated;

-- Origem 20261108001654_public_market_flyers.sql
CREATE FUNCTION aqui_private.market_flyer_is_public(p_empresa_id uuid, p_status text, p_validade date)
RETURNS boolean LANGUAGE sql STABLE SECURITY INVOKER SET search_path = pg_catalog AS $$
  SELECT p_status = 'publicada'
    AND p_validade >= (now() AT TIME ZONE 'America/Sao_Paulo')::date
    AND aqui_private.is_market(p_empresa_id);
$$;
REVOKE ALL ON FUNCTION aqui_private.market_flyer_is_public(uuid, text, date) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION aqui_private.market_flyer_is_public(uuid, text, date) TO anon, authenticated;

GRANT SELECT (promocao_id, mime, conteudo) ON public.promocoes_mercado_encartes TO anon;
CREATE POLICY market_flyer_public_read ON public.promocoes_mercado_encartes FOR SELECT TO anon, authenticated
  USING (EXISTS (
    SELECT FROM public.promocoes_mercado p
    WHERE p.id = promocao_id AND aqui_private.market_flyer_is_public(p.empresa_id, p.status, p.validade)
  ));

CREATE FUNCTION public.listar_encartes_publicos(p_empresa_id uuid)
RETURNS TABLE (id uuid, titulo text, validade date)
LANGUAGE sql STABLE SECURITY INVOKER SET search_path = pg_catalog AS $$
  SELECT p.id, p.titulo, p.validade
  FROM public.promocoes_mercado p
  JOIN public.promocoes_mercado_encartes e ON e.promocao_id = p.id
  WHERE p.empresa_id = p_empresa_id
    AND aqui_private.market_flyer_is_public(p.empresa_id, p.status, p.validade)
  ORDER BY p.validade, p.titulo, p.id;
$$;

CREATE FUNCTION public.baixar_encarte_publico(p_empresa_id uuid, p_id uuid)
RETURNS TABLE (mime text, base64 text)
LANGUAGE sql STABLE SECURITY INVOKER SET search_path = pg_catalog AS $$
  SELECT e.mime, encode(e.conteudo, 'base64')
  FROM public.promocoes_mercado p
  JOIN public.promocoes_mercado_encartes e ON e.promocao_id = p.id
  WHERE p.id = p_id AND p.empresa_id = p_empresa_id
    AND aqui_private.market_flyer_is_public(p.empresa_id, p.status, p.validade);
$$;

-- Keep the editor's reader restricted to the owner.
CREATE OR REPLACE FUNCTION public.ler_encarte_promocao(p_id uuid)
RETURNS TABLE (mime text, base64 text)
LANGUAGE sql STABLE SECURITY INVOKER SET search_path = pg_catalog AS $$
  SELECT e.mime, encode(e.conteudo, 'base64')
  FROM public.promocoes_mercado_encartes e
  JOIN public.promocoes_mercado p ON p.id = e.promocao_id
  WHERE e.promocao_id = p_id AND aqui_private.owns_company(p.empresa_id);
$$;

REVOKE ALL ON FUNCTION public.listar_encartes_publicos(uuid), public.baixar_encarte_publico(uuid, uuid)
  FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.listar_encartes_publicos(uuid), public.baixar_encarte_publico(uuid, uuid)
  TO anon, authenticated;

-- Origem 20261108002528_public_market_profile_offers.sql
CREATE FUNCTION public.listar_promocoes_publicas_mercado(p_empresa_id uuid)
RETURNS TABLE (id uuid, titulo text, validade date, itens jsonb, tem_encarte boolean)
LANGUAGE sql STABLE SECURITY INVOKER SET search_path = pg_catalog AS $$
  SELECT p.id, p.titulo, p.validade, p.itens, e.promocao_id IS NOT NULL
  FROM public.promocoes_mercado p
  LEFT JOIN public.promocoes_mercado_encartes e ON e.promocao_id = p.id
  WHERE p.empresa_id = p_empresa_id
    AND aqui_private.market_flyer_is_public(p.empresa_id, p.status, p.validade);
$$;

REVOKE ALL ON FUNCTION public.listar_promocoes_publicas_mercado(uuid)
  FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.listar_promocoes_publicas_mercado(uuid)
  TO anon, authenticated;

-- Origem 07-operador-promocoes.sql
CREATE TABLE aqui_private.market_promotion_operators (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id),
  empresa_id uuid NOT NULL REFERENCES public.empresas(id),
  granted_at timestamptz NOT NULL DEFAULT now(),
  revoked_at timestamptz
);
ALTER TABLE aqui_private.market_promotion_operators ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON aqui_private.market_promotion_operators FROM PUBLIC, anon, authenticated, service_role;

CREATE FUNCTION aqui_private.is_market_promotion_operator()
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = pg_catalog AS $$
  SELECT EXISTS (
    SELECT FROM aqui_private.market_promotion_operators p WHERE p.user_id = (SELECT auth.uid())
  );
$$;

CREATE FUNCTION aqui_private.active_market_promotion_company()
RETURNS uuid LANGUAGE sql STABLE SECURITY DEFINER SET search_path = pg_catalog AS $$
  SELECT p.empresa_id
  FROM aqui_private.market_promotion_operators p
  WHERE p.user_id = (SELECT auth.uid()) AND p.revoked_at IS NULL
    AND (SELECT aqui_private.session_active());
$$;

CREATE FUNCTION aqui_private.may_manage_market_promotions(company_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY INVOKER SET search_path = pg_catalog AS $$
  SELECT CASE WHEN (SELECT aqui_private.is_market_promotion_operator())
    THEN coalesce(company_id = (SELECT aqui_private.active_market_promotion_company()), false)
    ELSE aqui_private.owns_company(company_id)
  END;
$$;

REVOKE ALL ON FUNCTION aqui_private.is_market_promotion_operator(),
  aqui_private.active_market_promotion_company(), aqui_private.may_manage_market_promotions(uuid)
  FROM PUBLIC, anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION aqui_private.is_market_promotion_operator(),
  aqui_private.active_market_promotion_company(), aqui_private.may_manage_market_promotions(uuid)
  TO authenticated;

CREATE POLICY market_operator_no_company_insert ON public.empresas AS RESTRICTIVE
  FOR INSERT TO authenticated WITH CHECK (NOT (SELECT aqui_private.is_market_promotion_operator()));
CREATE POLICY market_operator_no_company_update ON public.empresas AS RESTRICTIVE
  FOR UPDATE TO authenticated USING (NOT (SELECT aqui_private.is_market_promotion_operator()))
  WITH CHECK (NOT (SELECT aqui_private.is_market_promotion_operator()));
CREATE POLICY market_operator_no_company_delete ON public.empresas AS RESTRICTIVE
  FOR DELETE TO authenticated USING (NOT (SELECT aqui_private.is_market_promotion_operator()));
CREATE POLICY market_operator_no_job_insert ON public.vagas AS RESTRICTIVE
  FOR INSERT TO authenticated WITH CHECK (NOT (SELECT aqui_private.is_market_promotion_operator()));
CREATE POLICY market_operator_no_job_update ON public.vagas AS RESTRICTIVE
  FOR UPDATE TO authenticated USING (NOT (SELECT aqui_private.is_market_promotion_operator()))
  WITH CHECK (NOT (SELECT aqui_private.is_market_promotion_operator()));
CREATE POLICY market_operator_no_job_delete ON public.vagas AS RESTRICTIVE
  FOR DELETE TO authenticated USING (NOT (SELECT aqui_private.is_market_promotion_operator()));

ALTER POLICY market_promotion_owner_read ON public.promocoes_mercado
  USING (aqui_private.may_manage_market_promotions(empresa_id));
ALTER POLICY market_promotion_owner_insert ON public.promocoes_mercado
  WITH CHECK (aqui_private.may_manage_market_promotions(empresa_id) AND aqui_private.is_market(empresa_id)
    AND (status <> 'publicada' OR validade >= (now() AT TIME ZONE 'America/Sao_Paulo')::date));
ALTER POLICY market_promotion_owner_update ON public.promocoes_mercado
  USING (aqui_private.may_manage_market_promotions(empresa_id))
  WITH CHECK (aqui_private.may_manage_market_promotions(empresa_id)
    AND (status = 'arquivada' OR aqui_private.is_market(empresa_id))
    AND (status <> 'publicada' OR validade >= (now() AT TIME ZONE 'America/Sao_Paulo')::date));

ALTER POLICY market_flyer_owner ON public.promocoes_mercado_encartes
  USING (EXISTS (
    SELECT FROM public.promocoes_mercado p
    WHERE p.id = promocao_id AND aqui_private.may_manage_market_promotions(p.empresa_id)
  ))
  WITH CHECK (EXISTS (
    SELECT FROM public.promocoes_mercado p
    WHERE p.id = promocao_id AND aqui_private.may_manage_market_promotions(p.empresa_id)
  ));

CREATE OR REPLACE FUNCTION public.pode_gerenciar_promocoes(p_empresa_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY INVOKER SET search_path = pg_catalog AS $$
  SELECT aqui_private.may_manage_market_promotions(p_empresa_id) AND aqui_private.is_market(p_empresa_id);
$$;

CREATE OR REPLACE FUNCTION public.ler_encarte_promocao(p_id uuid)
RETURNS TABLE (mime text, base64 text)
LANGUAGE sql STABLE SECURITY INVOKER SET search_path = pg_catalog AS $$
  SELECT e.mime, encode(e.conteudo, 'base64')
  FROM public.promocoes_mercado_encartes e
  JOIN public.promocoes_mercado p ON p.id = e.promocao_id
  WHERE e.promocao_id = p_id AND aqui_private.may_manage_market_promotions(p.empresa_id);
$$;

CREATE FUNCTION public.minha_empresa_de_promocoes()
RETURNS uuid LANGUAGE sql STABLE SECURITY INVOKER SET search_path = pg_catalog AS $$
  SELECT company_id
  FROM (SELECT aqui_private.active_market_promotion_company() AS company_id) AS operator
  WHERE aqui_private.is_market(company_id);
$$;
REVOKE ALL ON FUNCTION public.minha_empresa_de_promocoes() FROM PUBLIC, anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.minha_empresa_de_promocoes() TO authenticated;

NOTIFY pgrst, 'reload schema';

COMMIT;
