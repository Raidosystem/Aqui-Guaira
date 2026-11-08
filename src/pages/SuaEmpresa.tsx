import { PortalBackButton } from "@/components/portal/PortalBackButton";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatCNPJ, formatPhone, isValidCNPJ } from "@/lib/utils";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "@/components/ui/sonner";
import { Building2, Lock, PlusCircle, UploadCloud, Image as ImageIcon, X, Loader2, Home } from "lucide-react";
import { criarEmpresa, uploadImagens, buscarEmpresas, buscarEmpresaPorId, supabase } from "@/lib/supabase";
import { BAIRROS_GUAIRA } from "@/data/bairros";
import categoriasData from "@/data/categorias-empresas.json";
import cnaeCodes from "@/data/cnae-codes.json";

// Função para traduzir erros do banco em mensagens específicas
const obterMensagemErroEspecifica = (error: any): string => {
  const message = error?.message || '';
  const details = error?.details || '';

  // Erros de colunas
  if (message.includes("'telefone'") || message.includes('telefone')) {
    return "❌ Erro no campo TELEFONE. Verifique se o número está no formato correto (DDD + número).";
  }

  if (message.includes("'whatsapp'") || message.includes('whatsapp')) {
    return "❌ Erro no campo WHATSAPP. Verifique se o número está no formato correto.";
  }

  if (message.includes("'email'") || message.includes('email')) {
    return "❌ Erro no campo EMAIL. Verifique se o e-mail está no formato correto.";
  }

  if (message.includes("'cnpj'") || message.includes('cnpj')) {
    return "❌ Erro no campo CNPJ. Verifique se o CNPJ é válido ou se já está cadastrado.";
  }

  if (message.includes("'cep'") || message.includes('cep')) {
    return "❌ Erro no campo CEP. Verifique se o CEP está correto (apenas números).";
  }

  if (message.includes("'endereco'") || message.includes('logradouro')) {
    return "❌ Erro no campo ENDEREÇO. Verifique se o endereço foi preenchido corretamente.";
  }

  if (message.includes("'bairro'")) {
    return "❌ Erro no campo BAIRRO. Verifique se o bairro foi selecionado.";
  }

  if (message.includes("'categoria_id'") || message.includes('categoria')) {
    return "❌ Erro no campo CATEGORIA. Verifique se a categoria foi selecionada corretamente.";
  }

  if (message.includes("'nome'")) {
    return "❌ Erro no campo NOME FANTASIA. Verifique se o nome da empresa está correto.";
  }

  if (message.includes("'descricao'")) {
    return "❌ Erro no campo DESCRIÇÃO. Verifique se a descrição foi preenchida.";
  }

  if (message.includes("'slug'") || message.includes('duplicate') || message.includes('unique')) {
    return "❌ Já existe uma empresa com este nome. Por favor, escolha um nome diferente.";
  }

  if (message.includes("'logo'") || message.includes('imagens')) {
    return "❌ Erro ao salvar as imagens. Tente fazer upload novamente.";
  }

  // Erros de constraint/validação
  if (message.includes('violates check constraint')) {
    return "❌ Um dos campos não atende aos requisitos. Verifique todos os campos obrigatórios.";
  }

  if (message.includes('violates foreign key')) {
    return "❌ Categoria selecionada é inválida. Por favor, selecione uma categoria da lista.";
  }

  if (message.includes('not-null constraint')) {
    return "❌ Campos obrigatórios não preenchidos. Verifique se todos os campos marcados com * foram preenchidos.";
  }

  if (message.includes('value too long')) {
    return "❌ Um dos campos excedeu o tamanho máximo permitido. Reduza o texto.";
  }

  // Erro genérico com detalhes se disponível
  if (details) {
    return `❌ Erro: ${details}`;
  }

  return `❌ Erro ao cadastrar empresa: ${message || 'Erro desconhecido. Tente novamente.'}`;
};


type CnpjApiResponse = {
  razao_social?: string;
  nome_fantasia?: string;
  email?: string;
  logradouro?: string;
  numero?: string;
  complemento?: string;
  bairro?: string;
  cep?: string;
  municipio?: string;
  uf?: string;
  ddd_telefone_1?: string;
  cnae_fiscal?: number | string;
  cnae_fiscal_descricao?: string;
  descricao_atividade_principal?: string;
  atividade_principal?: Array<{ text?: string }>;
  cnaes_secundarios?: Array<{ codigo?: number | string; descricao?: string }>;
};

const normalizeText = (value: string) =>
  value
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();

const buildKeywords = (text: string) =>
  normalizeText(text)
    .split(' ')
    .filter((token) => token.length >= 4);

const categoryMatchers = categoriasData.categorias.map((categoria) => {
  const primaryKeywords = Array.from(new Set(buildKeywords(categoria.nome)));
  const secondaryKeywords = Array.from(
    new Set(
      categoria.subcategorias
        ?.flatMap((sub) => buildKeywords(sub))
        .filter((token) => token.length >= 4) || []
    )
  );

  return {
    nome: categoria.nome,
    normalizedNome: normalizeText(categoria.nome),
    primaryKeywords,
    secondaryKeywords,
  };
});

const scoreMatch = (normalized: string, keywords: string[]) =>
  keywords.reduce((score, keyword) => (normalized.includes(keyword) ? score + 1 : score), 0);

const findCategoriaByDescricao = (descricao?: string, options?: { includeSecondary?: boolean; minScore?: number }) => {
  if (!descricao) return "";
  const normalized = normalizeText(descricao);
  const includeSecondary = options?.includeSecondary ?? false;
  const minScore = options?.minScore ?? 2;

  let best = { nome: "", score: 0 };

  for (const categoria of categoryMatchers) {
    if (normalized.includes(categoria.normalizedNome)) {
      return categoria.nome;
    }

    const keywords = includeSecondary
      ? [...categoria.primaryKeywords, ...categoria.secondaryKeywords]
      : categoria.primaryKeywords;
    const score = scoreMatch(normalized, keywords);

    if (score > best.score) {
      best = { nome: categoria.nome, score };
    }
  }

  return best.score >= minScore ? best.nome : "";
};


// Schema de cadastro
const cadastroSchema = z.object({
  cnpj: z.string().optional().default(""),
  razaoSocial: z.string().optional().default(""),
  nomeFantasia: z.string().optional().default(""),
  celular: z.string().optional().default(""),
  email: z.string().optional().default(""),
  cnae: z.string().optional().or(z.literal("")),
  cnaeDescricao: z.string().optional().or(z.literal("")),
  cnaeSecundario: z.string().optional().or(z.literal("")),
  cnaeSecundarioDescricao: z.string().optional().or(z.literal("")),
  categoria: z.string().optional().default(""),
  bairro: z.string().optional().default(""),
  cep: z.string().optional().default(""),
  logradouro: z.string().optional().default(""),
  numero: z.string().optional().default(""),
  cidade: z.string().optional().default(""),
  estado: z.string().optional().default(""),
  whatsapp: z.string().optional().default(""),
  site: z.string().url("URL inválida").optional().or(z.literal("")),
  descricao: z.string().optional().default(""),
  logoFile: z.instanceof(File).optional(),
  bannerFile: z.instanceof(File).optional(),
  instagram: z.string().optional(),
  facebook: z.string().optional(),
  link_google_maps: z.string().url("URL inválida").optional().or(z.literal("")),
});

const loginSchema = z.object({
  cnpj: z.string().min(18, "Informe seu CNPJ"),
  celular: z.string().min(15, "Informe seu celular"),
});

const SuaEmpresa = () => {
  const navigate = useNavigate();
  const [modo, setModo] = useState<"login" | "cadastro">("cadastro");
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [bannerPreview, setBannerPreview] = useState<string | null>(null);
  const [dragLogo, setDragLogo] = useState(false);
  const [dragBanner, setDragBanner] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loadingCnpj, setLoadingCnpj] = useState(false);
  const [loadingCep, setLoadingCep] = useState(false);
  const [lastCnpjBuscado, setLastCnpjBuscado] = useState<string>("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  // Verificar se já está logado
  useEffect(() => {
    const auth = localStorage.getItem('empresa_auth');
    if (auth) {
      navigate('/dashboard');
    }

  }, [navigate]);

  const cadastroForm = useForm<z.infer<typeof cadastroSchema>>({
    resolver: zodResolver(cadastroSchema),
    defaultValues: {
      cnpj: "",
      razaoSocial: "",
      nomeFantasia: "",
      celular: "",
      email: "",
      cnae: "",
      cnaeDescricao: "",
      cnaeSecundario: "",
      cnaeSecundarioDescricao: "",
      categoria: "",
      bairro: "",
      cep: "",
      logradouro: "",
      numero: "",
      cidade: "",
      estado: "",
      whatsapp: "",
      site: "",
      descricao: "",
    },
  });

  const loginForm = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: { cnpj: "", celular: "" },
  });

  const handleCadastro = async (data: z.infer<typeof cadastroSchema>) => {
    console.log("🔍 INICIANDO VALIDAÇÃO DO CADASTRO", data);

    // Limpar erros anteriores
    setFieldErrors({});

    // ===== VALIDAÇÕES IMEDIATAS COM FEEDBACK VISUAL =====

    // 1. CNPJ
    if (!data.cnpj || !isValidCNPJ(data.cnpj)) {
      console.log("❌ ERRO: CNPJ inválido", data.cnpj);
      setFieldErrors({ cnpj: "CNPJ inválido. Verifique se digitou todos os 14 dígitos corretamente." });
      toast("CNPJ Inválido", {
        description: (
          <div className="space-y-2">
            <p className="font-semibold text-red-600">⚠️ O CNPJ digitado não é válido</p>
            <p className="text-sm">Verifique se digitou todos os 14 dígitos corretamente.</p>
            <div className="mt-2 p-2 bg-red-100 rounded text-xs">
              <strong>Formato:</strong> 00.000.000/0000-00
            </div>
          </div>
        ),
        duration: 8000,
      });
      return;
    }

    // 2. Nome Fantasia
    if (!data.nomeFantasia || data.nomeFantasia.trim().length < 3) {
      console.log("❌ ERRO: Nome Fantasia inválido", data.nomeFantasia);
      setFieldErrors({ nomeFantasia: "O nome fantasia deve ter pelo menos 3 caracteres." });
      toast("Nome Fantasia Inválido", {
        description: (
          <div className="space-y-2">
            <p className="font-semibold text-amber-600">📝 Campo obrigatório</p>
            <p className="text-sm">O nome fantasia deve ter pelo menos 3 caracteres.</p>
            <div className="mt-2 p-2 bg-amber-50 rounded text-xs text-amber-800">
              <strong>Exemplo:</strong> Bar do João, Farmácia Central
            </div>
          </div>
        ),
        duration: 8000,
      });
      return;
    }

    // 3. Telefone/Celular
    if (!data.celular || data.celular.replace(/\D/g, '').length < 10) {
      console.log("❌ ERRO: Telefone inválido", data.celular);
      setFieldErrors({ celular: "Digite um número de telefone válido com DDD (mínimo 10 dígitos)." });
      toast("Telefone Inválido", {
        description: (
          <div className="space-y-2">
            <p className="font-semibold text-blue-600">📱 Número de telefone obrigatório</p>
            <p className="text-sm">Digite um número válido com DDD (mínimo 10 dígitos).</p>
            <div className="mt-2 p-2 bg-blue-50 rounded text-xs text-blue-800">
              <strong>Exemplo:</strong> (17) 99999-9999
            </div>
          </div>
        ),
        duration: 8000,
      });
      return;
    }

    // 4. WhatsApp
    if (!data.whatsapp || data.whatsapp.replace(/\D/g, '').length < 10) {
      console.log("❌ ERRO: WhatsApp inválido", data.whatsapp);
      setFieldErrors({ whatsapp: "Digite um número de WhatsApp válido com DDD (mínimo 10 dígitos)." });
      toast("WhatsApp Inválido", {
        description: (
          <div className="space-y-2">
            <p className="font-semibold text-green-600">💬 WhatsApp obrigatório</p>
            <p className="text-sm">Clientes usarão este número para entrar em contato.</p>
            <div className="mt-2 p-2 bg-green-50 rounded text-xs text-green-800">
              <strong>Formato:</strong> (17) 99999-9999
            </div>
          </div>
        ),
        duration: 8000,
      });
      return;
    }

    // 5. E-mail
    if (!data.email || !data.email.includes('@') || !data.email.includes('.')) {
      console.log("❌ ERRO: E-mail inválido", data.email);
      toast("E-mail Inválido", {
        description: (
          <div className="space-y-2">
            <p className="font-semibold text-purple-600">📧 E-mail obrigatório</p>
            <p className="text-sm">Digite um endereço de e-mail válido.</p>
            <div className="mt-2 p-2 bg-purple-50 rounded text-xs text-purple-800">
              <strong>Exemplo:</strong> contato@suaempresa.com
            </div>
          </div>
        ),
        duration: 8000,
      });
      return;
    }

    // 6. Categoria
    if (!data.categoria || data.categoria.trim() === '') {
      console.log("❌ ERRO: Categoria não selecionada", data.categoria);
      setFieldErrors({ categoria: "Selecione a categoria da sua empresa." });
      toast("Categoria Obrigatória", {
        description: (
          <div className="space-y-2">
            <p className="font-semibold text-orange-600">🏷️ Selecione uma categoria</p>
            <p className="text-sm">A categoria ajuda clientes a encontrar sua empresa.</p>
            <div className="mt-2 p-2 bg-orange-50 rounded text-xs text-orange-800">
              Role a página e escolha a categoria que melhor representa seu negócio.
            </div>
          </div>
        ),
        duration: 8000,
      });
      return;
    }

    // 7. Bairro
    if (!data.bairro || data.bairro.trim() === '') {
      console.log("❌ ERRO: Bairro não selecionado", data.bairro);
      setFieldErrors({ bairro: "Selecione o bairro onde sua empresa está localizada." });
      toast("Bairro Obrigatório", {
        description: (
          <div className="space-y-2">
            <p className="font-semibold text-indigo-600">📍 Bairro obrigatório</p>
            <p className="text-sm">Informe o bairro onde sua empresa está localizada em Guaíra-SP.</p>
            <div className="mt-2 p-2 bg-indigo-50 rounded text-xs text-indigo-800">
              O bairro será preenchido automaticamente ao digitar o CEP.
            </div>
          </div>
        ),
        duration: 8000,
      });
      return;
    }

    // 8. CEP
    if (!data.cep || data.cep.replace(/\D/g, '').length !== 8) {
      console.log("❌ ERRO: CEP inválido", data.cep);
      setFieldErrors({ cep: "Digite um CEP válido com 8 dígitos." });
      toast("CEP Inválido", {
        description: (
          <div className="space-y-2">
            <p className="font-semibold text-rose-600">🏠 CEP obrigatório</p>
            <p className="text-sm">Digite o CEP completo com 8 dígitos.</p>
            <div className="mt-2 p-2 bg-rose-50 rounded text-xs text-rose-800">
              <strong>Formato:</strong> 14790-000 | O endereço será preenchido automaticamente
            </div>
          </div>
        ),
        duration: 8000,
      });
      return;
    }

    // 9. Endereço (Logradouro)
    if (!data.logradouro || data.logradouro.trim().length < 3) {
      console.log("❌ ERRO: Endereço inválido", data.logradouro);
      setFieldErrors({ logradouro: "Digite o nome da rua/avenida (mínimo 3 caracteres)." });
      toast("Endereço Inválido", {
        description: (
          <div className="space-y-2">
            <p className="font-semibold text-teal-600">🛣️ Logradouro obrigatório</p>
            <p className="text-sm">Digite o nome da rua/avenida (mínimo 3 caracteres).</p>
            <div className="mt-2 p-2 bg-teal-50 rounded text-xs text-teal-800">
              <strong>Exemplo:</strong> Rua das Flores, Avenida Brasil
            </div>
          </div>
        ),
        duration: 8000,
      });
      return;
    }

    // 10. Número
    if (!data.numero || data.numero.trim() === '') {
      console.log("❌ ERRO: Número não informado", data.numero);
      setFieldErrors({ numero: "Digite o número do estabelecimento." });
      toast("Número Obrigatório", {
        description: (
          <div className="space-y-2">
            <p className="font-semibold text-cyan-600">🔢 Número do endereço obrigatório</p>
            <p className="text-sm">Digite o número do estabelecimento.</p>
            <div className="mt-2 p-2 bg-cyan-50 rounded text-xs text-cyan-800">
              <strong>Dica:</strong> Se não houver número, digite "S/N"
            </div>
          </div>
        ),
        duration: 8000,
      });
      return;
    }

    // 11. Descrição
    if (!data.descricao || data.descricao.trim().length < 20) {
      console.log("❌ ERRO: Descrição muito curta", data.descricao);
      setFieldErrors({ descricao: "A descrição deve ter pelo menos 20 caracteres." });
      toast("Descrição Muito Curta", {
        description: (
          <div className="space-y-2">
            <p className="font-semibold text-pink-600">✍️ Descrição insuficiente</p>
            <p className="text-sm">A descrição deve ter pelo menos 20 caracteres.</p>
            <div className="mt-2 p-2 bg-pink-50 rounded text-xs text-pink-800">
              <strong>Dica:</strong> Conte sobre seus produtos, serviços e diferenciais!
            </div>
          </div>
        ),
        duration: 8000,
      });
      return;
    }

    console.log("✅ TODAS VALIDAÇÕES PASSARAM! Iniciando cadastro...");

    // ===== FIM DAS VALIDAÇÕES =====

    setLoading(true);
    try {
      // Upload de imagens (opcional - se buckets não existirem, usa placeholders)
      const imagens: string[] = [];
      let logoUrl: string | undefined;

      // Tentar upload, mas não falhar se bucket não existir
      if (data.bannerFile) {
        try {
          const [bannerUrl] = await uploadImagens('empresas-images', [data.bannerFile], 'banners');
          if (bannerUrl) imagens.push(bannerUrl);
        } catch (error) {
          console.warn('Upload de banner falhou, continuando sem imagem', error);
          // Usar placeholder
          imagens.push('https://images.unsplash.com/photo-1497366216548-37526070297c?w=800');
        }
      }

      if (data.logoFile) {
        try {
          const [url] = await uploadImagens('empresas-images', [data.logoFile], 'logos');
          logoUrl = url;
        } catch (error) {
          console.warn('Upload de logo falhou, continuando sem logo', error);
          // Usar placeholder
          logoUrl = 'https://images.unsplash.com/photo-1560179707-f14e90ef3623?w=400';
        }
      }

      // Mapeamento de IDs do JSON local para nomes no Supabase
      const categoriasMap: Record<string, string> = {
        'alimentacao-bebidas': 'Alimentação',
        'varejo-alimentar': 'Supermercado',
        'saude-bem-estar': 'Saúde',
        'beleza-estetica': 'Salão de Beleza',
        'moda-vestuario': 'Loja de Roupas',
        'calcados-acessorios': 'Calçados',
        'servicos-gerais': 'Serviços',
        'construcao-reformas': 'Construção',
        'automotivo': 'Automotivo',
        'educacao': 'Educação',
        'tecnologia': 'Tecnologia',
        'pet-shop': 'Pet Shop',
        'entretenimento-lazer': 'Entretenimento',
        'esportes-fitness': 'Academia',
        'turismo-hospedagem': 'Turismo',
        'imoveis': 'Imóveis',
        'financeiro-seguros': 'Outros',
        'profissionais-liberais': 'Serviços',
        'agro-rural': 'Outros'
      };

      const nomeCategoriaBanco = categoriasMap[data.categoria] || 'Outros';

      console.log('🔍 Categoria selecionada:', data.categoria);
      console.log('📝 Nome mapeado para banco:', nomeCategoriaBanco);

      // Buscar ID da categoria no Supabase
      const { data: categoriaData, error: categoriaError } = await supabase
        .from('categorias')
        .select('id')
        .eq('nome', nomeCategoriaBanco)
        .single();

      console.log('🔎 Resultado busca Supabase:', { categoriaData, categoriaError });

      if (categoriaError || !categoriaData) {
        console.error('❌ Erro ao buscar categoria:', categoriaError);
        toast("Erro ao buscar categoria", {
          description: `Não foi possível encontrar a categoria "${nomeCategoriaBanco}" no banco de dados.`,
          duration: 5000,
        });
        setLoading(false);
        return;
      }

      const categoriaId = categoriaData.id;
      console.log('✅ UUID da categoria encontrado:', categoriaId);

      // Criar slug
      const slug = data.nomeFantasia
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');

      const enderecoCompleto = `${data.logradouro}, ${data.numero}`.trim();

      // Criar empresa no Supabase
      const empresaData = {
        cnpj: data.cnpj.replace(/\D/g, ''), // Remove caracteres especiais
        nome: data.nomeFantasia,
        slug,
        descricao: data.descricao,
        categoria_id: categoriaId,
        cnae: data.cnae || null,
        cnae_secundario: data.cnaeSecundario || null,
        subcategorias: [],
        endereco: enderecoCompleto,
        bairro: data.bairro,
        cidade: data.cidade,
        estado: data.estado,
        cep: data.cep.replace(/\D/g, ''),
        latitude: -20.31670000,
        longitude: -48.31150000,
        telefone: data.celular.replace(/\D/g, ''), // Remove máscara
        whatsapp: data.whatsapp.replace(/\D/g, ''), // Remove máscara
        email: data.email,
        site: data.site || null,
        instagram: data.instagram || null,
        facebook: data.facebook || null,
        google_maps_link: data.link_google_maps || null,
        imagens,
        logo: logoUrl || null,
        status: 'pendente' as 'pendente' | 'aprovado' | 'rejeitado' | 'inativo',
        verificado: false,
        destaque: false,
        responsavel_nome: data.razaoSocial,
        responsavel_email: data.email,
        responsavel_telefone: data.celular.replace(/\D/g, ''), // Remove máscara
      };

      console.log('🚀 Enviando para Supabase:', JSON.stringify(empresaData, null, 2));

      const resultado = await criarEmpresa(empresaData);

      if (!resultado.success) {
        const mensagemErro = obterMensagemErroEspecifica(resultado.error);
        toast("Erro ao cadastrar empresa", {
          description: mensagemErro,
          duration: 7000,
        });
        setLoading(false);
        return;
      }

      // Salvar credenciais no localStorage para login
      localStorage.setItem('empresa_auth', JSON.stringify({
        cnpj: data.cnpj,
        celular: data.celular,
        empresaId: resultado.data.id
      }));

      toast("Cadastro realizado!", {
        description: `${data.nomeFantasia} cadastrado com sucesso! Aguarde aprovação.`,
        duration: 3000
      });

      // Redirecionar para dashboard
      setTimeout(() => navigate('/dashboard'), 1500);
    } catch (error: unknown) {
      console.error('Erro ao cadastrar:', error);

      const mensagemErro = obterMensagemErroEspecifica(error);
      toast("Erro ao cadastrar", {
        description: mensagemErro,
        duration: 7000
      });
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (data: z.infer<typeof loginSchema>) => {
    setLoading(true);
    try {
      // Buscar empresa pelo CNPJ e verificar celular (autenticação simples)
      // Nota: Em produção, use Supabase Auth ou similar
      const cnpjLimpo = data.cnpj.replace(/\D/g, '');
      const celularLimpo = data.celular.replace(/\D/g, '');

      console.log("🔍 Tentando login com celular:", celularLimpo);

      const empresasEncontradas = await buscarEmpresas({
        responsavel_telefone: celularLimpo,
        ignorarStatus: true
      });

      console.log("🔍 Resultado da busca:", empresasEncontradas);

      const empresa = empresasEncontradas[0];

      if (!empresa) {
        console.error("❌ Nenhuma empresa encontrada.");
        toast("Login falhou", {
          description: `Nenhuma empresa encontrada com o celular ${celularLimpo}. Verifique se é o mesmo número cadastrado.`,
          duration: 5000
        });
        return;
      }

      // Salvar sessão
      localStorage.setItem('empresa_auth', JSON.stringify({
        cnpj: data.cnpj,
        celular: data.celular,
        empresaId: empresa.id
      }));

      toast("Login realizado!", {
        description: `Bem-vindo, ${empresa.nome}`,
        duration: 2000
      });

      // Redirecionar para dashboard
      setTimeout(() => navigate('/dashboard'), 1000);
    } catch (error) {
      console.error('Erro no login:', error);
      toast("Erro ao fazer login", {
        description: "Tente novamente",
        duration: 2000
      });
    } finally {
      setLoading(false);
    }
  };

  const buscarDadosCnpj = async (cnpjComMascara: string) => {
    const cnpjLimpo = cnpjComMascara.replace(/\D/g, "");
    if (cnpjLimpo.length !== 14) return;
    if (cnpjLimpo === lastCnpjBuscado) return;

    setLoadingCnpj(true);
    try {
      const response = await fetch(`https://brasilapi.com.br/api/cnpj/v1/${cnpjLimpo}`);
      if (!response.ok) {
        throw new Error("CNPJ não encontrado");
      }
      const data: CnpjApiResponse = await response.json();

      const bairroApi = data.bairro || "";
      const bairroValido = BAIRROS_GUAIRA.includes(bairroApi) ? bairroApi : "";

      const setIfEmpty = (field: keyof z.infer<typeof cadastroSchema>, value?: string) => {
        const current = cadastroForm.getValues(field) as string;
        if (!current && value) {
          cadastroForm.setValue(field, value);
        }
      };

      const setCategoriaIfEmpty = (value?: string) => {
        if (!value) return;
        const current = cadastroForm.getValues("categoria");
        if (!current) {
          cadastroForm.setValue("categoria", value);
        }
      };


      setIfEmpty("razaoSocial", data.razao_social);
      setIfEmpty("nomeFantasia", data.nome_fantasia || data.razao_social);
      setIfEmpty("email", data.email);
      if (data.cnae_fiscal) setIfEmpty("cnae", String(data.cnae_fiscal));
      if (data.cnae_fiscal) setIfEmpty("cnaeDescricao", cnaeCodes[String(data.cnae_fiscal)]);
      const cnaeSecundarioApi = data.cnaes_secundarios?.[0]?.codigo;
      if (cnaeSecundarioApi) setIfEmpty("cnaeSecundario", String(cnaeSecundarioApi));
      if (cnaeSecundarioApi) setIfEmpty("cnaeSecundarioDescricao", cnaeCodes[String(cnaeSecundarioApi)]);
      // ENDEREÇO NÃO É MAIS PREENCHIDO PELO CNPJ - apenas pelo CEP


      if (data.ddd_telefone_1) {
        const telefone = formatPhone(data.ddd_telefone_1);
        setIfEmpty("celular", telefone);
        setIfEmpty("whatsapp", telefone);
      }

      toast("Dados do CNPJ preenchidos!", {
        description: "Confira e complete as informações restantes",
        duration: 2000,
      });
      setLastCnpjBuscado(cnpjLimpo);
    } catch (error) {
      toast("Não foi possível buscar o CNPJ", {
        description: "Verifique o número digitado",
        duration: 2000,
      });
    } finally {
      setLoadingCnpj(false);
    }
  };

  const buscarCep = async (cepComMascara: string) => {
    const cepLimpo = cepComMascara.replace(/\D/g, "");
    if (cepLimpo.length !== 8) return;

    setLoadingCep(true);
    try {
      const response = await fetch(`https://viacep.com.br/ws/${cepLimpo}/json/`);
      const data = await response.json();

      if (data.erro) {
        toast("CEP não encontrado", { duration: 2000 });
        return;
      }

      const setIfEmpty = (field: keyof z.infer<typeof cadastroSchema>, value?: string) => {
        const current = cadastroForm.getValues(field) as string;
        if (!current && value) {
          cadastroForm.setValue(field, value);
        }
      };

      setIfEmpty("logradouro", data.logradouro);
      setIfEmpty("bairro", data.bairro);
      setIfEmpty("cidade", data.localidade);
      setIfEmpty("estado", data.uf);

      toast("Endereço preenchido pelo CEP", { duration: 2000 });
    } catch (error) {
      toast("Erro ao buscar CEP", { duration: 2000 });
    } finally {
      setLoadingCep(false);
    }
  };

  // Helpers de formatação onChange
  const onMaskCNPJ = (e: React.ChangeEvent<HTMLInputElement>, formType: "login" | "cadastro") => {
    const masked = formatCNPJ(e.target.value);
    if (formType === "cadastro") {
      cadastroForm.setValue("cnpj", masked);
      if (masked.replace(/\D/g, "").length === 14) {
        buscarDadosCnpj(masked);
      }
    }
    else loginForm.setValue("cnpj", masked);
  };

  const onMaskPhone = (e: React.ChangeEvent<HTMLInputElement>, field: "celular" | "whatsapp", formType: "login" | "cadastro") => {
    const masked = formatPhone(e.target.value);
    if (formType === "cadastro") {
      cadastroForm.setValue(field, masked);
      return;
    }
    if (field === "celular") {
      loginForm.setValue("celular", masked);
    }
  };

  const fileToDataUrl = (file: File, cb: (url: string) => void) => {
    const reader = new FileReader();
    reader.onload = () => cb(reader.result as string);
    reader.readAsDataURL(file);
  };

  const onLogoSelect = (file?: File) => {
    console.log('📸 onLogoSelect chamado:', file);
    if (!file) return;
    cadastroForm.setValue("logoFile", file);
    fileToDataUrl(file, (url) => {
      console.log('✅ Logo preview gerado:', url?.substring(0, 50) + '...');
      setLogoPreview(url);
    });
  };

  const onBannerSelect = (file?: File) => {
    console.log('🖼️ onBannerSelect chamado:', file);
    if (!file) return;
    cadastroForm.setValue("bannerFile", file);
    fileToDataUrl(file, (url) => {
      console.log('✅ Banner preview gerado:', url?.substring(0, 50) + '...');
      setBannerPreview(url);
    });
  };

  const handleLogoInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    console.log('📁 handleLogoInput:', e.target.files);
    onLogoSelect(e.target.files?.[0]);
  };
  const handleBannerInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    console.log('📁 handleBannerInput:', e.target.files);
    onBannerSelect(e.target.files?.[0]);
  };

  const handleDropGeneric = (e: React.DragEvent<HTMLDivElement>, type: "logo" | "banner") => {
    e.preventDefault();
    if (type === "logo") setDragLogo(false); else setDragBanner(false);
    const file = e.dataTransfer.files?.[0];
    if (!file || !file.type.startsWith("image/")) return;
    if (type === "logo") onLogoSelect(file); else onBannerSelect(file);
  };

  const removeLogo = () => { cadastroForm.setValue("logoFile", undefined); setLogoPreview(null); };
  const removeBanner = () => { cadastroForm.setValue("bannerFile", undefined); setBannerPreview(null); };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-grow relative">
        {/* Fundo decorativo */}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/10" />
        <div className="container mx-auto px-4 py-12 relative space-y-10">
          {/* Botões de Navegação */}
          <div className="flex gap-2 mb-6">
            <PortalBackButton className="gap-2 bg-green-500 hover:bg-green-600 text-white rounded-lg px-6" />
            <Button
              onClick={() => navigate('/')}
              className="gap-2 bg-green-500 hover:bg-green-600 text-white rounded-lg px-6"
            >
              <Home className="w-4 h-4" />
              Início
            </Button>
          </div>

          <div className="flex flex-col gap-4 max-w-3xl">
            <h2 className="text-3xl font-bold gradient-text flex items-center gap-3"><Building2 className="h-8 w-8 text-primary" /> Sua Empresa</h2>
            <p className="text-sm text-muted-foreground max-w-xl">Cadastre seu negócio no diretório local ou acesse para ajustar suas informações. Todos os campos principais são obrigatórios para garantir qualidade dos dados exibidos.</p>
            <div className="flex gap-3">
              <Button variant={modo === "cadastro" ? "default" : "outline"} size="sm" onClick={() => setModo("cadastro")} className="gap-2"><PlusCircle className="h-4 w-4" /> Cadastro</Button>
              <Button variant={modo === "login" ? "default" : "outline"} size="sm" onClick={() => setModo("login")} className="gap-2"><Lock className="h-4 w-4" /> Login</Button>
            </div>
          </div>

          {modo === "cadastro" && (
            <Card className="glass-card border-2 max-w-5xl">
              <CardHeader className="pb-4">
                <CardTitle className="text-xl">Cadastro de Empresa</CardTitle>
                <CardDescription>Preencha os dados obrigatórios. Após análise, seu negócio poderá aparecer na listagem.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-8">
                <form className="space-y-8" onSubmit={(e) => {
                  e.preventDefault();
                  const data = cadastroForm.getValues();
                  handleCadastro(data);
                }}>
                  {/* Identificação */}
                  <div className="space-y-6">
                    <h3 className="text-sm font-semibold tracking-wide uppercase text-muted-foreground">Identificação</h3>
                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-xs font-medium">CNPJ *</label>
                        <div className="relative">
                          <Input
                            value={cadastroForm.watch("cnpj")}
                            onChange={(e) => onMaskCNPJ(e, "cadastro")}
                            placeholder="00.000.000/0000-00"
                            className={fieldErrors.cnpj ? 'border-red-500 border-2' : ''}
                          />
                          {loadingCnpj && (
                            <div className="absolute right-3 top-1/2 -translate-y-1/2">
                              <Loader2 className="h-4 w-4 animate-spin text-primary" />
                            </div>
                          )}
                        </div>
                        <p className="text-[11px] text-muted-foreground">Ao completar o CNPJ, os dados serão preenchidos automaticamente.</p>
                        {cadastroForm.formState.errors.cnpj && <p className="text-xs text-destructive">{cadastroForm.formState.errors.cnpj.message}</p>}
                        {fieldErrors.cnpj && (
                          <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-md">
                            <span className="text-red-600 text-sm">⚠️</span>
                            <p className="text-xs text-red-600 font-medium">{fieldErrors.cnpj}</p>
                          </div>
                        )}
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-medium">Razão Social *</label>
                        <Input {...cadastroForm.register("razaoSocial")} />
                        {cadastroForm.formState.errors.razaoSocial && <p className="text-xs text-destructive">{cadastroForm.formState.errors.razaoSocial.message}</p>}
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-medium">Nome Fantasia *</label>
                        <Input
                          {...cadastroForm.register("nomeFantasia")}
                          className={fieldErrors.nomeFantasia ? 'border-amber-500 border-2' : ''}
                        />
                        {cadastroForm.formState.errors.nomeFantasia && <p className="text-xs text-destructive">{cadastroForm.formState.errors.nomeFantasia.message}</p>}
                        {fieldErrors.nomeFantasia && (
                          <div className="flex items-start gap-2 p-3 bg-amber-50 border border-amber-200 rounded-md">
                            <span className="text-amber-600 text-sm">📝</span>
                            <p className="text-xs text-amber-700 font-medium">{fieldErrors.nomeFantasia}</p>
                          </div>
                        )}
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-medium">Email *</label>
                        <Input
                          type="email"
                          {...cadastroForm.register("email")}
                          className={fieldErrors.email ? 'border-purple-500 border-2' : ''}
                        />
                        {cadastroForm.formState.errors.email && <p className="text-xs text-destructive">{cadastroForm.formState.errors.email.message}</p>}
                        {fieldErrors.email && (
                          <div className="flex items-start gap-2 p-3 bg-purple-50 border border-purple-200 rounded-md">
                            <span className="text-purple-600 text-sm">📧</span>
                            <p className="text-xs text-purple-700 font-medium">{fieldErrors.email}</p>
                          </div>
                        )}
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-medium">CNAE</label>
                        <Input
                          value={cadastroForm.watch("cnae")}
                          onChange={(e) => cadastroForm.setValue("cnae", e.target.value)}
                          placeholder="Número do CNAE"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-medium">Descrição do CNAE</label>
                        <Input
                          value={cadastroForm.watch("cnaeDescricao")}
                          onChange={(e) => cadastroForm.setValue("cnaeDescricao", e.target.value)}
                          placeholder="Descrição oficial do CNAE"
                          readOnly
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-medium">CNAE Secundário</label>
                        <Input
                          value={cadastroForm.watch("cnaeSecundario")}
                          onChange={(e) => cadastroForm.setValue("cnaeSecundario", e.target.value)}
                          placeholder="Número do CNAE secundário"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-medium">Descrição do CNAE Secundário</label>
                        <Input
                          value={cadastroForm.watch("cnaeSecundarioDescricao")}
                          onChange={(e) => cadastroForm.setValue("cnaeSecundarioDescricao", e.target.value)}
                          placeholder="Descrição oficial do CNAE secundário"
                          readOnly
                        />
                      </div>
                    </div>
                  </div>

                  {/* Contato */}
                  <div className="space-y-6">
                    <h3 className="text-sm font-semibold tracking-wide uppercase text-muted-foreground">Contato</h3>
                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-xs font-medium">Celular (login) *</label>
                        <Input
                          value={cadastroForm.watch("celular")}
                          onChange={(e) => onMaskPhone(e, "celular", "cadastro")}
                          placeholder="(11) 90000-0000"
                          className={fieldErrors.celular ? 'border-blue-500 border-2' : ''}
                        />
                        {cadastroForm.formState.errors.celular && <p className="text-xs text-destructive">{cadastroForm.formState.errors.celular.message}</p>}
                        {fieldErrors.celular && (
                          <div className="flex items-start gap-2 p-3 bg-blue-50 border border-blue-200 rounded-md">
                            <span className="text-blue-600 text-sm">📱</span>
                            <p className="text-xs text-blue-700 font-medium">{fieldErrors.celular}</p>
                          </div>
                        )}
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-medium">WhatsApp *</label>
                        <Input
                          value={cadastroForm.watch("whatsapp")}
                          onChange={(e) => onMaskPhone(e, "whatsapp", "cadastro")}
                          placeholder="(11) 90000-0000"
                          className={fieldErrors.whatsapp ? 'border-green-500 border-2' : ''}
                        />
                        {cadastroForm.formState.errors.whatsapp && <p className="text-xs text-destructive">{cadastroForm.formState.errors.whatsapp.message}</p>}
                        {fieldErrors.whatsapp && (
                          <div className="flex items-start gap-2 p-3 bg-green-50 border border-green-200 rounded-md">
                            <span className="text-green-600 text-sm">💬</span>
                            <p className="text-xs text-green-700 font-medium">{fieldErrors.whatsapp}</p>
                          </div>
                        )}
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-medium">Site</label>
                        <Input {...cadastroForm.register("site")} placeholder="https://" />
                        {cadastroForm.formState.errors.site && <p className="text-xs text-destructive">{cadastroForm.formState.errors.site.message}</p>}
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-medium">Link Google Maps</label>
                        <Input {...cadastroForm.register("link_google_maps")} placeholder="https://maps.google.com/..." />
                        {cadastroForm.formState.errors.link_google_maps && <p className="text-xs text-destructive">{cadastroForm.formState.errors.link_google_maps.message}</p>}
                      </div>
                    </div>
                  </div>

                  {/* Localização */}
                  <div className="space-y-6">
                    <h3 className="text-sm font-semibold tracking-wide uppercase text-muted-foreground">Localização</h3>
                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-xs font-medium">CEP *</label>
                        <div className="relative">
                          <Input
                            value={cadastroForm.watch("cep")}
                            onChange={(e) => {
                              let valor = e.target.value.replace(/\D/g, "");
                              if (valor.length <= 8) {
                                valor = valor.replace(/(\d{5})(\d)/, "$1-$2");
                                cadastroForm.setValue("cep", valor);
                                if (valor.replace(/\D/g, "").length === 8) {
                                  buscarCep(valor);
                                }
                              }
                            }}
                            placeholder="00000-000"
                            className={fieldErrors.cep ? 'border-rose-500 border-2' : ''}
                          />
                          {loadingCep && (
                            <div className="absolute right-3 top-1/2 -translate-y-1/2">
                              <Loader2 className="h-4 w-4 animate-spin text-primary" />
                            </div>
                          )}
                        </div>
                        {cadastroForm.formState.errors.cep && <p className="text-xs text-destructive">{cadastroForm.formState.errors.cep.message}</p>}
                        {fieldErrors.cep && (
                          <div className="flex items-start gap-2 p-3 bg-rose-50 border border-rose-200 rounded-md">
                            <span className="text-rose-600 text-sm">🏠</span>
                            <p className="text-xs text-rose-700 font-medium">{fieldErrors.cep}</p>
                          </div>
                        )}
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-medium">Bairro *</label>
                        <Input
                          value={cadastroForm.watch("bairro")}
                          onChange={(e) => cadastroForm.setValue("bairro", e.target.value)}
                          placeholder="Digite o bairro"
                          className={fieldErrors.bairro ? 'border-indigo-500 border-2' : ''}
                        />
                        {cadastroForm.formState.errors.bairro && <p className="text-xs text-destructive">{cadastroForm.formState.errors.bairro.message}</p>}
                        {fieldErrors.bairro && (
                          <div className="flex items-start gap-2 p-3 bg-indigo-50 border border-indigo-200 rounded-md">
                            <span className="text-indigo-600 text-sm">📍</span>
                            <p className="text-xs text-indigo-700 font-medium">{fieldErrors.bairro}</p>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-medium">Endereço Completo *</label>
                      <div className="grid md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <label className="text-xs font-medium">Logradouro *</label>
                          <Input
                            value={cadastroForm.watch("logradouro")}
                            onChange={(e) => cadastroForm.setValue("logradouro", e.target.value)}
                            placeholder="Rua / Avenida"
                            className={fieldErrors.logradouro ? 'border-teal-500 border-2' : ''}
                          />
                          {cadastroForm.formState.errors.logradouro && <p className="text-xs text-destructive">{cadastroForm.formState.errors.logradouro.message}</p>}
                          {fieldErrors.logradouro && (
                            <div className="flex items-start gap-2 p-3 bg-teal-50 border border-teal-200 rounded-md">
                              <span className="text-teal-600 text-sm">🛣️</span>
                              <p className="text-xs text-teal-700 font-medium">{fieldErrors.logradouro}</p>
                            </div>
                          )}
                        </div>
                        <div className="space-y-2">
                          <label className="text-xs font-medium">Número *</label>
                          <Input
                            value={cadastroForm.watch("numero")}
                            onChange={(e) => cadastroForm.setValue("numero", e.target.value)}
                            placeholder=""
                            className={fieldErrors.numero ? 'border-cyan-500 border-2' : ''}
                          />
                          {cadastroForm.formState.errors.numero && <p className="text-xs text-destructive">{cadastroForm.formState.errors.numero.message}</p>}
                          {fieldErrors.numero && (
                            <div className="flex items-start gap-2 p-3 bg-cyan-50 border border-cyan-200 rounded-md">
                              <span className="text-cyan-600 text-sm">🔢</span>
                              <p className="text-xs text-cyan-700 font-medium">{fieldErrors.numero}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-xs font-medium">Cidade *</label>
                        <Input
                          value={cadastroForm.watch("cidade")}
                          onChange={(e) => cadastroForm.setValue("cidade", e.target.value)}
                          placeholder="Digite a cidade"
                        />
                        {cadastroForm.formState.errors.cidade && <p className="text-xs text-destructive">{cadastroForm.formState.errors.cidade.message}</p>}
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-medium">UF *</label>
                        <Input
                          value={cadastroForm.watch("estado")}
                          onChange={(e) => cadastroForm.setValue("estado", e.target.value.toUpperCase())}
                          placeholder="SP"
                          maxLength={2}
                        />
                        {cadastroForm.formState.errors.estado && <p className="text-xs text-destructive">{cadastroForm.formState.errors.estado.message}</p>}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-medium">Categoria Principal *</label>
                      <Select value={cadastroForm.watch("categoria")} onValueChange={(v) => cadastroForm.setValue("categoria", v)}>
                        <SelectTrigger className={`w-full ${fieldErrors.categoria ? 'border-orange-500 border-2' : ''}`}><SelectValue placeholder="Selecione a categoria" /></SelectTrigger>
                        <SelectContent className="max-h-[300px]">
                          {categoriasData.categorias.map(c => (
                            <SelectItem key={c.id} value={c.id}>
                              {c.icone} {c.nome}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {cadastroForm.formState.errors.categoria && <p className="text-xs text-destructive">{cadastroForm.formState.errors.categoria.message}</p>}
                      {fieldErrors.categoria && <p className="text-xs text-red-600 font-semibold mt-1">⚠️ Selecione uma categoria</p>}
                      {fieldErrors.categoria && (
                        <div className="flex items-start gap-2 p-3 bg-orange-50 border border-orange-200 rounded-md">
                          <span className="text-orange-600 text-sm">🏷️</span>
                          <p className="text-xs text-orange-700 font-medium">{fieldErrors.categoria}</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Mídia / Descrição */}
                  <div className="space-y-8">
                    <h3 className="text-sm font-semibold tracking-wide uppercase text-muted-foreground">Mídia & Descrição</h3>
                    <div className="space-y-6">
                      {/* Logo */}
                      <div className="space-y-2">
                        <label className="text-xs font-medium flex items-center gap-2">Logo da Empresa <span className="text-muted-foreground">(largura grande, exibição h-40)</span></label>
                        <div
                          className={`relative rounded-xl border-2 border-dashed overflow-hidden group transition-all cursor-pointer ${dragBanner ? 'border-primary bg-primary/5' : 'border-border/70 hover:border-primary/60 bg-muted/30 hover:bg-accent/30'}`}
                          onDragOver={(e) => { e.preventDefault(); setDragBanner(true); }}
                          onDragLeave={() => setDragBanner(false)}
                          onDrop={(e) => handleDropGeneric(e, 'banner')}
                          onClick={() => document.getElementById('banner-input')?.click()}
                        >
                          <input id="banner-input" type="file" accept="image/*" className="hidden" onChange={handleBannerInput} />
                          {bannerPreview ? (
                            <div className="h-40 w-full relative">
                              <img src={bannerPreview} alt="Banner preview" className="h-full w-full object-cover" />
                              <button type="button" onClick={(e) => { e.stopPropagation(); removeBanner(); }} className="absolute top-2 right-2 bg-background/70 backdrop-blur-sm rounded-full p-2 shadow hover:bg-destructive hover:text-destructive-foreground transition-colors" aria-label="Remover banner">
                                <X className="h-4 w-4" />
                              </button>
                              <div className="absolute inset-0 pointer-events-none bg-gradient-to-t from-background/60 to-transparent" />
                            </div>
                          ) : (
                            <div className="h-40 w-full flex flex-col items-center justify-center gap-3">
                              <UploadCloud className="h-8 w-8 text-primary" />
                              <p className="text-xs text-muted-foreground">Arraste ou clique para enviar (JPG/PNG)</p>
                              <p className="text-[10px] text-muted-foreground/70">Ideal ~1200x480 ou similar</p>
                            </div>
                          )}
                        </div>
                      </div>
                      {/* Banner & Descrição */}
                      <div className="grid md:grid-cols-3 gap-6">
                        <div className="space-y-2 md:col-span-2">
                          <label className="text-xs font-medium">Descrição *</label>
                          <Textarea
                            {...cadastroForm.register("descricao")}
                            rows={6}
                            placeholder="Fale sobre produtos, diferenciais, horário, formas de pagamento..."
                            className={fieldErrors.descricao ? 'border-pink-500 border-2' : ''}
                          />
                          {cadastroForm.formState.errors.descricao && <p className="text-xs text-destructive">{cadastroForm.formState.errors.descricao.message}</p>}
                          {fieldErrors.descricao && (
                            <div className="flex items-start gap-2 p-3 bg-pink-50 border border-pink-200 rounded-md">
                              <span className="text-pink-600 text-sm">✍️</span>
                              <p className="text-xs text-pink-700 font-medium">{fieldErrors.descricao}</p>
                            </div>
                          )}
                        </div>
                        <div className="space-y-2">
                          <label className="text-xs font-medium flex items-center gap-2">Banner <span className="text-muted-foreground">(quadrada)</span></label>
                          <div
                            className={`relative border-2 border-dashed rounded-lg p-4 flex flex-col items-center justify-center gap-3 transition-all cursor-pointer ${dragLogo ? 'border-primary bg-primary/5' : 'border-border/70 hover:border-primary/60 bg-muted/30 hover:bg-accent/30'}`}
                            onDragOver={(e) => { e.preventDefault(); setDragLogo(true); }}
                            onDragLeave={() => setDragLogo(false)}
                            onDrop={(e) => handleDropGeneric(e, 'logo')}
                            onClick={() => document.getElementById('logo-input')?.click()}
                          >
                            <input id="logo-input" type="file" accept="image/*" className="hidden" onChange={handleLogoInput} />
                            {logoPreview ? (
                              <div className="relative">
                                <img src={logoPreview} alt="Logo preview" className="h-24 w-24 object-cover rounded-md shadow-sm" />
                                <button type="button" onClick={(e) => { e.stopPropagation(); removeLogo(); }} className="absolute -top-2 -right-2 bg-background/80 backdrop-blur-sm rounded-full p-1 shadow hover:bg-destructive hover:text-destructive-foreground" aria-label="Remover logo">
                                  <X className="h-4 w-4" />
                                </button>
                              </div>
                            ) : (
                              <>
                                <ImageIcon className="h-10 w-10 text-primary" />
                                <p className="text-xs text-muted-foreground">PNG/JPG até 2MB</p>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2 items-center">
                    <Badge variant="secondary">Todos os campos com * são obrigatórios</Badge>
                    {cadastroForm.watch("cnpj") && !isValidCNPJ(cadastroForm.watch("cnpj")) && (
                      <Badge variant="destructive">CNPJ inválido</Badge>
                    )}
                  </div>

                  <div className="flex flex-wrap justify-end gap-3 pt-4">
                    {bannerPreview && <Badge variant="secondary">Banner ok</Badge>}
                    {logoPreview && <Badge variant="secondary">Logo ok</Badge>}
                    <Button type="submit" variant="default" className="gap-2" disabled={loading}>
                      {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <PlusCircle className="h-4 w-4" />}
                      {loading ? "Enviando..." : "Enviar Cadastro"}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}

          {modo === "login" && (
            <Card className="glass-card border-2 max-w-xl">
              <CardHeader className="pb-4">
                <CardTitle className="text-xl">Login</CardTitle>
                <CardDescription>Informe seu CNPJ e celular usados no cadastro.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <form className="space-y-6" onSubmit={loginForm.handleSubmit(handleLogin)}>
                  <div className="space-y-2">
                    <label className="text-xs font-medium">CNPJ *</label>
                    <Input value={loginForm.watch("cnpj")} onChange={(e) => onMaskCNPJ(e, "login")} placeholder="00.000.000/0000-00" />
                    {loginForm.formState.errors.cnpj && <p className="text-xs text-destructive">{loginForm.formState.errors.cnpj.message}</p>}
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-medium">Celular *</label>
                    <Input value={loginForm.watch("celular")} onChange={(e) => onMaskPhone(e, "celular", "login")} placeholder="(11) 90000-0000" />
                    {loginForm.formState.errors.celular && <p className="text-xs text-destructive">{loginForm.formState.errors.celular.message}</p>}
                  </div>
                  <div className="flex justify-end gap-3 pt-2">
                    <Button type="submit" variant="default" className="gap-2" disabled={loading}>
                      {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Lock className="h-4 w-4" />}
                      {loading ? "Entrando..." : "Entrar"}
                    </Button>
                  </div>
                </form>
                <p className="text-xs text-muted-foreground">Caso tenha esquecido seus dados, envie uma nova solicitação de cadastro.</p>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default SuaEmpresa;
