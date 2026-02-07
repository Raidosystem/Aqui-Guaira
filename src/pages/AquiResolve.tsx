import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Home,
  Search,
  Wrench,
  Droplet,
  Zap,
  Hammer,
  PaintBucket,
  Scissors,
  Shirt,
  Utensils,
  Wind,
  Sparkles,
  ArrowLeft,
  MessageCircle,
  Phone,
  Star,
  MapPin,
  Clock,
  Shield,
  BadgeCheck,
  DollarSign,
  Filter,
  TrendingUp,
  AlertCircle,
  CheckCircle2,
  Loader2,
  User,
  FileText
} from "lucide-react";
import categoriasData from "@/data/categorias-servicos.json";
import { buscarProfissionais, criarProfissional, getUsuarioLogado, Profissional } from "@/lib/supabase";
import { LoginDialog } from "@/components/LoginDialog";

const AquiResolve = () => {
  const navigate = useNavigate();
  const [busca, setBusca] = useState("");
  const [profissionais, setProfissionais] = useState<Profissional[]>([]);
  const [loading, setLoading] = useState(true);
  const [meuPerfil, setMeuPerfil] = useState<Profissional | null>(null);

  // Filtros
  const [categoriaFiltro, setCategoriaFiltro] = useState("todas");
  const [bairroFiltro, setBairroFiltro] = useState("todos");
  const [atende24h, setAtende24h] = useState(false);
  const [atendeHoje, setAtendeHoje] = useState(false);
  const [orcamentoGratis, setOrcamentoGratis] = useState(false);
  const [verificado, setVerificado] = useState(false);
  const [avaliacaoMinima, setAvaliacaoMinima] = useState("0");
  const [ordenacao, setOrdenacao] = useState("recomendados");
  const [mostrarFiltros, setMostrarFiltros] = useState(false);

  // Dialogs
  const [showCadastro, setShowCadastro] = useState(false);
  const [showLogin, setShowLogin] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    nome: "",
    cpf: "",
    descricao: "",
    whatsapp: "",
    telefone: "",
    categorias: [] as string[], // Por enquanto apenas uma
    bairros_atendidos: [] as string[],
    atende_24h: false,
    atende_hoje: false,
    orcamento_gratis: false,
  });
  const [submitting, setSubmitting] = useState(false);

  const iconMap: Record<string, any> = {
    pedreiro: Hammer,
    encanador: Droplet,
    eletricista: Zap,
    pintor: PaintBucket,
    marceneiro: Wrench,
    cabelereiro: Scissors,
    costureira: Shirt,
    cozinheiro: Utensils,
    climatizacao: Wind,
    diarista: Sparkles,
    marido_de_aluguel: Wrench,
    serralheiro: Hammer,
    vidraceiro: Wrench,
    gesseiro: PaintBucket,
    refrigeracao: Wind,
    chaveiro: Shield,
    desentupidor: Droplet,
  };

  const colorMap: Record<string, { cor: string; bgCor: string }> = {
    pedreiro: { cor: "text-orange-600", bgCor: "bg-orange-50 dark:bg-orange-950" },
    encanador: { cor: "text-blue-600", bgCor: "bg-blue-50 dark:bg-blue-950" },
    eletricista: { cor: "text-yellow-600", bgCor: "bg-yellow-50 dark:bg-yellow-950" },
    pintor: { cor: "text-purple-600", bgCor: "bg-purple-50 dark:bg-purple-950" },
    marceneiro: { cor: "text-amber-600", bgCor: "bg-amber-50 dark:bg-amber-950" },
    cabelereiro: { cor: "text-pink-600", bgCor: "bg-pink-50 dark:bg-pink-950" },
    costureira: { cor: "text-teal-600", bgCor: "bg-teal-50 dark:bg-teal-950" },
    cozinheiro: { cor: "text-green-600", bgCor: "bg-green-50 dark:bg-green-950" },
    climatizacao: { cor: "text-cyan-600", bgCor: "bg-cyan-50 dark:bg-cyan-950" },
    diarista: { cor: "text-violet-600", bgCor: "bg-violet-50 dark:bg-violet-950" },
  };

  const bairrosGuaira = [
    "Centro", "Eldorado", "Aniceto", "Maracá", "Jardim Paulista",
    "Vila Bela", "Jardim São Pedro", "Vila Nova", "Cohab"
  ];

  const carregarDados = async () => {
    setLoading(true);
    try {
      const data = await buscarProfissionais();
      setProfissionais(data);

      const user = getUsuarioLogado();
      if (user) {
        // Buscar se eu já tenho cadastro (usando filtro de userId)
        const meusDados = await buscarProfissionais({ userId: user.id }); // Status não filtra aqui pois userId é passado
        if (meusDados && meusDados.length > 0) {
          setMeuPerfil(meusDados[0]);
        }
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    carregarDados();
    window.scrollTo(0, 0);
  }, []);

  const handleCadastro = async () => {
    const user = getUsuarioLogado();
    if (!user) {
      setShowLogin(true);
      return;
    }

    if (!formData.nome || !formData.whatsapp || !formData.descricao || formData.categorias.length === 0 || !formData.cpf) {
      toast.error("Preencha os campos obrigatórios (*)");
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        ...formData,
        user_id: user.id,
      };
      const { success, error } = await criarProfissional(payload);
      if (success) {
        toast.success("Cadastro enviado para análise!");
        setShowCadastro(false);
        carregarDados();
      } else {
        toast.error("Erro ao cadastrar. Tente novamente.");
      }
    } catch (e) {
      toast.error("Erro inesperado.");
    } finally {
      setSubmitting(false);
    }
  };

  const limparFiltros = () => {
    setBusca("");
    setCategoriaFiltro("todas");
    setBairroFiltro("todos");
    setAtende24h(false);
    setAtendeHoje(false);
    setOrcamentoGratis(false);
    setVerificado(false);
    setAvaliacaoMinima("0");
  };

  // Filtragem no cliente (caso a API não suporte tudo ou para state local rápido)
  // A API `buscarProfissionais` já deve filtrar a maioria, mas aqui refinamos o que já foi carregado (status 'aprovado' apenas para lista publica)
  // Mas cuidado: buscarProfissionais retorna tudo se for admin/dono?
  // O endpoint deve retornar apenas aprovados para publico.

  const listaExibicao = profissionais.filter(p => {
    // Garantir que p.status === 'aprovado' (API já deve garantir, mas reforçamos)
    if (p.status !== 'aprovado') return false;

    // Filtros locais adicionais se necessário
    const matchBusca = p.nome.toLowerCase().includes(busca.toLowerCase()) ||
      p.descricao.toLowerCase().includes(busca.toLowerCase()) ||
      p.categorias.some(c => c.toLowerCase().includes(busca.toLowerCase()));

    if (!matchBusca) return false;

    if (categoriaFiltro !== 'todas' && !p.categorias.includes(categoriaFiltro)) return false;
    if (bairroFiltro !== 'todos' && !p.bairros_atendidos.includes(bairroFiltro)) return false;
    if (atende24h && !p.atende_24h) return false;
    if (atendeHoje && !p.atende_hoje) return false;
    if (orcamentoGratis && !p.orcamento_gratis) return false;
    if (verificado && !p.verificado) return false;
    if (p.avaliacao_media < parseFloat(avaliacaoMinima)) return false;

    return true;
  });

  return (
    <>
      <Header />
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
        {/* Hero Section */}
        <section className="relative overflow-hidden bg-gradient-to-br from-primary/10 via-background to-primary/5 border-b">
          <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
          <div className="container mx-auto px-4 py-12 relative">
            <div className="flex gap-2 mb-6">
              <Button
                onClick={() => navigate(-1)}
                className="gap-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg px-6"
              >
                <ArrowLeft className="w-4 h-4" />
                Voltar
              </Button>
              <Button
                onClick={() => navigate('/')}
                className="gap-2 bg-green-500 hover:bg-green-600 text-white rounded-lg px-6"
              >
                <Home className="w-4 h-4" />
                Início
              </Button>
            </div>

            <div className="max-w-5xl mx-auto space-y-6">
              <div className="text-center space-y-4">
                <div className="inline-flex p-3 bg-primary/10 rounded-2xl mb-2">
                  <Wrench className="w-8 h-8 text-primary" />
                </div>
                <h1 className="text-4xl md:text-6xl font-black tracking-tight text-foreground leading-[1.1]">
                  Serviços em <span className="gradient-text">Guaíra-SP</span>
                </h1>
                <p className="text-lg md:text-xl text-muted-foreground font-medium max-w-2xl mx-auto">
                  Encontre profissionais de confiança. Contato direto no WhatsApp.
                </p>
              </div>

              {/* Barra de Busca */}
              <div className="max-w-3xl mx-auto">
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-6 h-6 text-muted-foreground" />
                  <Input
                    value={busca}
                    onChange={(e) => setBusca(e.target.value)}
                    placeholder="Busque por serviço (ex: encanador, ar-condicionado)..."
                    className="pl-14 py-7 text-lg rounded-2xl border-2 focus:border-primary shadow-lg"
                  />
                </div>
              </div>

              {/* Botões Rápidos */}
              <div className="flex flex-wrap justify-center gap-3">
                <Button
                  variant={atende24h ? "default" : "outline"}
                  onClick={() => setAtende24h(!atende24h)}
                  className="gap-2 rounded-xl"
                >
                  <Clock className="w-4 h-4" />
                  Emergência 24h
                </Button>
                <Button
                  variant={atendeHoje ? "default" : "outline"}
                  onClick={() => setAtendeHoje(!atendeHoje)}
                  className="gap-2 rounded-xl"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  Atende hoje
                </Button>
                <Button
                  variant={orcamentoGratis ? "default" : "outline"}
                  onClick={() => setOrcamentoGratis(!orcamentoGratis)}
                  className="gap-2 rounded-xl"
                >
                  <DollarSign className="w-4 h-4" />
                  Orçamento grátis
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Status do Usuário */}
        {meuPerfil && (
          <div className="container mx-auto px-4 mt-8">
            <Card className="border-l-4 border-l-primary shadow-md bg-primary/5">
              <div className="p-6 flex items-center justify-between flex-wrap gap-4">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-white dark:bg-zinc-800 rounded-full shadow-sm">
                    <User className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg">Seu Cadastro Profissional: {meuPerfil.nome}</h3>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <span>Status atual:</span>
                      {meuPerfil.status === 'pendente' && <Badge className="bg-amber-500 hover:bg-amber-600 gap-1"><Clock className="w-3 h-3" /> Em análise</Badge>}
                      {meuPerfil.status === 'aprovado' && <Badge className="bg-emerald-500 hover:bg-emerald-600 gap-1"><CheckCircle2 className="w-3 h-3" /> Aprovado e Ativo</Badge>}
                      {meuPerfil.status === 'rejeitado' && <Badge className="bg-rose-500 hover:bg-rose-600 gap-1"><AlertCircle className="w-3 h-3" /> Rejeitado</Badge>}
                    </div>
                    {meuPerfil.status === 'pendente' && (
                      <p className="text-xs mt-1 text-amber-600">Aguarde a aprovação de um administrador para que seu perfil fique visível.</p>
                    )}
                  </div>
                </div>
                <Button variant="outline" className="gap-2" onClick={() => { setFormData(meuPerfil as any); setShowCadastro(true); }}>
                  Editar Perfil
                </Button>
              </div>
            </Card>
          </div>
        )}

        {/* Categorias em Grid */}
        <section className="container mx-auto px-4 py-12">
          <h2 className="text-2xl font-bold mb-6">Categorias de Serviços</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {categoriasData.categories.slice(0, 10).map((cat) => {
              const Icon = iconMap[cat.id] || Wrench;
              const colors = colorMap[cat.id] || { cor: "text-gray-600", bgCor: "bg-gray-50 dark:bg-gray-900" };
              return (
                <Card
                  key={cat.id}
                  className={`cursor-pointer transition-all hover:shadow-lg hover:scale-105 ${categoriaFiltro === cat.id ? 'ring-2 ring-primary' : ''
                    }`}
                  onClick={() => setCategoriaFiltro(categoriaFiltro === cat.id ? 'todas' : cat.id)}
                >
                  <CardContent className={`p-6 text-center space-y-3 ${colors.bgCor}`}>
                    <div className="flex justify-center">
                      <Icon className={`w-8 h-8 ${colors.cor}`} />
                    </div>
                    <h3 className="font-semibold text-sm leading-tight">{cat.name}</h3>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </section>

        {/* Lista de Profissionais */}
        <section className="container mx-auto px-4 pb-16">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">
              {listaExibicao.length === 0 ? "Nenhum" : listaExibicao.length}
              {" "}Profissional{listaExibicao.length !== 1 ? "is" : ""} Encontrado{listaExibicao.length !== 1 ? "s" : ""}
            </h2>
          </div>

          {loading ? (
            <div className="py-20 text-center">
              <Loader2 className="w-10 h-10 animate-spin text-primary mx-auto mb-4" />
              <p className="text-muted-foreground">Carregando profissionais...</p>
            </div>
          ) : listaExibicao.length === 0 ? (
            <Card className="bg-gradient-to-br from-primary/5 to-background">
              <CardContent className="p-12 text-center space-y-6">
                <div className="inline-flex p-4 bg-primary/10 rounded-2xl">
                  <AlertCircle className="w-12 h-12 text-primary" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-xl font-bold">Nenhum profissional encontrado</h3>
                  <p className="text-muted-foreground max-w-lg mx-auto">
                    Não encontramos profissionais com os filtros selecionados ou ainda não há cadastros nesta categoria.
                  </p>
                </div>
                {!meuPerfil && (
                  <Button size="lg" className="gap-2 font-bold" onClick={() => {
                    const u = getUsuarioLogado();
                    if (!u) setShowLogin(true);
                    else setShowCadastro(true);
                  }}>
                    <BadgeCheck className="w-5 h-5" />
                    Quero me Cadastrar
                  </Button>
                )}
              </CardContent>
            </Card>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {listaExibicao.map((prof) => {
                // Pega a primeira categoria para estilização
                const catId = prof.categorias?.[0] || "";
                const categoria = categoriasData.categories.find((c) => c.id === catId);
                const Icon = iconMap[catId] || Wrench;
                const colors = colorMap[catId] || { cor: "text-gray-600", bgCor: "bg-gray-50" };

                return (
                  <Card key={prof.id} className="hover:shadow-xl transition-all group overflow-hidden border-zinc-200 dark:border-zinc-800">
                    <CardContent className="p-0">
                      <div className={`p-6 ${colors.bgCor} border-b border-zinc-100 dark:border-zinc-700/50`}>
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-4">
                            <div className="p-3 bg-white dark:bg-zinc-800 rounded-xl shadow-sm">
                              <Icon className={`w-6 h-6 ${colors.cor}`} />
                            </div>
                            <div>
                              <h3 className="font-bold text-lg leading-tight">{prof.nome}</h3>
                              <p className="text-sm font-medium opacity-70">{categoria?.name || 'Profissional'}</p>
                            </div>
                          </div>
                          {prof.verificado && (
                            <Badge className="bg-blue-500 hover:bg-blue-600" title="Identidade Verificada">
                              <BadgeCheck className="w-3 h-3 text-white" />
                            </Badge>
                          )}
                        </div>
                      </div>

                      <div className="p-6 space-y-4">
                        <p className="text-sm text-zinc-600 dark:text-zinc-400 line-clamp-3 min-h-[60px]">
                          {prof.descricao}
                        </p>

                        <div className="flex flex-wrap gap-2">
                          {prof.atende_24h && <Badge variant="secondary" className="text-[10px]"><Clock className="w-3 h-3 mr-1" /> 24h</Badge>}
                          {prof.atende_hoje && <Badge variant="secondary" className="text-[10px]"><CheckCircle2 className="w-3 h-3 mr-1" /> Atende Hoje</Badge>}
                          {prof.orcamento_gratis && <Badge variant="secondary" className="text-[10px]"><DollarSign className="w-3 h-3 mr-1" /> Orçamento Grátis</Badge>}
                        </div>

                        {prof.bairros_atendidos && prof.bairros_atendidos.length > 0 && (
                          <div className="flex items-start gap-2 text-xs text-muted-foreground p-3 bg-zinc-50 dark:bg-zinc-900 rounded-lg">
                            <MapPin className="w-3.5 h-3.5 mt-0.5 shrink-0" />
                            <span className="line-clamp-1">
                              Atende: {prof.bairros_atendidos.join(", ")}
                            </span>
                          </div>
                        )}

                        <div className="grid grid-cols-2 gap-3 pt-2">
                          <Button className="w-full bg-green-500 hover:bg-green-600 text-white font-bold gap-2 shadow-lg shadow-green-500/20" asChild>
                            <a href={`https://wa.me/${prof.whatsapp}?text=Olá ${prof.nome}, vi seu perfil no Aqui Guaíra!`} target="_blank">
                              <MessageCircle className="w-4 h-4" />
                              WhatsApp
                            </a>
                          </Button>
                          {prof.telefone && (
                            <Button variant="outline" className="w-full font-bold gap-2" asChild>
                              <a href={`tel:${prof.telefone}`}>
                                <Phone className="w-4 h-4" />
                                Ligar
                              </a>
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </section>

        {/* CTA Section */}
        {!meuPerfil && (
          <section className="bg-gradient-to-br from-primary/10 to-background border-y py-16">
            <div className="container mx-auto px-4">
              <div className="max-w-3xl mx-auto text-center space-y-8">
                <div className="space-y-4">
                  <div className="inline-flex p-4 bg-primary rounded-2xl shadow-xl">
                    <TrendingUp className="w-8 h-8 text-white" />
                  </div>
                  <h2 className="text-3xl md:text-4xl font-black">Você é um profissional?</h2>
                  <p className="text-lg text-muted-foreground">
                    Cadastre-se gratuitamente usando seu CPF e seja encontrado por clientes em Guaíra-SP.
                  </p>
                </div>

                <Button size="lg" className="font-bold text-lg px-8 py-6 h-auto gap-2" onClick={() => {
                  const u = getUsuarioLogado();
                  if (!u) setShowLogin(true);
                  else setShowCadastro(true);
                }}>
                  <BadgeCheck className="w-5 h-5" />
                  Quero Cadastrar Meu Serviço
                </Button>
              </div>
            </div>
          </section>
        )}
      </div>

      <Footer />
      <LoginDialog open={showLogin} onOpenChange={setShowLogin} />

      {/* Modal de Cadastro */}
      <Dialog open={showCadastro} onOpenChange={setShowCadastro}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl">
          <DialogHeader>
            <DialogTitle className="text-2xl font-black flex items-center gap-2">
              <Wrench className="w-6 h-6 text-primary" />
              Cadastro de Profissional
            </DialogTitle>
            <DialogDescription>
              Preencha seus dados para divulgar seus serviços. Seu perfil passará por aprovação.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Nome Completo / Profissional *</Label>
                <Input placeholder="Ex: João Silva Eletricista" value={formData.nome} onChange={e => setFormData({ ...formData, nome: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>CPF (Apenas números) *</Label>
                <Input placeholder="000.000.000-00" value={formData.cpf} onChange={e => setFormData({ ...formData, cpf: e.target.value })} maxLength={14} />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>WhatsApp de Contato *</Label>
                <Input placeholder="17999999999" value={formData.whatsapp} onChange={e => setFormData({ ...formData, whatsapp: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Outro Telefone (Opcional)</Label>
                <Input placeholder="Fixo ou recado" value={formData.telefone} onChange={e => setFormData({ ...formData, telefone: e.target.value })} />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Categoria Principal *</Label>
              <Select value={formData.categorias[0] || ""} onValueChange={(val) => setFormData({ ...formData, categorias: [val] })}>
                <SelectTrigger><SelectValue placeholder="Selecione sua atividade" /></SelectTrigger>
                <SelectContent>
                  {categoriasData.categories.map(c => (
                    <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Bairro Principal de Atuação</Label>
              <Select value={formData.bairros_atendidos[0] || ""} onValueChange={(val) => setFormData({ ...formData, bairros_atendidos: [val] })}>
                <SelectTrigger><SelectValue placeholder="Selecione o bairro base" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Todos">Atendo em toda a cidade</SelectItem>
                  {bairrosGuaira.map(b => (
                    <SelectItem key={b} value={b}>{b}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Descrição dos Serviços *</Label>
              <Textarea
                placeholder="Descreva o que você faz, sua experiência, diferenciais..."
                rows={4}
                value={formData.descricao}
                onChange={e => setFormData({ ...formData, descricao: e.target.value })}
              />
            </div>

            <div className="flex flex-col gap-3 p-4 bg-zinc-50 dark:bg-zinc-900 rounded-xl border">
              <span className="text-sm font-bold text-muted-foreground uppercase">Diferenciais</span>
              <div className="flex items-center gap-2">
                <Checkbox id="24h" checked={formData.atende_24h} onCheckedChange={(c) => setFormData({ ...formData, atende_24h: c as boolean })} />
                <Label htmlFor="24h" className="cursor-pointer">Atendimento de Emergência 24h</Label>
              </div>
              <div className="flex items-center gap-2">
                <Checkbox id="hoje" checked={formData.atende_hoje} onCheckedChange={(c) => setFormData({ ...formData, atende_hoje: c as boolean })} />
                <Label htmlFor="hoje" className="cursor-pointer">Disponibilidade para hoje</Label>
              </div>
              <div className="flex items-center gap-2">
                <Checkbox id="gratis" checked={formData.orcamento_gratis} onCheckedChange={(c) => setFormData({ ...formData, orcamento_gratis: c as boolean })} />
                <Label htmlFor="gratis" className="cursor-pointer">Faço orçamento sem compromisso</Label>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="ghost" onClick={() => setShowCadastro(false)}>Cancelar</Button>
            <Button onClick={handleCadastro} disabled={submitting}>
              {submitting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <BadgeCheck className="w-4 h-4 mr-2" />}
              Confirmar Cadastro
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default AquiResolve;
