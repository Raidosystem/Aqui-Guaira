import { supabase } from '@/lib/supabase';

export interface PortalCompany {
  id: string;
  nome: string;
  bairro: string | null;
  logo: string | null;
  imagens: string[] | null;
  latitude: number | null;
  longitude: number | null;
  categorias: { nome: string } | null;
}

export interface PortalListing {
  id: string;
  title: string;
  price: number | null;
  images: string[] | null;
  category: string | null;
  city: string | null;
  state: string | null;
}

export interface PortalPost {
  id: string;
  conteudo: string;
  imagens: string[] | null;
  data_criacao: string;
}

// Reuse the repository's client, public visibility filters and tables. Select
// only display fields, and propagate failures so the UI can offer a retry.
export async function loadPortalCompanies(signal?: AbortSignal): Promise<PortalCompany[]> {
  const query = supabase.from('empresas')
    .select('id,nome,bairro,logo,imagens,latitude,longitude,categorias(nome)')
    .eq('status', 'aprovado').eq('ativa', true).order('nome').limit(6);
  if (signal) query.abortSignal(signal);
  const { data, error } = await query;
  if (error) throw error;
  return (data ?? []) as unknown as PortalCompany[];
}

export async function loadPortalListings(signal?: AbortSignal): Promise<PortalListing[]> {
  const query = supabase.from('listings_with_category')
    .select('id,title,price,images,category,city,state')
    .eq('status', 'active').order('created_at', { ascending: false }).limit(6);
  if (signal) query.abortSignal(signal);
  const { data, error } = await query;
  if (error) throw error;
  return data ?? [];
}

export async function loadPortalPosts(signal?: AbortSignal): Promise<PortalPost[]> {
  const query = supabase.from('mural_posts')
    .select('id,conteudo,imagens,data_criacao')
    .or('status.eq.aprovado,aprovado.eq.true')
    .order('data_criacao', { ascending: false }).limit(3);
  if (signal) query.abortSignal(signal);
  const { data, error } = await query;
  if (error) throw error;
  return data ?? [];
}
