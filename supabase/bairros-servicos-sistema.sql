-- =====================================================
-- SISTEMA DE BAIRROS E SERVIÇOS POR BAIRRO
-- =====================================================
-- Este script cria as tabelas necessárias para o sistema
-- de "Serviços por Bairro" funcionar 100% online
-- =====================================================

-- 1. Tabela de Bairros
CREATE TABLE IF NOT EXISTS public.bairros (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  slug text UNIQUE NOT NULL,
  nome_exibicao text NOT NULL,
  grupo_coleta text,
  setor_coleta integer,
  servicos_essenciais jsonb DEFAULT '{}'::jsonb,
  agenda jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- 2. Tabela de Setores de Coleta
CREATE TABLE IF NOT EXISTS public.setores_coleta (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  numero integer UNIQUE NOT NULL,
  semana integer NOT NULL,
  bairros text[] NOT NULL,
  calendario_2026 jsonb NOT NULL,
  calendario_2027 jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- 3. Tabela de Informações Gerais do Município
CREATE TABLE IF NOT EXISTS public.informacoes_municipio (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  chave text UNIQUE NOT NULL, -- Ex: 'guaira-sp'
  municipio text NOT NULL,
  uf text NOT NULL,
  timezone text DEFAULT 'America/Sao_Paulo',
  atualizado_em date NOT NULL,
  regras_gerais jsonb DEFAULT '{}'::jsonb,
  informacoes_coleta jsonb DEFAULT '{}'::jsonb,
  links_oficiais jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- 4. Índices para performance
CREATE INDEX IF NOT EXISTS idx_bairros_slug ON public.bairros(slug);
CREATE INDEX IF NOT EXISTS idx_bairros_setor ON public.bairros(setor_coleta);
CREATE INDEX IF NOT EXISTS idx_setores_numero ON public.setores_coleta(numero);
CREATE INDEX IF NOT EXISTS idx_info_municipio_chave ON public.informacoes_municipio(chave);

-- 5. Habilitar Row Level Security (RLS)
ALTER TABLE public.bairros ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.setores_coleta ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.informacoes_municipio ENABLE ROW LEVEL SECURITY;

-- 6. Políticas RLS - Leitura pública
CREATE POLICY "Permitir leitura pública de bairros"
  ON public.bairros FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Permitir leitura pública de setores"
  ON public.setores_coleta FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Permitir leitura pública de informações do município"
  ON public.informacoes_municipio FOR SELECT
  TO public
  USING (true);

-- 7. Políticas RLS - Escrita para usuários autenticados
-- Nota: Ajuste essas políticas conforme necessário para sua aplicação
CREATE POLICY "Permitir inserção autenticada de bairros"
  ON public.bairros FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Permitir atualização autenticada de bairros"
  ON public.bairros FOR UPDATE
  TO authenticated
  USING (true);

CREATE POLICY "Permitir deleção autenticada de bairros"
  ON public.bairros FOR DELETE
  TO authenticated
  USING (true);

-- Políticas para setores_coleta
CREATE POLICY "Permitir inserção autenticada de setores"
  ON public.setores_coleta FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Permitir atualização autenticada de setores"
  ON public.setores_coleta FOR UPDATE
  TO authenticated
  USING (true);

CREATE POLICY "Permitir deleção autenticada de setores"
  ON public.setores_coleta FOR DELETE
  TO authenticated
  USING (true);

-- Políticas para informacoes_municipio
CREATE POLICY "Permitir inserção autenticada de informações"
  ON public.informacoes_municipio FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Permitir atualização autenticada de informações"
  ON public.informacoes_municipio FOR UPDATE
  TO authenticated
  USING (true);

CREATE POLICY "Permitir deleção autenticada de informações"
  ON public.informacoes_municipio FOR DELETE
  TO authenticated
  USING (true);

-- 8. Trigger para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_bairros_updated_at BEFORE UPDATE ON public.bairros
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_setores_updated_at BEFORE UPDATE ON public.setores_coleta
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_info_municipio_updated_at BEFORE UPDATE ON public.informacoes_municipio
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 9. Inserir informações gerais do município de Guaíra
INSERT INTO public.informacoes_municipio (chave, municipio, uf, atualizado_em, regras_gerais, informacoes_coleta, links_oficiais)
VALUES (
  'guaira-sp',
  'Guaíra',
  'SP',
  '2026-01-28',
  '{
    "coleta_lixo_domestico": {
      "tipo": "regra_unica_cidade",
      "dias_semana": ["segunda", "quarta", "sexta"],
      "inicio_coleta": "07:00",
      "observacao": "Regra geral de coleta residencial; pode haver ajustes por rota/feriados."
    },
    "poda_arvores": {
      "tipo": "regra_sazonal",
      "recolhimento_prefeitura_meses": ["maio", "junho", "julho", "agosto", "setembro", "outubro", "novembro"],
      "fora_do_periodo": "dezembro a abril: podador/contratante deve retirar e destinar por conta própria (salvo exceções/autorizações)."
    },
    "coleta_entulho_construcao": {
      "tipo": "nao_ofertado_pela_coleta_publica",
      "orientacao": "Entulho de obra/demolição: contratar caçamba/transportador autorizado."
    },
    "descarte_limpeza_quintal_galhos_folhas_volumosos": {
      "tipo": "calendario_por_grupos_de_bairros",
      "como_preencher": "Defina o campo grupo_coleta de cada bairro e informe janelas (semanas/datas) conforme o Calendário Oficial de Descarte do município."
    }
  }'::jsonb,
  '{
    "coleta_lixo_domestico": {
      "horario_seg_sex": "manhã, a partir das 06h",
      "horario_sabado_feriado": "a partir das 14h (para os bairros atendidos no sábado)",
      "observacao_domingo": "aos domingos: feira livre"
    },
    "observacoes": {
      "podas": "A remoção de galhos/folhas de podas ou cortes de árvores é responsabilidade de quem realizou o serviço; a Prefeitura retira apenas em casos de acidentes, vendavais ou mediante notificação oficial.",
      "limpeza_terrenos": "Resíduos comuns de limpeza de terrenos, quintais, jardins e materiais inservíveis continuam com a coleta normal.",
      "rcc": "A coleta regular não abrange Resíduos da Construção Civil (RCC)."
    }
  }'::jsonb,
  '{
    "prefeitura": "https://www.guaira.sp.gov.br",
    "limpeza_publica": "https://www.guaira.sp.gov.br/pagina/17/limpeza-publica-dias-e-horarios",
    "telefones": {
      "prefeitura": "(17) 3331-9600",
      "coleta": "(17) 3331-9600"
    }
  }'::jsonb
)
ON CONFLICT (chave) DO UPDATE SET
  atualizado_em = EXCLUDED.atualizado_em,
  regras_gerais = EXCLUDED.regras_gerais,
  informacoes_coleta = EXCLUDED.informacoes_coleta,
  links_oficiais = EXCLUDED.links_oficiais;

-- 10. Inserir os 4 setores de coleta
INSERT INTO public.setores_coleta (numero, semana, bairros, calendario_2026)
VALUES 
-- SETOR 1
(1, 1, 
  ARRAY[
    'Aniceto Carlos Nogueira', 'Antonio Garcia', 'Antonio Nery Lopes', 
    'Desm. Santo Antonio', 'Ernesto Pacheco', 'Jardim Califórnia', 
    'Jardim Solaris', 'Joaquim P. Lelis', 'José Pugliesi', 'Luiz Afonso',
    'Res. Amélia', 'Res. Bárbara', 'Res. José Alves Casagrande', 
    'Res. Lígia', 'Res. Nova Guaíra', 'Res. Portinari', 'Res. R. Guimarães',
    'Res. Santa Teresinha', 'Res. Taís', 'C. Hab. José Gomes'
  ],
  '{
    "Janeiro": [5, 6, 7, 8],
    "Fevereiro": [2, 3, 4, 5],
    "Março": [2, 3, 4, 5],
    "Abril": [6, 7, 8, 9],
    "Maio": [4, 5, 6, 7],
    "Junho": [1, 2, 3, 4],
    "Julho": [6, 7, 8, 9],
    "Agosto": [3, 4, 5, 6],
    "Setembro": [1, 2, 3, 4, 29, 30],
    "Outubro": [1, 2],
    "Novembro": [3, 4, 5, 6],
    "Dezembro": [1, 2, 3, 4]
  }'::jsonb
),
-- SETOR 2
(2, 2,
  ARRAY[
    'Antenor Lóssio', 'Belvedere', 'Centro', 'Cidade Jardim',
    'Desm. São Francisco', 'Jardim América', 'Jardim Eldorado',
    'Jardim Itália', 'Jardim Nobre Ville', 'Res. Áurea', 
    'Res. Cecília', 'Res. Fernanda', 'Res. Joana Gualberto',
    'Res. Lívia', 'Res. Marcelo Soares', 'Res. Maria Parra',
    'Res. Náutico e Pesca Rio Pardo', 'Res. Nobre Ville', 
    'Res. Thobias Landim', 'Vila Santa Teresinha', 'Vila São Domingos'
  ],
  '{
    "Janeiro": [12, 13, 14, 15],
    "Fevereiro": [9, 10, 11, 12],
    "Março": [9, 10, 11, 12],
    "Abril": [13, 14, 15, 16],
    "Maio": [11, 12, 13, 14],
    "Junho": [8, 9, 10, 11],
    "Julho": [13, 14, 15, 16],
    "Agosto": [10, 11, 12, 13],
    "Setembro": [7, 8, 9, 10],
    "Outubro": [6, 7, 8, 9],
    "Novembro": [10, 11, 12, 13],
    "Dezembro": [8, 9, 10, 11]
  }'::jsonb
),
-- SETOR 3
(3, 3,
  ARRAY[
    'Dist. Ind. Luiz Carlos Nogueira', 'Estância Morada Nova',
    'José Ometto I', 'José Ometto II', 'José Ometto III',
    'Loteamento Vista Verde', 'Res. Amanda', 'Res. Barros',
    'Res. Buritis', 'Res. Carlos Vilela Ungar', 'Res. Francisco L. Nogueira',
    'Res. Hélio Marchi', 'Res. Morumbi', 'Res. Palmares I',
    'Res. Palmares II', 'Res. Portal das Águas', 'Res. Rainha Leonor',
    'Res. Real Ville', 'Res. Vale do Sol', 'Res. Vida Nova',
    'Res. Village da Mata', 'Vila Brasil', 'Vila Cláudia', 
    'Vila Costa do Sol', 'Vila Rahal'
  ],
  '{
    "Janeiro": [19, 20, 21, 22],
    "Fevereiro": [16, 17, 18, 19],
    "Março": [16, 17, 18, 19],
    "Abril": [20, 21, 22, 23],
    "Maio": [18, 19, 20, 21],
    "Junho": [15, 16, 17, 18],
    "Julho": [20, 21, 22, 23],
    "Agosto": [17, 18, 19, 20],
    "Setembro": [14, 15, 16, 17],
    "Outubro": [13, 14, 15, 16],
    "Novembro": [17, 18, 19, 20],
    "Dezembro": [15, 16, 17, 18]
  }'::jsonb
),
-- SETOR 4
(4, 4,
  ARRAY[
    'Altos da Cidade', 'Jardim São Francisco I', 'Jardim São Francisco II',
    'Jardim São Francisco III', 'Jardim Tropical', 'Loteamento São José',
    'Parque Res. Boa Vista', 'Res. Bella Vista', 'Res. Celina',
    'Res. dos Lagos', 'Res. Flórida', 'Res. Jardim Guaíra',
    'Res. Maria de Lourdes', 'Res. Morada do Sol', 'Res. Pq. dos Pinheiros',
    'Res. Primavera', 'Res. Tangará', 'Res. Vilas do Lago',
    'Vila Aparecida', 'Vila Barth', 'Vila Celina', 'Vila Industrial'
  ],
  '{
    "Janeiro": [26, 27, 28, 29],
    "Fevereiro": [23, 24, 25, 26],
    "Março": [23, 24, 25, 26],
    "Abril": [27, 28, 29, 30],
    "Maio": [25, 26, 27, 28],
    "Junho": [22, 23, 24, 25],
    "Julho": [27, 28, 29, 30],
    "Agosto": [24, 25, 26, 27],
    "Setembro": [21, 22, 23, 24],
    "Outubro": [20, 21, 22, 23],
    "Novembro": [24, 25, 26, 27],
    "Dezembro": [22, 23, 24, 26]
  }'::jsonb
)
ON CONFLICT (numero) DO UPDATE SET
  semana = EXCLUDED.semana,
  bairros = EXCLUDED.bairros,
  calendario_2026 = EXCLUDED.calendario_2026;

-- 11. Comentários nas tabelas
COMMENT ON TABLE public.bairros IS 'Lista de bairros de Guaíra com seus serviços e agendas';
COMMENT ON TABLE public.setores_coleta IS 'Setores de coleta de resíduos volumosos com calendário';
COMMENT ON TABLE public.informacoes_municipio IS 'Informações gerais do município (regras, links, etc)';

COMMENT ON COLUMN public.bairros.slug IS 'Identificador único do bairro (URL-friendly)';
COMMENT ON COLUMN public.bairros.setor_coleta IS 'Número do setor de coleta (1-4)';
COMMENT ON COLUMN public.bairros.servicos_essenciais IS 'JSON com serviços disponíveis no bairro';
COMMENT ON COLUMN public.bairros.agenda IS 'JSON com agenda de coletas e serviços';

COMMENT ON COLUMN public.setores_coleta.numero IS 'Número identificador do setor (1-4)';
COMMENT ON COLUMN public.setores_coleta.semana IS 'Número da semana no ciclo de coleta';
COMMENT ON COLUMN public.setores_coleta.bairros IS 'Array com nomes dos bairros deste setor';
COMMENT ON COLUMN public.setores_coleta.calendario_2026 IS 'JSON com datas de coleta por mês em 2026';
