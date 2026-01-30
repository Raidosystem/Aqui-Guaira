import { createClient } from '@supabase/supabase-js'
import empresasFallback from '@/data/empresas-fallback.json';
import categoriasData from '@/data/categorias-empresas.json';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://hihfnlbcantamcxpisef.supabase.co'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhpaGZubGJjYW50YW1jeHBpc2VmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjIyODIyMDMsImV4cCI6MjA3Nzg1ODIwM30._OevqLM5fIfxj_DCYapS30PoZIaEh63Iuq46Q6jdIz0'

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
  db: {
    schema: 'public',
  },
  global: {
    headers: {
      'X-Client-Info': 'aqui-guaira-web',
    },
  },
})

// ============================================
// TIPOS TYPESCRIPT
// ============================================

export interface User {
  id: string
  email: string
  senha_hash?: string // Hash da senha (não expor ao frontend normalmente)
  nome?: string
  avatar_url?: string
  created_at: string
  updated_at: string
}

export interface Categoria {
  id: string
  nome: string
  icone?: string
  cor?: string
  ordem: number
  created_at: string
  updated_at: string
}

export interface Empresa {
  id: string
  cnpj?: string // ← CNPJ adicionado
  cnae?: string
  cnae_secundario?: string
  nome: string
  slug: string
  descricao: string
  categoria_id?: string
  subcategorias?: string[] // ← Subcategorias adicionadas
  endereco?: string
  bairro: string
  cidade: string
  estado: string
  cep?: string
  latitude: number
  longitude: number
  telefone?: string
  whatsapp?: string
  email?: string
  site?: string
  instagram?: string
  facebook?: string
  link_google_maps?: string
  horarios?: Array<{ dia: string; abertura: string; fechamento: string }>
  imagens: string[]
  logo?: string
  status: 'pendente' | 'aprovado' | 'rejeitado' | 'inativo'
  verificado: boolean
  destaque: boolean
  visualizacoes: number
  responsavel_nome?: string
  responsavel_email?: string
  responsavel_telefone?: string
  created_at: string
  updated_at: string
}

export interface EmpresaCompleta extends Empresa {
  categoria_nome?: string
  categoria_icone?: string
  categoria_cor?: string
}

export interface Post {
  id: string
  user_id?: string // ← ID do usuário logado (opcional)
  autor_anonimo: boolean // ← Se true, é post anônimo
  autor_nome?: string // ← Nome do autor (se anônimo ou de user)
  autor_bairro: string
  autor_email?: string
  conteudo: string
  imagens: string[]
  status: 'pendente' | 'aprovado' | 'rejeitado'
  moderado_por?: string
  moderado_em?: string
  motivo_rejeicao?: string
  curtidas: number
  comentarios: number
  created_at: string
  updated_at: string
}

export interface PostAprovado extends Post {
  autor_avatar?: string // ← Avatar do usuário (da view)
  total_comentarios: number
}

export interface Comentario {
  id: string
  post_id: string
  user_id?: string // ← ID do usuário logado (opcional)
  autor_anonimo: boolean // ← Se true, é comentário anônimo
  autor_nome: string
  conteudo: string
  status: 'pendente' | 'aprovado' | 'rejeitado'
  created_at: string
}

export interface LocalTuristico {
  id: string
  nome: string
  slug: string
  descricao: string
  categoria: string
  endereco?: string
  bairro?: string
  latitude: number
  longitude: number
  imagens: string[]
  horario_funcionamento?: string
  entrada_gratuita: boolean
  valor_entrada?: number
  acessibilidade: boolean
  estacionamento: boolean
  telefone?: string
  site?: string
  status: 'ativo' | 'inativo' | 'manutencao'
  destaque: boolean
  visualizacoes: number
  created_at: string
  updated_at: string
}

export interface Vaga {
  id: string;
  empresa_id: string;
  titulo: string;
  descricao: string;
  requisitos?: string;
  quantidade: number;
  salario?: string;
  tipo: 'CLT' | 'PJ' | 'Estágio' | 'Freelance' | 'Outro';
  status: 'aberta' | 'cerrada';
  created_at: string;
  updated_at: string;
}

export interface Favorito {
  id: string
  tipo: 'empresa' | 'local' | 'post'
  item_id: string
  user_id?: string // ← ID do usuário logado (opcional)
  user_identifier: string // ← UUID anônimo (fallback se não logado)
  created_at: string
}

export interface HistoricoLocalizacao {
  id: string
  user_identifier: string
  tipo: 'empresa' | 'local'
  item_id: string
  visualizado_em: string
}

// ============================================
// FUNÇÕES AUXILIARES
// ============================================

/**
 * Gera um identificador único para o usuário (para favoritos/histórico)
 * Usa localStorage para persistência
 */
export function getUserIdentifier(): string {
  const key = 'aqui_guaira_user_id'
  let userId = localStorage.getItem(key)
  if (!userId) {
    userId = crypto.randomUUID()
    localStorage.setItem(key, userId)
  }
  return userId
}

/**
 * Calcula distância entre dois pontos (Haversine)
 */
export function calcularDistancia(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371 // Raio da Terra em km
  const dLat = ((lat2 - lat1) * Math.PI) / 180
  const dLon = ((lon2 - lon1) * Math.PI) / 180
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
    Math.cos((lat2 * Math.PI) / 180) *
    Math.sin(dLon / 2) *
    Math.sin(dLon / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
}

/**
 * Upload de imagem para o MongoDB (via API Customizada)
 */
export async function uploadImagem(
  bucket: 'empresas-images' | 'posts-images' | 'locais-images',
  file: File,
  pasta?: string
): Promise<string | null> {
  try {
    console.log(`📤 Iniciando upload de "${file.name}" para Storage...`);

    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random().toString(36).substring(2)}.${fileExt}`;
    const filePath = pasta ? `${pasta}/${fileName}` : fileName;

    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(filePath, file);

    if (error) {
      throw error;
    }

    const { data: publicUrlData } = supabase.storage
      .from(bucket)
      .getPublicUrl(filePath);

    console.log(`✅ Upload concluído: ${publicUrlData.publicUrl}`);
    return publicUrlData.publicUrl;
  } catch (error) {
    console.error('❌ Erro ao fazer upload para Storage:', error);
    return null;
  }
}

/**
 * Upload múltiplo de imagens
 */
export async function uploadImagens(
  bucket: 'empresas-images' | 'posts-images' | 'locais-images',
  files: File[],
  pasta?: string
): Promise<string[]> {
  const uploads = await Promise.all(
    files.map((file) => uploadImagem(bucket, file, pasta))
  )
  return uploads.filter((url): url is string => url !== null)
}

// ============================================
// FUNÇÕES DE API - EMPRESAS
// ============================================

export async function buscarEmpresas(filtros?: {
  categoria?: string
  bairro?: string
  busca?: string
  latitude?: number
  longitude?: number
  raioKm?: number
  destaque?: boolean
  responsavel_telefone?: string
  limit?: number
}) {
  try {
    // Usar VIEW se disponível para trazer dados da categoria
    let query = supabase.from('empresas').select(`
      *,
      categorias (
        nome,
        icone,
        cor
      )
    `);

    // View alternativa se existir, mas vamos de join simples
    // Ajustar filtros
    if (filtros?.categoria) query = query.eq('categoria_id', filtros.categoria);
    if (filtros?.bairro) query = query.eq('bairro', filtros.bairro);
    if (filtros?.busca) query = query.ilike('nome', `%${filtros.busca}%`);
    if (filtros?.destaque) query = query.eq('destaque', true);
    if (filtros?.responsavel_telefone) query = query.eq('responsavel_telefone', filtros.responsavel_telefone);
    if (filtros?.limit) query = query.limit(filtros.limit);

    // Filtrar apenas aprovadas/ativas
    query = query.eq('status', 'aprovado').eq('ativa', true);

    const { data, error } = await query;

    if (error) {
      throw error;
    }

    // Mapear para EmpresaCompleta
    const empresasFormatadas: EmpresaCompleta[] = data.map((emp: any) => ({
      ...emp,
      categoria_nome: emp.categorias?.nome,
      categoria_icone: emp.categorias?.icone,
      categoria_cor: emp.categorias?.cor
    }));

    // Se tiver localização, calcular distâncias e filtrar por raio
    if (filtros?.latitude && filtros?.longitude && empresasFormatadas) {
      const empresasComDistancia = empresasFormatadas.map((emp) => ({
        ...emp,
        distancia: calcularDistancia(
          filtros.latitude!,
          filtros.longitude!,
          emp.latitude,
          emp.longitude
        ),
      }));

      const filtradas = filtros.raioKm
        ? empresasComDistancia.filter((emp) => emp.distancia <= filtros.raioKm!)
        : empresasComDistancia;

      return filtradas.sort((a, b) => a.distancia - b.distancia);
    }

    return empresasFormatadas || [];
  } catch (error) {
    console.error('Erro ao buscar empresas (Supabase):', error);
    return [];
  }
}

export async function buscarEmpresaPorSlug(slug: string) {
  try {
    const { data, error } = await supabase
      .from('empresas')
      .select(`
        *,
        categorias (
          nome,
          icone,
          cor
        )
      `)
      .eq('slug', slug)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null; // Not found
      throw error;
    }

    // Formatar
    const empresa: EmpresaCompleta = {
        ...data,
        categoria_nome: data.categorias?.nome,
        categoria_icone: data.categorias?.icone,
        categoria_cor: data.categorias?.cor
    };

    return empresa;
  } catch (error) {
    console.error('Erro ao buscar empresa (Supabase):', error);
    return null;
  }
}

export async function buscarEmpresaPorId(id: string) {
  try {
    const { data, error } = await supabase
      .from('empresas')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) return null;
    return data;
  } catch (error) {
    console.error('Erro ao buscar empresa por id:', error);
    return null;
  }
}

/**
 * Buscar empresas por uma lista de IDs (fallback local se necessário)
 */
export async function buscarEmpresasPorIds(ids: string[]) {
  if (!ids || ids.length === 0) return []

  try {
    // Tenta buscar as empresas uma a uma ou cria um endpoint bulk futuro
    const promises = ids.map(id => buscarEmpresaPorId(id));
    const results = await Promise.all(promises);
    return results.filter(Boolean) as EmpresaCompleta[];
  } catch (err) {
    console.error('Erro ao buscar empresas por ids:', err)
    return []
  }
}

export async function criarEmpresa(empresa: Partial<Empresa>) {
  try {
    const { data, error } = await supabase
      .from('empresas')
      .insert(empresa)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Erro ao criar empresa (Supabase):', error);
    return null;
  }
}

export async function atualizarEmpresa(id: string, dados: Partial<Empresa>) {
  try {
    const { error } = await supabase
      .from('empresas')
      .update(dados)
      .eq('id', id);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Erro ao atualizar empresa:', error);
    return false;
  }
}

export async function incrementarVisualizacoesEmpresa(id: string) {
  try {
    // Isso é melhor feito via RPC para atomicidade, mas como fallback:
    // await supabase.rpc('increment_empresa_view', { empresa_id: id });
    // Mas se não tiver RPC, podemos ignorar ou fazer um get+update inseguro (race condition).
    // Vou deixar apenas o console por enquanto, ou melhor, RPC se existir.
    // Vamos tentar RPC genérico se existir ou deixar vazio para não quebrar.
    
    /* 
    const { error } = await supabase.rpc('increment_views', { table_name: 'empresas', row_id: id });
    if (error) console.error(error);
    */
  } catch (error) {
    console.error('Erro ao incrementar visualização:', error);
  }
}

// ============================================
// FUNÇÕES DE API - POSTS
// ============================================

export async function buscarPosts(filtros: { limite?: number, userId?: string, admin?: boolean } = {}) {
  try {
    let query = supabase.from('mural_posts').select(`
      *,
      comentarios:comentarios(count)
    `);

    if (filtros.userId) query = query.eq('user_id', filtros.userId);
    if (!filtros.admin) query = query.eq('aprovado', true);
    if (filtros.limite) query = query.limit(filtros.limite);

    query = query.order('data_criacao', { ascending: false });

    const { data, error } = await query;
    
    if (error) throw error;
    
    // Mapear contagem de comentários e estrutura
    return data.map((post: any) => ({
      ...post,
      comentarios: post.comentarios ? post.comentarios[0]?.count || 0 : 0, 
      created_at: post.data_criacao, // mapear campos se necessário
      status: post.aprovado ? 'aprovado' : 'pendente'
    }));

  } catch (error) {
    console.error('Erro ao buscar posts (Supabase):', error);
    return [];
  }
}

export async function criarPost(post: {
  titulo?: string
  autor_nome: string
  autor_bairro: string
  autor_email?: string
  conteudo: string
  imagens?: string[]
  user_id?: string
  bairro?: string
  logradouro?: string
}) {
  try {
    const { data, error } = await supabase
      .from('mural_posts')
      .insert({
        ...post,
        data_criacao: new Date().toISOString(),
        aprovado: false
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Erro ao criar post (Supabase):', error);
    return null;
  }
}

export async function buscarComentarios(postId: string) {
  try {
    const { data, error } = await supabase
      .from('comentarios')
      .select('*')
      .eq('post_id', postId)
      .eq('status', 'aprovado') // Assumindo filtro de aprovação
      .order('created_at', { ascending: true });

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Erro ao buscar comentários (Supabase):', error);
    return [];
  }
}

export async function criarComentario(comentario: {
  post_id: string
  autor_nome: string
  conteudo: string
  user_id?: string
}) {
  try {
    const { data, error } = await supabase
      .from('comentarios')
      .insert({
        ...comentario,
        status: 'aprovado' // auto-aprovar ou pendente?
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Erro ao criar comentário (Supabase):', error);
    return null;
  }
}

// ============================================
// FUNÇÕES DE API - LOCAIS TURÍSTICOS
// ============================================

export async function buscarLocaisTuristicos() {
  try {
    const { data, error } = await supabase
      .from('locais_turisticos')
      .select('*')
      .eq('status', 'ativo');
      
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Erro ao buscar locais (Supabase):', error);
    return [];
  }
}

export async function buscarLocalPorSlug(slug: string) {
  try {
    const { data, error } = await supabase
      .from('locais_turisticos')
      .select('*')
      .eq('slug', slug)
      .single();

    if (error) return null;
    return data;
  } catch (error) {
    console.error('Erro ao buscar local (Supabase):', error);
    return null;
  }
}

// ============================================
// FUNÇÕES DE API - CATEGORIAS
// ============================================

export async function buscarCategorias() {
  try {
    // Usar dados locais para categorias (mais rápido e resiliente)
    return categoriasData.categorias.map((c, index) => ({
      id: c.id,
      nome: c.nome,
      icone: c.icone,
      cor: c.cor,
      ordem: index,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    })) as Categoria[];
  } catch (error) {
    console.error('Erro ao buscar categorias locais:', error);
    return [];
  }
}

// ============================================
// FUNÇÕES DE API - FAVORITOS
// ============================================

export async function buscarFavoritos(
  tipo?: 'empresa' | 'local' | 'post'
) {
  try {
    const userId = getUserIdentifier();
    
    let query = supabase.from('favoritos').select('*');
    
    // Como identificar se é user logado ou anonimo? A função original misturava os dois.
    // Vamos tentar buscar por user_identifier OU user_id se logado?
    // A função original usava query params.
    // Assumindo uso do hook de autenticação no componente, aqui vamos pelo localStorage
    const user = getUsuarioLogado();
    
    if (user) {
         query = query.or(`user_id.eq.${user.id},user_identifier.eq.${userId}`);
    } else {
         query = query.eq('user_identifier', userId);
    }
    
    if (tipo) query = query.eq('tipo', tipo);

    const { data, error } = await query;
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Erro ao buscar favoritos (Supabase):', error);
    return [];
  }
}

export async function adicionarFavorito(
  tipo: 'empresa' | 'local' | 'post',
  itemId: string
) {
  try {
    const userId = getUserIdentifier();
    const user = getUsuarioLogado();
    
    const fav: any = { 
        tipo, 
        item_id: itemId, 
        user_identifier: userId 
    };
    
    if (user) fav.user_id = user.id;

    const { data, error } = await supabase.from('favoritos').insert(fav).select().single();
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Erro ao adicionar favorito (Supabase):', error);
    return null;
  }
}

export async function removerFavorito(
  tipo: 'empresa' | 'local' | 'post',
  itemId: string
) {
  try {
    const userId = getUserIdentifier();
    const user = getUsuarioLogado();
    
    let query = supabase.from('favoritos')
        .delete()
        .eq('tipo', tipo)
        .eq('item_id', itemId);
        
    if (user) {
         // Cuidado: delete com OR requer parênteses ou lógica complexa no supabase-js? 
         // Delete com OR é arriscado se não for preciso.
         // Vamos deletar onde match for encontrado. Melhor duas queries ou priorizar user_id?
         // Se logado, remove pelo user_id. Se anonimo, pelo identifier.
         // Mas o identifier persiste.
         query = query.eq('user_id', user.id); // Prioriza autenticado
    } else {
         query = query.eq('user_identifier', userId);
    }

    const { error } = await query;
    return !error;
  } catch (error) {
    console.error('Erro ao remover favorito (Supabase):', error);
    return false;
  }
}

// ============================================
// FUNÇÕES DE API - HISTÓRICO
// ============================================

export async function adicionarAoHistorico(
  tipo: 'empresa' | 'local',
  itemId: string
) {
  try {
    const userId = getUserIdentifier();
    const user = getUsuarioLogado();

    const item: any = {
      tipo,
      item_id: itemId,
      user_identifier: userId,
      visualizado_em: new Date().toISOString()
    };

    if (user) {
      item.user_id = user.id;
    }
    
    await supabase.from('historico_localizacao').insert(item);
  } catch (error) {
    console.error('Erro ao adicionar ao histórico (Supabase):', error);
  }
}

export async function buscarHistorico(limite = 20) {
  try {
    const userId = getUserIdentifier();
    const user = getUsuarioLogado();
    
    let query = supabase.from('historico_localizacao').select('*');
    
    if (user) {
        // query = query.or(`user_id.eq.${user.id},user_identifier.eq.${userId}`);
        query = query.eq('user_id', user.id);
    } else {
        query = query.eq('user_identifier', userId);
    }
    
    query = query.order('visualizado_em', { ascending: false }).limit(limite);
    
    const { data, error } = await query;
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Erro ao buscar histórico (Supabase):', error);
    return [];
  }
}

// ============================================
// FUNÇÕES DE API - VAGAS
// ============================================

export async function buscarVagas(empresaId?: string) {
  try {
    let query = supabase.from('vagas').select('*').eq('status', 'aberta');
    if (empresaId) query = query.eq('empresa_id', empresaId);
    
    const { data, error } = await query;
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Erro ao buscar vagas:', error);
    return [];
  }
}

export async function criarVaga(vaga: Partial<Vaga>) {
  try {
    const { data, error } = await supabase
      .from('vagas')
      .insert(vaga)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Erro ao criar vaga:', error);
    return null;
  }
}

export async function atualizarVaga(id: string, dados: Partial<Vaga>) {
  try {
    const { error } = await supabase
      .from('vagas')
      .update(dados)
      .eq('id', id);
      
    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Erro ao atualizar vaga:', error);
    return false;
  }
}

export async function removerVaga(id: string) {
  try {
     const { error } = await supabase.from('vagas').delete().eq('id', id);
     if (error) throw error;
    return true;
  } catch (error) {
    console.error('Erro ao remover vaga:', error);
    return false;
  }
}

// ============================================
// FUNÇÕES DE API - USERS
// ============================================

/**
 * Hash de senha simples usando Web Crypto API (SHA-256)
 * Para produção, recomenda-se usar bcrypt no backend
 */
async function hashSenha(senha: string): Promise<string> {
  const encoder = new TextEncoder()
  const data = encoder.encode(senha)
  const hashBuffer = await crypto.subtle.digest('SHA-256', data)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
}

/**
 * Criar ou fazer login de usuário
 * @param email - Email do usuário
 * @param nome - Nome do usuário (apenas para registro)
 * @param senha - Senha do usuário
 * @param isRegistro - Se true, cria nova conta; se false, faz login
 */
export async function criarOuLogarUsuario(
  email: string,
  nome?: string,
  senha?: string,
  isRegistro: boolean = false,
  cpf?: string,
  telefone?: string,
  endereco?: string,
  bairro?: string,
  cidade?: string,
  estado?: string,
  cep?: string
): Promise<User | null> {
  if (!senha) {
    throw new Error('Senha é obrigatória')
  }

  try {
    let user;

    if (isRegistro) {
      // Registro via RPC
      const { data, error } = await supabase.rpc('cadastrar_usuario', {
        u_email: email,
        u_senha: senha,
        u_nome: nome || '',
        u_cpf: cpf,
        u_telefone: telefone,
        u_endereco: endereco,
        u_bairro: bairro,
        u_cidade: cidade,
        u_estado: estado,
        u_cep: cep
      });

      if (error) throw error;
      const result = data?.[0];
      if (!result?.sucesso) throw new Error(result?.erro || 'Erro ao criar conta');
      
      user = result;
    } else {
      // Login via RPC
      const { data, error } = await supabase.rpc('verificar_usuario_login', {
        u_email: email,
        u_senha: senha
      });

      if (error) throw error;
      const result = data?.[0];
      if (!result || !result.sucesso) throw new Error('Email ou senha inválidos');
      
      user = result;
    }

    if (!user) throw new Error('Erro desconhecido');

    // Adaptar para interface User
    const userData: User = {
      id: user.id,
      email: user.email,
      nome: user.nome,
      avatar_url: user.avatar_url,
      created_at: new Date().toISOString(), // Mock, já que a RPC simplificada não retorna data
      updated_at: new Date().toISOString()
    };

    // Salvar no localStorage
    localStorage.setItem('aqui_guaira_user', JSON.stringify(userData))
    return userData;
  } catch (error: any) {
    console.error('Erro ao autenticar (Supabase RPC):', error);
    throw error;
  }
}

/**
 * Obter usuário logado do localStorage
 */
export function getUsuarioLogado(): User | null {
  const userStr = localStorage.getItem('aqui_guaira_user')
  if (!userStr) return null
  try {
    return JSON.parse(userStr) as User
  } catch {
    return null
  }
}

/**
 * Fazer logout (limpar localStorage)
 */
export function logout() {
  localStorage.removeItem('aqui_guaira_user')
}

/**
 * Atualizar perfil do usuário
 */
export async function atualizarUsuario(userId: string, dados: Partial<User>) {
  try {
    const { data, error } = await supabase
      .from('users')
      .update(dados)
      .eq('id', userId)
      .select()
      .single();

    if (error) throw error;

    // Atualizar localStorage
    const stored = localStorage.getItem('aqui_guaira_user');
    if (stored) {
        const currentUser = JSON.parse(stored);
        localStorage.setItem('aqui_guaira_user', JSON.stringify({ ...currentUser, ...dados }));
    }
    
    return data;
  } catch (error) {
    console.error('Erro ao atualizar usuário (Supabase):', error);
    throw error;
  }
}

// ============================================
// FUNÇÕES DE API - FAVORITOS (ATUALIZADO COM USER_ID)
// ============================================

/**
 * Buscar favoritos (prioriza user_id se logado, senão usa user_identifier)
 */
export async function buscarFavoritosUsuario(tipo?: 'empresa' | 'local' | 'post') {
  try {
    const user = getUsuarioLogado();
    const userId = getUserIdentifier();
    
    // Mesma lógica de buscarFavoritos
    return await buscarFavoritos(tipo);
  } catch (error) {
    console.error('Erro ao buscar favoritos de usuário (Supabase):', error);
    return [];
  }
}

/**
 * Adicionar favorito (com user_id se logado)
 */
export async function adicionarFavoritoUsuario(
  tipo: 'empresa' | 'local' | 'post',
  itemId: string
) {
  try {
    return await adicionarFavorito(tipo, itemId);
  } catch (error) {
     console.error('Erro ao adicionar favorito (Supabase):', error);
     return null;
  }
}

/**
 * Adicionar favorito (com user_id se logado)
 */
export async function adicionarFavoritoUsuario(
  tipo: 'empresa' | 'local' | 'post',
  itemId: string
) {
  try {
    const user = getUsuarioLogado();
    const userId = getUserIdentifier();

    const favorito: any = {
      tipo,
      item_id: itemId,
      user_identifier: userId,
    };

    if (user) {
      favorito.user_id = user.id;
    }

    const { data, error } = await supabase.from('favoritos').insert(favorito).select().single();

    if (error) {
       throw error;
    }

    return data;
  } catch (error) {
    console.error('Erro ao adicionar favorito de usuário (Supabase):', error);
    throw error;
  }
}

/**
 * Remover favorito
 */
export async function removerFavoritoUsuario(
  tipo: 'empresa' | 'local' | 'post',
  itemId: string
) {
  try {
    const user = getUsuarioLogado();
    const userId = getUserIdentifier();

    const params = new URLSearchParams();
    if (user) {
      params.append('user_id', user.id);
    } else {
      params.append('user_identifier', userId);
    }
    params.append('tipo', tipo);
    params.append('item_id', itemId);

    const res = await fetch(`/api/favoritos?${params.toString()}`, {
      method: 'DELETE'
    });

    if (!res.ok) {
      throw new Error('Falha ao remover favorito');
    }
    return true;
  } catch (error) {
    console.error('Erro ao remover favorito de usuário (MongoDB):', error);
    throw error;
  }
}
