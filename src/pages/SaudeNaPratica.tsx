import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Phone, MapPin, Clock, AlertCircle, Building2, Stethoscope, Ambulance, ArrowLeft, Home, HeartPulse, Activity, Zap, Navigation, ExternalLink, ShieldCheck, Sparkles, Calendar, MessageSquare, Users, Star, Pill, Hospital, Siren } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import saudeData from "@/data/saude-guaira.json";

interface UnidadeSaude {
  nome: string;
  tipo: string;
  categoria: string;
  endereco: string;
  bairro: string;
  telefones: string[];
  whatsapp: string[];
  horario: string;
  servicos: string[];
}

const emergencias = [
  { nome: "SAMU", telefone: "192", descricao: "Serviço Móvel de Urgência", color: "bg-red-600" },
  { nome: "Bombeiros", telefone: "193", descricao: "Corpo de Bombeiros", color: "bg-red-500" },
  { nome: "Polícia", telefone: "190", descricao: "Polícia Militar", color: "bg-blue-600" },
  { nome: "D. Civil", telefone: "199", descricao: "Defesa Civil", color: "bg-orange-600" },
];

export default function SaudeNaPratica() {
  const navigate = useNavigate();
  const [filtroCategoria, setFiltroCategoria] = useState<string>('todas');
  const [busca, setBusca] = useState("");

  const unidades = saudeData.unidades as UnidadeSaude[];

  const getIconeCategoria = (categoria: string) => {
    switch (categoria) {
      case 'emergencia': return Ambulance;
      case 'atencao_basica': return Building2;
      case 'especialidades': return Stethoscope;
      case 'apoio': return Activity;
      case 'assistencia_social': return Users;
      default: return Hospital;
    }
  };

  const getCorCategoria = (categoria: string) => {
    switch (categoria) {
      case 'emergencia': return 'bg-red-500';
      case 'atencao_basica': return 'bg-blue-500';
      case 'especialidades': return 'bg-purple-500';
      case 'apoio': return 'bg-green-500';
      case 'assistencia_social': return 'bg-orange-500';
      default: return 'bg-gray-500';
    }
  };

  const unidadesFiltradas = unidades.filter(unidade => {
    const passaCategoria = filtroCategoria === 'todas' || unidade.categoria === filtroCategoria;
    const passaBusca = busca === "" || 
      unidade.nome.toLowerCase().includes(busca.toLowerCase()) || 
      unidade.bairro.toLowerCase().includes(busca.toLowerCase()) ||
      unidade.tipo.toLowerCase().includes(busca.toLowerCase());
    return passaCategoria && passaBusca;
  });

  const totalUnidades = unidades.length;
  const totalEmergencia = unidades.filter(u => u.categoria === 'emergencia').length;
  const totalAtencaoBasica = unidades.filter(u => u.categoria === 'atencao_basica').length;
  const totalEspecialidades = unidades.filter(u => u.categoria === 'especialidades').length;
  const totalApoio = unidades.filter(u => u.categoria === 'apoio').length;
  const totalAssistenciaSocial = unidades.filter(u => u.categoria === 'assistencia_social').length;

  const handleLigar = (telefone: string) => {
    window.location.href = `tel:${telefone.replace(/\D/g, '')}`;
  };

  const handleWhatsApp = (whatsapp: string) => {
    const numero = whatsapp.replace(/\D/g, '');
    window.open(`https://wa.me/55${numero}`, '_blank');
  };

  const handleVerMapa = (endereco: string, bairro: string) => {
    const query = encodeURIComponent(`${endereco}, ${bairro}, Guaíra - SP`);
    window.open(`https://www.google.com/maps/search/?api=1&query=${query}`, '_blank');
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />

      <main className="flex-grow">
        {/* Premium Hero Section */}
        <section className="relative pt-12 pb-20 overflow-hidden bg-background">
          <div className="absolute top-0 right-0 -mr-24 -mt-24 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[100px]" />
          <div className="absolute bottom-0 left-0 -ml-24 -mb-24 w-[400px] h-[400px] bg-primary/5 rounded-full blur-[100px]" />

          <div className="container mx-auto px-4 relative z-10">
            {/* Navegação */}
            <div className="flex flex-wrap items-center justify-between gap-4 mb-10">
              <div className="flex gap-2">
                <Button
                  onClick={() => navigate(-1)}
                  className="gap-2 bg-green-500 hover:bg-green-600 text-white rounded-lg px-6"
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

            </div>

            <div className="max-w-4xl mx-auto text-center space-y-6">
              <div className="inline-flex p-3 bg-primary/10 rounded-2xl mb-2">
                <HeartPulse className="w-8 h-8 text-primary" />
              </div>
              <h1 className="text-4xl md:text-6xl font-black tracking-tight text-foreground leading-[1.1]">
                Saúde na <br />
                <span className="gradient-text">Prática em Guaíra</span>
              </h1>
              <p className="text-lg md:text-xl text-muted-foreground font-medium max-w-2xl mx-auto">
                Guia completo de unidades de saúde, hospitais e serviços de emergência do município de Guaíra-SP.
              </p>

              {/* Cards Clicáveis - Estatísticas */}
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 max-w-6xl mx-auto mt-8">
                {[
                  { label: "Todas", value: totalUnidades, color: "bg-cyan-100", textColor: "text-cyan-600", icon: Hospital, categoria: 'todas' },
                  { label: "Emergência", value: totalEmergencia, color: "bg-red-100", textColor: "text-red-600", icon: Siren, categoria: 'emergencia' },
                  { label: "UBS/USF", value: totalAtencaoBasica, color: "bg-blue-100", textColor: "text-blue-600", icon: Building2, categoria: 'atencao_basica' },
                  { label: "Especialidades", value: totalEspecialidades, color: "bg-purple-100", textColor: "text-purple-600", icon: Stethoscope, categoria: 'especialidades' },
                  { label: "Apoio", value: totalApoio, color: "bg-green-100", textColor: "text-green-600", icon: Activity, categoria: 'apoio' },
                  { label: "CRAS", value: totalAssistenciaSocial, color: "bg-orange-100", textColor: "text-orange-600", icon: Users, categoria: 'assistencia_social' }
                ].map((stat, i) => (
                  <button
                    key={i}
                    onClick={() => setFiltroCategoria(stat.categoria)}
                    className={`bg-card p-4 rounded-[2rem] border shadow-sm transition-all hover:shadow-xl hover:scale-105 cursor-pointer ${
                      filtroCategoria === stat.categoria 
                        ? 'border-primary ring-2 ring-primary ring-offset-2' 
                        : 'border-border/50'
                    }`}
                  >
                    <div className={`w-10 h-10 ${stat.color} ${stat.textColor} rounded-xl flex items-center justify-center mx-auto mb-2`}>
                      <stat.icon className="w-5 h-5" />
                    </div>
                    <p className="text-2xl font-black text-foreground">{stat.value}</p>
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{stat.label}</p>
                    {filtroCategoria === stat.categoria && (
                      <div className="mt-2">
                        <Star className="w-4 h-4 text-primary mx-auto animate-pulse" />
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Filtro de Busca */}
        <section className="container mx-auto px-4 py-8">
          <Card className="bg-card border border-border/50 shadow-xl rounded-[2.5rem] p-8 -mt-10 mb-8 relative z-20">
            <div className="space-y-3">
              <Label className="font-black text-xs text-muted-foreground uppercase tracking-widest pl-1 flex items-center gap-2">
                <Activity className="w-3.5 h-3.5" /> Buscar Unidade de Saúde
              </Label>
              <Input
                placeholder="Nome da unidade, bairro ou tipo..."
                className="py-6 rounded-2xl border-border/50 focus:border-primary transition-all font-medium bg-muted/10 text-foreground placeholder:text-muted-foreground"
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
              />
            </div>
          </Card>
        </section>

        {/* Emergências - Banner Fixo */}
        <section className="container mx-auto px-4 pb-8">
          <Card className="bg-gradient-to-br from-red-600 to-red-500 text-white border-none rounded-[2rem] overflow-hidden shadow-xl">
            <CardHeader className="pb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white/20 rounded-xl">
                  <Ambulance className="w-6 h-6 text-white" />
                </div>
                <div>
                  <CardTitle className="text-white font-black">Telefones de Emergência</CardTitle>
                  <CardDescription className="text-white/80 font-medium">Ligue imediatamente em casos de urgência</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {emergencias.map((item) => (
                  <Button
                    key={item.telefone}
                    onClick={() => handleLigar(item.telefone)}
                    variant="outline"
                    className="flex flex-col h-auto py-5 bg-white/10 border-2 border-white/20 hover:bg-white/20 hover:border-white/40 rounded-xl transition-colors backdrop-blur-sm text-white hover:text-white"
                  >
                    <span className="text-3xl font-black">{item.telefone}</span>
                    <span className="text-xs font-bold uppercase tracking-tighter mt-1">{item.nome}</span>
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Lista de Unidades */}
        <section className="container mx-auto px-4 py-8">
          <div className="space-y-8">
            <div className="flex items-center justify-between border-b border-border/50 pb-6">
              <h2 className="text-2xl font-black text-foreground">
                Unidades de <span className="text-primary">Saúde</span>
              </h2>
              <Badge variant="secondary" className="bg-primary/10 text-primary font-bold">
                {unidadesFiltradas.length} resultados
              </Badge>
            </div>

            {unidadesFiltradas.length === 0 ? (
              <div className="py-24 text-center bg-muted/20 rounded-[2.5rem] border-2 border-dashed border-border/50 flex flex-col items-center gap-4">
                <HeartPulse className="w-20 h-20 text-muted-foreground/30" />
                <div className="space-y-2">
                  <h3 className="text-2xl font-black text-foreground">Nenhuma unidade encontrada</h3>
                  <p className="text-muted-foreground font-medium">Tente ajustar seus filtros para encontrar a unidade desejada.</p>
                </div>
                <Button 
                  variant="link" 
                  onClick={() => { setBusca(""); setFiltroCategoria("todas"); }} 
                  className="text-primary font-bold"
                >
                  Limpar Filtros
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {unidadesFiltradas.map((unidade, idx) => {
                  const Icone = getIconeCategoria(unidade.categoria);
                  const cor = getCorCategoria(unidade.categoria);

                  return (
                    <Card key={idx} className="group bg-card border border-border/50 shadow-lg hover:shadow-2xl transition-all duration-500 rounded-[2.5rem] overflow-hidden p-0 flex flex-col">
                      <div className={`h-3 ${cor} w-full`} />
                      <CardHeader className="p-6 pb-4">
                        <div className="flex items-start justify-between gap-4 mb-3">
                          <div className={`p-3 rounded-2xl ${cor} bg-opacity-10`}>
                            <Icone className={`w-6 h-6 ${cor.replace('bg-', 'text-')}`} />
                          </div>
                          {unidade.categoria === 'emergencia' && (
                            <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200 font-bold text-[10px] animate-pulse">
                              24H
                            </Badge>
                          )}
                        </div>
                        <div className="space-y-2">
                          <p className={`text-[10px] font-black ${cor.replace('bg-', 'text-')} uppercase tracking-widest`}>
                            {unidade.tipo}
                          </p>
                          <CardTitle className="text-lg font-black text-foreground group-hover:text-primary transition-colors leading-tight">
                            {unidade.nome}
                          </CardTitle>
                        </div>
                      </CardHeader>

                      <CardContent className="p-6 pt-0 flex-grow flex flex-col gap-6">
                        <div className="space-y-4">
                          <div className="flex items-start gap-3">
                            <div className="p-2 bg-muted/20 rounded-xl">
                              <MapPin className="w-4 h-4 text-primary" />
                            </div>
                            <div className="text-sm flex-1">
                              <p className="font-bold text-foreground leading-tight">{unidade.endereco}</p>
                              <p className="text-xs text-muted-foreground font-medium">{unidade.bairro}</p>
                            </div>
                          </div>

                          <div className="flex items-start gap-3">
                            <div className="p-2 bg-muted/20 rounded-xl">
                              <Clock className="w-4 h-4 text-primary" />
                            </div>
                            <p className="text-sm font-medium text-foreground">{unidade.horario}</p>
                          </div>

                          <div className="space-y-2">
                            {unidade.telefones.map((tel, i) => (
                              <div key={i} className="flex items-center gap-3">
                                <div className="p-2 bg-blue-500/10 rounded-xl">
                                  <Phone className="w-4 h-4 text-blue-600" />
                                </div>
                                <a 
                                  href={`tel:${tel.replace(/\D/g, '')}`} 
                                  className="text-sm font-bold text-foreground hover:text-blue-500 transition-colors"
                                >
                                  {tel}
                                </a>
                              </div>
                            ))}
                            {unidade.whatsapp.map((whats, i) => (
                              <div key={i} className="flex items-center gap-3">
                                <div className="p-2 bg-green-500/10 rounded-xl">
                                  <MessageSquare className="w-4 h-4 text-green-600" />
                                </div>
                                <a 
                                  href={`https://wa.me/55${whats.replace(/\D/g, '')}`} 
                                  target="_blank" 
                                  rel="noopener noreferrer" 
                                  className="text-sm font-bold text-foreground hover:text-green-500 transition-colors"
                                >
                                  WhatsApp: {whats}
                                </a>
                              </div>
                            ))}
                          </div>

                          {unidade.servicos.length > 0 && (
                            <div className="space-y-2 pt-2">
                              <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Serviços</p>
                              <div className="flex flex-wrap gap-1.5">
                                {unidade.servicos.slice(0, 3).map((servico, idx) => (
                                  <Badge key={idx} variant="secondary" className="bg-muted/30 text-foreground font-medium text-[10px] py-1">
                                    {servico}
                                  </Badge>
                                ))}
                                {unidade.servicos.length > 3 && (
                                  <Badge variant="outline" className="text-[10px] font-bold text-primary border-primary/30">
                                    +{unidade.servicos.length - 3}
                                  </Badge>
                                )}
                              </div>
                            </div>
                          )}
                        </div>

                        <div className="mt-auto pt-4 border-t border-border/50">
                          <Button
                            className="w-full rounded-2xl py-5 font-bold bg-card text-foreground border-2 border-border/50 hover:border-primary/50 hover:bg-muted/30 hover:text-primary transition-all uppercase text-[10px] tracking-widest shadow-none"
                            onClick={() => handleVerMapa(unidade.endereco, unidade.bairro)}
                          >
                            <MapPin className="w-3.5 h-3.5 mr-2" /> Ver no Mapa
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </div>
        </section>

        {/* Informações Importantes */}
        <section className="container mx-auto px-4 py-12">
          <Card className="bg-gradient-to-br from-blue-600 to-green-600 text-white rounded-[2.5rem] border-none overflow-hidden shadow-2xl relative">
            <div className="absolute top-0 right-0 p-8 opacity-10">
              <Sparkles className="w-32 h-32" />
            </div>
            <CardHeader className="p-10 pb-4 relative z-10">
              <CardTitle className="text-3xl font-black">Informações Importantes</CardTitle>
            </CardHeader>
            <CardContent className="p-10 pt-0 grid md:grid-cols-3 gap-8 relative z-10">
              {[
                { title: "Documentos", text: "Cartão SUS, RG, CPF e comprovante de residência atualizado.", icon: ShieldCheck },
                { title: "Agendamento", text: "Procure a UBS/USF mais próxima para marcar consultas e exames.", icon: Calendar },
                { title: "Medicamentos", text: "Farmácia Municipal com dispensação mediante prescrição médica.", icon: Pill }
              ].map((info, i) => (
                <div key={i} className="bg-white/10 backdrop-blur-sm p-6 rounded-3xl border border-white/20">
                  <info.icon className="w-10 h-10 mb-4 text-white" />
                  <h3 className="font-black text-xl mb-2">{info.title}</h3>
                  <p className="text-sm font-medium text-white/80 leading-relaxed">{info.text}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        </section>
      </main>

      <Footer />
    </div>
  );
}
