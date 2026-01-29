#!/usr/bin/env python3
"""
Script para migrar dados de bairros dos arquivos JSON para o Supabase
Executa após rodar o SQL bairros-servicos-sistema.sql
"""

import json
import os
from pathlib import Path

# Lê os dados dos arquivos JSON
script_dir = Path(__file__).parent
projeto_dir = script_dir.parent

# Carrega bairros
with open(projeto_dir / 'src/data/bairros-guaira.json', 'r', encoding='utf-8') as f:
    dados_bairros = json.load(f)

# Carrega setores
with open(projeto_dir / 'src/data/coleta-lixo-guaira.json', 'r', encoding='utf-8') as f:
    dados_coleta = json.load(f)

# Cria um mapeamento de nome de bairro para número de setor
mapa_setor = {}
for setor_num, setor_info in dados_coleta['setores'].items():
    for bairro_nome in setor_info['bairros']:
        # Normaliza o nome para comparação
        nome_normalizado = bairro_nome.lower().strip()
        mapa_setor[nome_normalizado] = int(setor_num)

# Prepara SQL INSERT para os bairros (removendo duplicatas)
bairros_unicos = {}
for bairro in dados_bairros['bairros']:
    slug = bairro['slug']
    # Mantém apenas a primeira ocorrência de cada slug
    if slug not in bairros_unicos:
        bairros_unicos[slug] = bairro

print(f"-- Total de bairros únicos: {len(bairros_unicos)}")
print(f"-- Total de bairros originais (com duplicatas): {len(dados_bairros['bairros'])}\n")

# Gera INSERT statements
sql_output = []
sql_output.append("-- =====================================================")
sql_output.append("-- INSERÇÃO DE BAIRROS DE GUAÍRA-SP")
sql_output.append("-- Gerado automaticamente pelo script migrar-bairros-para-supabase.py")
sql_output.append("-- =====================================================\n")

# Função para encontrar o setor do bairro
def encontrar_setor(nome_exibicao):
    # Tenta match exato primeiro
    nome_norm = nome_exibicao.lower().strip()
    if nome_norm in mapa_setor:
        return mapa_setor[nome_norm]
    
    # Tenta variações comuns
    variacoes = [
        nome_norm.replace('residencial', 'res.').strip(),
        nome_norm.replace('res.', 'residencial').strip(),
        nome_norm.replace('desm.', 'desmembramento').strip(),
        nome_norm.replace('desmembramento', 'desm.').strip(),
        nome_norm.replace('c. hab.', 'conjunto habitacional').strip(),
        nome_norm.replace('conjunto habitacional', 'c. hab.').strip(),
        nome_norm.replace('dist. ind.', 'distrito industrial').strip(),
        nome_norm.replace('distrito industrial', 'dist. ind.').strip(),
        nome_norm.replace('pq.', 'parque').strip(),
        nome_norm.replace('parque', 'pq.').strip(),
    ]
    
    for variacao in variacoes:
        if variacao in mapa_setor:
            return mapa_setor[variacao]
    
    return None

# Contador de setores
setores_encontrados = {1: 0, 2: 0, 3: 0, 4: 0}
sem_setor = []

for slug, bairro in sorted(bairros_unicos.items()):
    nome_exibicao = bairro['nome_exibicao']
    setor = encontrar_setor(nome_exibicao)
    
    if setor:
        setores_encontrados[setor] += 1
    else:
        sem_setor.append(nome_exibicao)
    
    # Escapa aspas simples no JSON
    servicos_json = json.dumps(bairro.get('servicos_essenciais', {}))
    agenda_json = json.dumps(bairro.get('agenda', {}))
    
    sql_output.append(
        f"INSERT INTO public.bairros (slug, nome_exibicao, grupo_coleta, setor_coleta, servicos_essenciais, agenda)"
    )
    sql_output.append(f"VALUES (")
    sql_output.append(f"  '{slug}',")
    sql_output.append(f"  '{nome_exibicao}',")
    sql_output.append(f"  {bairro.get('grupo_coleta') if bairro.get('grupo_coleta') else 'NULL'},")
    sql_output.append(f"  {setor if setor else 'NULL'},")
    sql_output.append(f"  '{servicos_json}'::jsonb,")
    sql_output.append(f"  '{agenda_json}'::jsonb")
    sql_output.append(f")")
    sql_output.append(f"ON CONFLICT (slug) DO UPDATE SET")
    sql_output.append(f"  nome_exibicao = EXCLUDED.nome_exibicao,")
    sql_output.append(f"  grupo_coleta = EXCLUDED.grupo_coleta,")
    sql_output.append(f"  setor_coleta = EXCLUDED.setor_coleta,")
    sql_output.append(f"  servicos_essenciais = EXCLUDED.servicos_essenciais,")
    sql_output.append(f"  agenda = EXCLUDED.agenda;")
    sql_output.append("")

# Estatísticas
sql_output.append("\n-- =====================================================")
sql_output.append("-- ESTATÍSTICAS DA MIGRAÇÃO")
sql_output.append("-- =====================================================")
sql_output.append(f"-- Total de bairros inseridos: {len(bairros_unicos)}")
sql_output.append(f"-- Setor 1: {setores_encontrados[1]} bairros")
sql_output.append(f"-- Setor 2: {setores_encontrados[2]} bairros")
sql_output.append(f"-- Setor 3: {setores_encontrados[3]} bairros")
sql_output.append(f"-- Setor 4: {setores_encontrados[4]} bairros")
sql_output.append(f"-- Sem setor definido: {len(sem_setor)} bairros")

if sem_setor:
    sql_output.append("\n-- Bairros sem setor de coleta definido:")
    for nome in sem_setor:
        sql_output.append(f"-- • {nome}")

# Salva o SQL gerado
output_file = projeto_dir / 'supabase' / 'inserir-bairros-guaira.sql'
with open(output_file, 'w', encoding='utf-8') as f:
    f.write('\n'.join(sql_output))

print(f"✅ SQL gerado com sucesso!")
print(f"📁 Arquivo: {output_file}")
print(f"\n📊 Estatísticas:")
print(f"   • Total de bairros: {len(bairros_unicos)}")
print(f"   • Setor 1: {setores_encontrados[1]} bairros")
print(f"   • Setor 2: {setores_encontrados[2]} bairros")
print(f"   • Setor 3: {setores_encontrados[3]} bairros")
print(f"   • Setor 4: {setores_encontrados[4]} bairros")
print(f"   • Sem setor: {len(sem_setor)} bairros")

if sem_setor:
    print(f"\n⚠️  Bairros sem setor (verifique manualmente):")
    for nome in sem_setor[:10]:  # Mostra apenas os primeiros 10
        print(f"   • {nome}")
    if len(sem_setor) > 10:
        print(f"   ... e mais {len(sem_setor) - 10} bairros")

print(f"\n🚀 Próximos passos:")
print(f"   1. Execute no Supabase: supabase/bairros-servicos-sistema.sql")
print(f"   2. Execute no Supabase: supabase/inserir-bairros-guaira.sql")
print(f"   3. Atualize o código React para buscar do Supabase")
