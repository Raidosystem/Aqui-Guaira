import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
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
} from "lucide-react";
import categoriasData from "@/data/categorias-servicos.json";

const AquiResolve = () => {
  const navigate = useNavigate();
  const [busca, setBusca] = useState("");
  const [categoriaFiltro, setCategoriaFiltro] = useState("todas");
  const [bairroFiltro, setBairroFiltro] = useState("todos");
  const [atende24h, setAtende24h] = useState(false);
  const [atendeHoje, setAtendeHoje] = useState(false);
  const [orcamentoGratis, setOrcamentoGratis] = useState(false);
  const [verificado, setVerificado] = useState(false);
  const [avaliacaoMinima, setAvaliacaoMinima] = useState("0");
  const [ordenacao, setOrdenacao] = useState("recomendados");
  const [mostrarFiltros, setMostrarFiltros] = useState(false);

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

  // Dados mockados de profissionais
  const profissionais: any[] = [];

  const bairrosGuaira = [
    "Centro", "Eldorado", "Aniceto", "Maracá", "Jardim Paulista",
    "Vila Bela", "Jardim São Pedro", "Vila Nova", "Cohab"
  ];

  const profissionaisFiltrados = profissionais.filter((prof) => {
    const matchBusca = prof.name.toLowerCase().includes(busca.toLowerCase()) ||
                       prof.description?.toLowerCase().includes(busca.toLowerCase());
    const matchCategoria = categoriaFiltro === "todas" || prof.categories.includes(categoriaFiltro);
    const matchBairro = bairroFiltro === "todos" || prof.serviceArea?.includes(bairroFiltro);
    const match24h = !atende24h || prof.emergency24h;
    const matchHoje = !atendeHoje || prof.sameDay;
    const matchOrcamento = !orcamentoGratis || prof.freeQuote;
    const matchVerificado = !verificado || prof.verified;
    const matchAvaliacao = prof.rating >= parseFloat(avaliacaoMinima);
    
    return matchBusca && matchCategoria && matchBairro && match24h && 
           matchHoje && matchOrcamento && matchVerificado && matchAvaliacao;
  });

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

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
                <Button
                  variant={verificado ? "default" : "outline"}
                  onClick={() => setVerificado(!verificado)}
                  className="gap-2 rounded-xl"
                >
                  <BadgeCheck className="w-4 h-4" />
                  Verificados
                </Button>
                <Button
                  variant={avaliacaoMinima !== "0" ? "default" : "outline"}
                  onClick={() => setAvaliacaoMinima(avaliacaoMinima === "0" ? "4" : "0")}
                  className="gap-2 rounded-xl"
                >
                  <Star className="w-4 h-4" />
                  Melhor avaliados
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Categorias em Grid */}
        <section className="container mx-auto px-4 py-12">
          <h2 className="text-2xl font-bold mb-6">Categorias de Serviços</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {categoriasData.categories.slice(0, 10).map((cat) => {
              const Icon = iconMap[cat.id] || Wrench;
              const colors = colorMap[cat.id] || { cor: "text-gray-600", bgCor: "bg-gray-50" };
              return (
                <Card
                  key={cat.id}
                  className={`cursor-pointer transition-all hover:shadow-lg hover:scale-105 ${
                    categoriaFiltro === cat.id ? 'ring-2 ring-primary' : ''
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

        {/* Filtros Avançados */}
        <section className="container mx-auto px-4 pb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold flex items-center gap-2">
                  <Filter className="w-5 h-5" />
                  Filtros
                </h3>
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={limparFiltros}
                    className="text-sm"
                  >
                    Limpar filtros
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setMostrarFiltros(!mostrarFiltros)}
                    className="lg:hidden"
                  >
                    {mostrarFiltros ? "Ocultar" : "Mostrar"} filtros
                  </Button>
                </div>
              </div>
              
              <div className={`grid md:grid-cols-2 lg:grid-cols-4 gap-4 ${mostrarFiltros || 'hidden lg:grid'}`}>
                <div className="space-y-2">
                  <Label>Categoria</Label>
                  <Select value={categoriaFiltro} onValueChange={setCategoriaFiltro}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="todas">Todas as Categorias</SelectItem>
                      {categoriasData.categories.map((cat) => (
                        <SelectItem key={cat.id} value={cat.id}>
                          {cat.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Seu Bairro</Label>
                  <Select value={bairroFiltro} onValueChange={setBairroFiltro}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="todos">Todos os Bairros</SelectItem>
                      {bairrosGuaira.map((bairro) => (
                        <SelectItem key={bairro} value={bairro}>
                          {bairro}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Avaliação Mínima</Label>
                  <Select value={avaliacaoMinima} onValueChange={setAvaliacaoMinima}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="0">Todas</SelectItem>
                      <SelectItem value="3">3+ estrelas</SelectItem>
                      <SelectItem value="4">4+ estrelas</SelectItem>
                      <SelectItem value="4.5">4.5+ estrelas</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Ordenar por</Label>
                  <Select value={ordenacao} onValueChange={setOrdenacao}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="recomendados">Recomendados</SelectItem>
                      <SelectItem value="melhor_avaliados">Melhor Avaliados</SelectItem>
                      <SelectItem value="atende_hoje">Atende Hoje</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Lista de Profissionais */}
        <section className="container mx-auto px-4 pb-16">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">
              {profissionaisFiltrados.length === 0 ? "Nenhum" : profissionaisFiltrados.length} 
              {" "}Profissional{profissionaisFiltrados.length !== 1 ? "is" : ""} Encontrado{profissionaisFiltrados.length !== 1 ? "s" : ""}
            </h2>
          </div>

          {profissionaisFiltrados.length === 0 ? (
            <Card className="bg-gradient-to-br from-primary/5 to-background">
              <CardContent className="p-12 text-center space-y-6">
                <div className="inline-flex p-4 bg-primary/10 rounded-2xl">
                  <AlertCircle className="w-12 h-12 text-primary" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-xl font-bold">Nenhum profissional cadastrado ainda</h3>
                  <p className="text-muted-foreground max-w-lg mx-auto">
                    Seja o primeiro profissional da sua categoria! Cadastre-se gratuitamente e comece a receber contatos de clientes.
                  </p>
                </div>
                <Button size="lg" className="gap-2 font-bold">
                  <BadgeCheck className="w-5 h-5" />
                  Quero me Cadastrar
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {profissionaisFiltrados.map((prof) => {
                const categoria = categoriasData.categories.find((c) => prof.categories.includes(c.id));
                const Icon = iconMap[categoria?.id || ""] || Wrench;
                const colors = colorMap[categoria?.id || ""] || { cor: "text-gray-600", bgCor: "bg-gray-50" };
                
                return (
                  <Card key={prof.id} className="hover:shadow-xl transition-all group">
                    <CardContent className="p-6 space-y-4">
                      <div className="flex items-start gap-4">
                        <div className={`p-3 rounded-xl ${colors.bgCor} group-hover:scale-110 transition-transform`}>
                          <Icon className={`w-6 h-6 ${colors.cor}`} />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-bold text-lg">{prof.name}</h3>
                          <p className="text-sm text-muted-foreground">{categoria?.name}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <div className="flex items-center gap-1">
                              <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                              <span className="text-sm font-bold">{prof.rating}</span>
                            </div>
                            <span className="text-xs text-muted-foreground">
                              ({prof.reviewsCount} avaliações)
                            </span>
                          </div>
                        </div>
                      </div>

                      <p className="text-sm text-muted-foreground line-clamp-2">{prof.description}</p>

                      <div className="flex flex-wrap gap-2">
                        {prof.emergency24h && (
                          <Badge variant="secondary" className="gap-1">
                            <Clock className="w-3 h-3" />
                            24h
                          </Badge>
                        )}
                        {prof.sameDay && (
                          <Badge variant="secondary" className="gap-1">
                            <CheckCircle2 className="w-3 h-3" />
                            Hoje
                          </Badge>
                        )}
                        {prof.freeQuote && (
                          <Badge variant="secondary" className="gap-1">
                            <DollarSign className="w-3 h-3" />
                            Grátis
                          </Badge>
                        )}
                        {prof.verified && (
                          <Badge variant="default" className="gap-1">
                            <BadgeCheck className="w-3 h-3" />
                            Verificado
                          </Badge>
                        )}
                      </div>

                      {prof.serviceArea && prof.serviceArea.length > 0 && (
                        <div className="flex items-start gap-2 text-sm">
                          <MapPin className="w-4 h-4 text-muted-foreground flex-shrink-0 mt-0.5" />
                          <span className="text-muted-foreground">
                            {prof.serviceArea.slice(0, 3).join(", ")}
                            {prof.serviceArea.length > 3 && ` +${prof.serviceArea.length - 3}`}
                          </span>
                        </div>
                      )}

                      <div className="grid grid-cols-2 gap-2 pt-2">
                        <Button 
                          className="gap-2 bg-green-600 hover:bg-green-700"
                          asChild
                        >
                          <a 
                            href={`https://wa.me/${prof.whatsapp}?text=Olá, vi seu perfil no Aqui Guaíra e gostaria de um orçamento.`}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <MessageCircle className="w-4 h-4" />
                            WhatsApp
                          </a>
                        </Button>
                        {prof.phone && (
                          <Button 
                            variant="outline"
                            className="gap-2"
                            asChild
                          >
                            <a href={`tel:${prof.phone}`}>
                              <Phone className="w-4 h-4" />
                              Ligar
                            </a>
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </section>

        {/* CTA Section com SEO */}
        <section className="bg-gradient-to-br from-primary/10 to-background border-y py-16">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center space-y-8">
              <div className="space-y-4">
                <div className="inline-flex p-4 bg-primary rounded-2xl shadow-xl">
                  <TrendingUp className="w-8 h-8 text-white" />
                </div>
                <h2 className="text-3xl md:text-4xl font-black">Você é um profissional?</h2>
                <p className="text-lg text-muted-foreground">
                  Cadastre-se gratuitamente e seja encontrado por centenas de clientes em Guaíra-SP. 
                  Receba contatos diretos no WhatsApp!
                </p>
              </div>
              
              <div className="grid md:grid-cols-3 gap-6 text-left">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-green-600" />
                    <h3 className="font-bold">Grátis</h3>
                  </div>
                  <p className="text-sm text-muted-foreground">Cadastro 100% gratuito sem mensalidade</p>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <MessageCircle className="w-5 h-5 text-green-600" />
                    <h3 className="font-bold">Contato Direto</h3>
                  </div>
                  <p className="text-sm text-muted-foreground">Cliente fala com você pelo WhatsApp</p>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <BadgeCheck className="w-5 h-5 text-green-600" />
                    <h3 className="font-bold">Seja Verificado</h3>
                  </div>
                  <p className="text-sm text-muted-foreground">Ganhe credibilidade com selo de verificado</p>
                </div>
              </div>

              <Button size="lg" className="font-bold text-lg px-8 py-6 h-auto gap-2">
                <BadgeCheck className="w-5 h-5" />
                Quero Cadastrar Meu Serviço
              </Button>
            </div>
          </div>
        </section>

        {/* SEO Content */}
        <section className="container mx-auto px-4 py-12">
          <div className="max-w-4xl mx-auto prose prose-gray dark:prose-invert">
            <h2 className="text-2xl font-bold mb-4">Serviços em Guaíra-SP</h2>
            <p className="text-muted-foreground leading-relaxed">
              No <strong>Aqui Guaíra</strong> você encontra profissionais e serviços locais em Guaíra-SP. 
              Compare avaliações, veja horários de atendimento, bairros atendidos e formas de pagamento. 
              Entre em contato diretamente pelo WhatsApp e agende seu atendimento com rapidez e segurança.
            </p>
            <p className="text-muted-foreground leading-relaxed mt-4">
              Categorias disponíveis: pedreiros, encanadores, eletricistas, pintores, marceneiros, 
              cabeleireiros, costureiras, cozinheiros, diaristas, instalação de ar-condicionado, 
              marido de aluguel e muito mais.
            </p>
          </div>
        </section>
      </div>
      <Footer />
    </>
  );
};

export default AquiResolve;
