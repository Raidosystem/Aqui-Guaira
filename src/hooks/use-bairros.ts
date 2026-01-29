/**
 * Hook para buscar dados de bairros e serviços do Supabase
 */
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

// Tipos
export interface Bairro {
  id: string;
  slug: string;
  nome_exibicao: string;
  grupo_coleta: string | null;
  setor_coleta: number | null;
  servicos_essenciais: any;
  agenda: any;
  created_at: string;
  updated_at: string;
}

export interface SetorColeta {
  id: string;
  numero: number;
  semana: number;
  bairros: string[];
  calendario_2026: Record<string, number[]>;
  calendario_2027?: Record<string, number[]>;
  created_at: string;
  updated_at: string;
}

export interface InformacoesMunicipio {
  id: string;
  chave: string;
  municipio: string;
  uf: string;
  timezone: string;
  atualizado_em: string;
  regras_gerais: any;
  informacoes_coleta: any;
  links_oficiais: any;
  created_at: string;
  updated_at: string;
}

/**
 * Hook para buscar todos os bairros
 */
export function useBairros() {
  return useQuery({
    queryKey: ['bairros'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('bairros')
        .select('*')
        .order('nome_exibicao', { ascending: true });

      if (error) throw error;
      return data as Bairro[];
    },
    staleTime: 1000 * 60 * 30, // 30 minutos
  });
}

/**
 * Hook para buscar um bairro específico por slug
 */
export function useBairro(slug: string | null) {
  return useQuery({
    queryKey: ['bairro', slug],
    queryFn: async () => {
      if (!slug) return null;
      
      const { data, error } = await supabase
        .from('bairros')
        .select('*')
        .eq('slug', slug)
        .single();

      if (error) throw error;
      return data as Bairro;
    },
    enabled: !!slug,
    staleTime: 1000 * 60 * 30, // 30 minutos
  });
}

/**
 * Hook para buscar todos os setores de coleta
 */
export function useSetoresColeta() {
  return useQuery({
    queryKey: ['setores-coleta'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('setores_coleta')
        .select('*')
        .order('numero', { ascending: true });

      if (error) throw error;
      return data as SetorColeta[];
    },
    staleTime: 1000 * 60 * 60, // 1 hora
  });
}

/**
 * Hook para buscar um setor específico
 */
export function useSetorColeta(numero: number | null) {
  return useQuery({
    queryKey: ['setor-coleta', numero],
    queryFn: async () => {
      if (numero === null) return null;
      
      const { data, error } = await supabase
        .from('setores_coleta')
        .select('*')
        .eq('numero', numero)
        .single();

      if (error) throw error;
      return data as SetorColeta;
    },
    enabled: numero !== null,
    staleTime: 1000 * 60 * 60, // 1 hora
  });
}

/**
 * Hook para buscar informações do município
 */
export function useInformacoesMunicipio(chave: string = 'guaira-sp') {
  return useQuery({
    queryKey: ['informacoes-municipio', chave],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('informacoes_municipio')
        .select('*')
        .eq('chave', chave)
        .single();

      if (error) throw error;
      return data as InformacoesMunicipio;
    },
    staleTime: 1000 * 60 * 60, // 1 hora
  });
}

/**
 * Hook para buscar bairros de um setor específico
 */
export function useBairrosPorSetor(setor: number | null) {
  return useQuery({
    queryKey: ['bairros-setor', setor],
    queryFn: async () => {
      if (setor === null) return [];
      
      const { data, error } = await supabase
        .from('bairros')
        .select('*')
        .eq('setor_coleta', setor)
        .order('nome_exibicao', { ascending: true });

      if (error) throw error;
      return data as Bairro[];
    },
    enabled: setor !== null,
    staleTime: 1000 * 60 * 30, // 30 minutos
  });
}
