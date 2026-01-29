import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Calendar, ArrowLeft, Home, MapPin, Clock, Users, 
  Church, Trophy, Palette, TreePine, Building2, 
  Filter, Search, ExternalLink, Info, Sparkles,
  CalendarDays, CalendarClock, Star
} from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface Evento {
  id: string;
  titulo: string;
  descricao: string;
  categoria: "praca" | "igreja" | "campeonato" | "exposicao" | "cultura";
  local: string;
  data: string;
  horario: string;
  organizador: string;
  contato?: string;
  destaque?: boolean;
}

// Dados de exemplo - serão substituídos por dados da API/Supabase
const eventosExemplo: Evento[] = [
  {
    id: "1",
    titulo: "Feira Livre - Centro",
    descricao: "Feira tradicional com produtos frescos, artesanato e comidas típicas",
    categoria: "praca",
    local: "Praça da Matriz",
    data: "2026-02-01",
    horario: "06:00 - 12:00",
    organizador: "Prefeitura Municipal",
    destaque: true
  },
  {
    id: "2",
    titulo: "Missa de Domingo",
    descricao: "Celebração dominical com a comunidade",
    categoria: "igreja",
    local: "Igreja Matriz São Pedro",
    data: "2026-02-02",
    horario: "08:00 e 19:00",
    organizador: "Paróquia São Pedro"
  },
  {
    id: "3",
    titulo: "Campeonato de Futebol Society",
    descricao: "3ª rodada do campeonato municipal",
    categoria: "campeonato",
    local: "Centro Esportivo",
    data: "2026-02-01",
    horario: "14:00",
    organizador: "Secretaria de Esportes",
    contato: "(17) 3331-9600"
  }
];

export default function AgendaEventos() {
  const navigate = useNavigate();
  const [filtroCategoria, setFiltroCategoria] = useState<string>("todas");
  const [busca, setBusca] = useState("");

  const getCategoriaInfo = (categoria: string) => {
    const categorias: Record<string, { icon: any; label: string; color: string }> = {
      praca: { icon: TreePine, label: "Praças", color: "bg-green-500" },
      igreja: { icon: Church, label: "Igrejas", color: "bg-purple-500" },
      campeonato: { icon: Trophy, label: "Campeonatos", color: "bg-yellow-500" },
      exposicao: { icon: Palette, label: "Exposições", color: "bg-pink-500" },
      cultura: { icon: Sparkles, label: "Cultura", color: "bg-blue-500" }
    };
    return categorias[categoria] || { icon: Calendar, label: categoria, color: "bg-gray-500" };
  };

  const eventosFiltrados = eventosExemplo.filter(evento => {
    const passaCategoria = filtroCategoria === "todas" || evento.categoria === filtroCategoria;
    const passaBusca = busca === "" || 
      evento.titulo.toLowerCase().includes(busca.toLowerCase()) ||
      evento.local.toLowerCase().includes(busca.toLowerCase()) ||
      evento.organizador.toLowerCase().includes(busca.toLowerCase());
    return passaCategoria && passaBusca;
  });

  const formatarData = (data: string) => {
    const date = new Date(data);
    return date.toLocaleDateString('pt-BR', { 
      weekday: 'long', 
      day: '2-digit', 
      month: 'long',
      year: 'numeric'
    });
  };

  const totalPorCategoria = (cat: string) => {
    return eventosExemplo.filter(e => e.categoria === cat).length;
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />

      <main className="flex-grow">
        {/* Hero Section */}
        <section className="relative pt-12 pb-20 overflow-hidden bg-gradient-to-br from-indigo-50 via-background to-purple-50 dark:from-indigo-950/20 dark:via-background dark:to-purple-950/20">
          <div className="absolute top-0 right-0 -mr-24 -mt-24 w-[500px] h-[500px] bg-indigo-500/10 rounded-full blur-[120px]" />
          <div className="absolute bottom-0 left-0 -ml-24 -mb-24 w-[400px] h-[400px] bg-purple-500/10 rounded-full blur-[120px]" />
          
          <div className="container mx-auto px-4 relative z-10">
            <div className="flex items-center gap-3 mb-6">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate(-1)}
                className="gap-2 hover:gap-3 transition-all"
              >
                <ArrowLeft className="w-4 h-4" />
                Voltar
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/')}
                className="gap-2"
              >
                <Home className="w-4 h-4" />
                Início
              </Button>
            </div>

            <div className="max-w-3xl">
              <div className="flex items-center gap-4 mb-4">
                <div className="p-4 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl shadow-lg">
                  <Calendar className="w-10 h-10 text-white" />
                </div>
                <div>
                  <h1 className="text-4xl md:text-5xl font-black text-foreground mb-2">
                    Agenda de <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">Eventos</span>
                  </h1>
                  <p className="text-lg text-muted-foreground font-medium">
                    Programação semanal de Guaíra-SP
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap gap-2 mt-6">
                <Badge variant="secondary" className="bg-green-100 text-green-700 border-green-200">
                  <TreePine className="w-3 h-3 mr-1" />
                  Praças
                </Badge>
                <Badge variant="secondary" className="bg-purple-100 text-purple-700 border-purple-200">
                  <Church className="w-3 h-3 mr-1" />
                  Igrejas
                </Badge>
                <Badge variant="secondary" className="bg-yellow-100 text-yellow-700 border-yellow-200">
                  <Trophy className="w-3 h-3 mr-1" />
                  Campeonatos
                </Badge>
                <Badge variant="secondary" className="bg-pink-100 text-pink-700 border-pink-200">
                  <Palette className="w-3 h-3 mr-1" />
                  Exposições
                </Badge>
                <Badge variant="secondary" className="bg-blue-100 text-blue-700 border-blue-200">
                  <Sparkles className="w-3 h-3 mr-1" />
                  Cultura
                </Badge>
              </div>
            </div>
          </div>
        </section>

        {/* Filtros e Busca */}
        <section className="container mx-auto px-4 -mt-8 relative z-20">
          <Card className="bg-card border border-border/50 shadow-2xl rounded-3xl overflow-hidden">
            <CardContent className="p-8">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-foreground flex items-center gap-2">
                    <Filter className="w-4 h-4" />
                    Filtrar por Categoria
                  </label>
                  <select
                    value={filtroCategoria}
                    onChange={(e) => setFiltroCategoria(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border-2 border-border bg-background text-foreground font-medium focus:border-primary focus:outline-none transition-all"
                  >
                    <option value="todas">Todas as Categorias</option>
                    <option value="praca">Praças ({totalPorCategoria('praca')})</option>
                    <option value="igreja">Igrejas ({totalPorCategoria('igreja')})</option>
                    <option value="campeonato">Campeonatos ({totalPorCategoria('campeonato')})</option>
                    <option value="exposicao">Exposições ({totalPorCategoria('exposicao')})</option>
                    <option value="cultura">Cultura ({totalPorCategoria('cultura')})</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-bold text-foreground flex items-center gap-2">
                    <Search className="w-4 h-4" />
                    Buscar Evento
                  </label>
                  <Input
                    type="text"
                    placeholder="Digite o nome, local ou organizador..."
                    value={busca}
                    onChange={(e) => setBusca(e.target.value)}
                    className="px-4 py-6 rounded-xl border-2 border-border focus:border-primary text-base font-medium"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between mt-6 pt-6 border-t border-border/50">
                <p className="text-sm text-muted-foreground font-medium">
                  <span className="font-bold text-foreground">{eventosFiltrados.length}</span> eventos encontrados
                </p>
                {busca && (
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => setBusca("")}
                    className="text-primary font-bold"
                  >
                    Limpar busca
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Lista de Eventos */}
        <section className="container mx-auto px-4 py-12">
          {eventosFiltrados.length === 0 ? (
            <div className="py-24 text-center bg-muted/20 rounded-3xl border-2 border-dashed border-border/50">
              <Calendar className="w-20 h-20 mx-auto text-muted-foreground/30 mb-4" />
              <h3 className="text-2xl font-black text-foreground mb-2">Nenhum evento encontrado</h3>
              <p className="text-muted-foreground font-medium mb-6">
                Tente ajustar seus filtros ou busca
              </p>
              <Button 
                onClick={() => { setBusca(""); setFiltroCategoria("todas"); }}
                className="gap-2"
              >
                <Filter className="w-4 h-4" />
                Limpar Filtros
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {eventosFiltrados.map((evento) => {
                const categoriaInfo = getCategoriaInfo(evento.categoria);
                const IconeCategoria = categoriaInfo.icon;

                return (
                  <Card 
                    key={evento.id} 
                    className={`group bg-card border-2 ${evento.destaque ? 'border-primary shadow-lg shadow-primary/20' : 'border-border/50'} hover:shadow-2xl transition-all duration-300 rounded-3xl overflow-hidden`}
                  >
                    <div className={`h-2 ${categoriaInfo.color}`} />
                    
                    <CardHeader className="p-6 pb-4">
                      <div className="flex items-start justify-between gap-4 mb-3">
                        <div className={`p-3 rounded-2xl ${categoriaInfo.color} bg-opacity-10`}>
                          <IconeCategoria className={`w-6 h-6 ${categoriaInfo.color.replace('bg-', 'text-')}`} />
                        </div>
                        <div className="flex gap-2">
                          <Badge variant="outline" className="bg-background">
                            {categoriaInfo.label}
                          </Badge>
                          {evento.destaque && (
                            <Badge className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white border-none">
                              <Star className="w-3 h-3 mr-1" />
                              Destaque
                            </Badge>
                          )}
                        </div>
                      </div>

                      <CardTitle className="text-xl font-black text-foreground group-hover:text-primary transition-colors leading-tight">
                        {evento.titulo}
                      </CardTitle>
                      <CardDescription className="text-sm text-muted-foreground font-medium mt-2">
                        {evento.descricao}
                      </CardDescription>
                    </CardHeader>

                    <CardContent className="p-6 pt-0 space-y-4">
                      <div className="space-y-3">
                        <div className="flex items-start gap-3">
                          <div className="p-2 bg-muted/30 rounded-xl">
                            <CalendarDays className="w-4 h-4 text-primary" />
                          </div>
                          <div className="flex-1">
                            <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1">Data</p>
                            <p className="text-sm font-bold text-foreground capitalize">{formatarData(evento.data)}</p>
                          </div>
                        </div>

                        <div className="flex items-start gap-3">
                          <div className="p-2 bg-muted/30 rounded-xl">
                            <Clock className="w-4 h-4 text-primary" />
                          </div>
                          <div className="flex-1">
                            <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1">Horário</p>
                            <p className="text-sm font-bold text-foreground">{evento.horario}</p>
                          </div>
                        </div>

                        <div className="flex items-start gap-3">
                          <div className="p-2 bg-muted/30 rounded-xl">
                            <MapPin className="w-4 h-4 text-primary" />
                          </div>
                          <div className="flex-1">
                            <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1">Local</p>
                            <p className="text-sm font-bold text-foreground">{evento.local}</p>
                          </div>
                        </div>

                        <div className="flex items-start gap-3">
                          <div className="p-2 bg-muted/30 rounded-xl">
                            <Users className="w-4 h-4 text-primary" />
                          </div>
                          <div className="flex-1">
                            <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1">Organizador</p>
                            <p className="text-sm font-bold text-foreground">{evento.organizador}</p>
                          </div>
                        </div>

                        {evento.contato && (
                          <div className="pt-3 border-t border-border/50">
                            <p className="text-xs font-medium text-muted-foreground">
                              Contato: <span className="text-foreground font-bold">{evento.contato}</span>
                            </p>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </section>

        {/* Informações Adicionais */}
        <section className="container mx-auto px-4 py-12">
          <Card className="bg-gradient-to-br from-indigo-600 to-purple-600 text-white rounded-3xl border-none overflow-hidden shadow-2xl">
            <div className="absolute top-0 right-0 p-8 opacity-10">
              <Sparkles className="w-40 h-40" />
            </div>
            <CardContent className="p-10 relative z-10">
              <div className="max-w-3xl">
                <div className="flex items-center gap-4 mb-6">
                  <Info className="w-8 h-8" />
                  <h2 className="text-3xl font-black">Informações Importantes</h2>
                </div>
                
                <div className="space-y-4 text-white/90 font-medium leading-relaxed">
                  <p>
                    📅 Esta agenda é atualizada semanalmente com eventos confirmados pela Prefeitura Municipal,
                    organizações religiosas, esportivas e culturais de Guaíra.
                  </p>
                  <p>
                    🔔 Para divulgar seu evento nesta agenda, entre em contato com a Secretaria de Cultura
                    e Turismo através do telefone <span className="font-bold">(17) 3331-9600</span>.
                  </p>
                  <p>
                    🌐 Eventos oficiais da prefeitura são publicados no portal oficial:{" "}
                    <a 
                      href="https://www.guaira.sp.gov.br" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="font-bold underline hover:text-white transition-colors inline-flex items-center gap-1"
                    >
                      www.guaira.sp.gov.br
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>
      </main>

      <Footer />
    </div>
  );
}
