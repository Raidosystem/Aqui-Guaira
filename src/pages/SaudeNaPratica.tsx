import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Phone, MapPin, Clock, AlertCircle, Building2, Stethoscope, Ambulance, ArrowLeft, Home, HeartPulse, Activity, Zap, Navigation, ExternalLink, ShieldCheck, Sparkles, Calendar, MessageSquare, Users, Star, Pill, Hospital, Siren, Mail, Globe, Instagram, Facebook, FolderHeart, Upload, FileText, Trash2, X, LogIn, Eye, Download, Loader2, Lock, Plus, FileCheck, ClipboardList, Receipt, FileWarning } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { LoginDialog } from "@/components/LoginDialog";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
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
  email?: string;
  site?: string;
  redes_sociais?: {
    instagram?: string;
    facebook?: string;
  };
  direcao?: {
    diretor?: string;
    vice_diretor?: string;
  };
}

interface DocumentoSaude {
  id: string;
  nome: string;
  tipo: string;
  url: string;
  tamanho: string;
  criado_em: string;
}

const tiposDocumento = [
  { value: "atestado", label: "Atestado Médico", icon: "📋", color: "bg-blue-500" },
  { value: "receita", label: "Receita Médica", icon: "💊", color: "bg-green-500" },
  { value: "encaminhamento", label: "Encaminhamento", icon: "📨", color: "bg-purple-500" },
  { value: "exame", label: "Resultado de Exame", icon: "🔬", color: "bg-amber-500" },
  { value: "laudo", label: "Laudo Médico", icon: "📄", color: "bg-red-500" },
  { value: "cartao_sus", label: "Cartão SUS", icon: "🏥", color: "bg-cyan-500" },
  { value: "vacina", label: "Cartão de Vacina", icon: "💉", color: "bg-teal-500" },
  { value: "outros", label: "Outros", icon: "📎", color: "bg-gray-500" },
];

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

  // Documentos de Saúde
  const { user } = useAuth();
  const [showLogin, setShowLogin] = useState(false);
  const [showDocumentos, setShowDocumentos] = useState(false);
  const [documentos, setDocumentos] = useState<DocumentoSaude[]>([]);
  const [loadingDocs, setLoadingDocs] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [tipoDoc, setTipoDoc] = useState("atestado");
  const [nomeDoc, setNomeDoc] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (user && showDocumentos) {
      carregarDocumentos();
    }
  }, [user, showDocumentos]);

  const carregarDocumentos = async () => {
    if (!user) return;
    setLoadingDocs(true);
    try {
      const { data, error } = await supabase
        .from('documentos_saude')
        .select('*')
        .eq('user_id', user.id)
        .order('criado_em', { ascending: false });
      if (data) setDocumentos(data as DocumentoSaude[]);
    } catch (e) {
      console.log('Tabela documentos_saude ainda não existe');
    }
    setLoadingDocs(false);
  };

  const handleUploadDoc = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    if (file.size > 10 * 1024 * 1024) {
      toast.error("Arquivo muito grande. Máximo 10MB");
      return;
    }

    const nomeArquivo = nomeDoc.trim() || file.name.replace(/\.[^.]+$/, '');
    setUploading(true);
    try {
      const fileName = `documentos-saude/${user.id}/${Date.now()}-${file.name}`;
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('imagens')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage.from('imagens').getPublicUrl(fileName);

      const tamanhoFormatado = file.size < 1024 * 1024
        ? `${(file.size / 1024).toFixed(0)} KB`
        : `${(file.size / (1024 * 1024)).toFixed(1)} MB`;

      const { error } = await supabase.from('documentos_saude').insert({
        user_id: user.id,
        nome: nomeArquivo,
        tipo: tipoDoc,
        url: publicUrl,
        tamanho: tamanhoFormatado,
      });

      if (error) throw error;

      toast.success("Documento salvo com sucesso! 📄", {
        description: `${nomeArquivo} foi adicionado aos seus documentos.`
      });
      setNomeDoc("");
      setTipoDoc("atestado");
      carregarDocumentos();
    } catch (error: any) {
      console.error(error);
      toast.error("Erro ao salvar documento", {
        description: error?.message || "Tente novamente"
      });
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleExcluirDoc = async (doc: DocumentoSaude) => {
    if (!confirm(`Excluir "${doc.nome}"?`)) return;
    try {
      await supabase.from('documentos_saude').delete().eq('id', doc.id);
      toast.success('Documento excluído');
      carregarDocumentos();
    } catch (e) {
      toast.error('Erro ao excluir');
    }
  };

  const getTipoDocConfig = (tipo: string) => {
    return tiposDocumento.find(t => t.value === tipo) || tiposDocumento[tiposDocumento.length - 1];
  };

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

              {/* Botão Meus Documentos - Canto Direito Superior */}
              <Button
                onClick={() => {
                  if (!user) {
                    setShowLogin(true);
                  } else {
                    setShowDocumentos(true);
                  }
                }}
                className={`gap-2.5 rounded-2xl px-6 py-6 font-bold text-sm shadow-lg transition-all ${
                  user 
                    ? 'bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white shadow-emerald-500/25 hover:shadow-emerald-500/40' 
                    : 'bg-gradient-to-r from-slate-600 to-slate-700 hover:from-slate-700 hover:to-slate-800 text-white shadow-slate-500/20'
                }`}
              >
                {user ? (
                  <>
                    <FolderHeart className="w-5 h-5" />
                    <span className="hidden sm:inline">Meus Documentos</span>
                    <span className="sm:hidden">Docs</span>
                    {documentos.length > 0 && (
                      <Badge className="bg-white/20 text-white border-none text-xs font-black ml-1">
                        {documentos.length}
                      </Badge>
                    )}
                  </>
                ) : (
                  <>
                    <Lock className="w-5 h-5" />
                    <span className="hidden sm:inline">Meus Documentos</span>
                    <span className="sm:hidden">Docs</span>
                  </>
                )}
              </Button>
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

                          {/* Campos extras para APAE */}
                          {unidade.email && (
                            <div className="flex items-center gap-3 pt-2">
                              <div className="p-2 bg-purple-500/10 rounded-xl">
                                <Mail className="w-4 h-4 text-purple-600" />
                              </div>
                              <a 
                                href={`mailto:${unidade.email}`} 
                                className="text-sm font-medium text-foreground hover:text-purple-500 transition-colors truncate"
                              >
                                {unidade.email}
                              </a>
                            </div>
                          )}

                          {unidade.site && (
                            <div className="flex items-center gap-3">
                              <div className="p-2 bg-blue-500/10 rounded-xl">
                                <Globe className="w-4 h-4 text-blue-600" />
                              </div>
                              <a 
                                href={`https://${unidade.site}`} 
                                target="_blank" 
                                rel="noopener noreferrer" 
                                className="text-sm font-medium text-foreground hover:text-blue-500 transition-colors truncate"
                              >
                                {unidade.site}
                              </a>
                            </div>
                          )}

                          {unidade.redes_sociais && (
                            <div className="flex gap-2 pt-2">
                              {unidade.redes_sociais.instagram && (
                                <a 
                                  href={unidade.redes_sociais.instagram} 
                                  target="_blank" 
                                  rel="noopener noreferrer"
                                  className="p-2 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl hover:scale-110 transition-transform"
                                >
                                  <Instagram className="w-4 h-4 text-white" />
                                </a>
                              )}
                              {unidade.redes_sociais.facebook && (
                                <a 
                                  href={unidade.redes_sociais.facebook} 
                                  target="_blank" 
                                  rel="noopener noreferrer"
                                  className="p-2 bg-blue-600 rounded-xl hover:scale-110 transition-transform"
                                >
                                  <Facebook className="w-4 h-4 text-white" />
                                </a>
                              )}
                            </div>
                          )}

                          {unidade.direcao && (
                            <div className="space-y-1 pt-2 border-t border-border/30 mt-2">
                              <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Direção</p>
                              {unidade.direcao.diretor && (
                                <p className="text-xs font-medium text-foreground">
                                  <span className="font-bold">Diretor:</span> {unidade.direcao.diretor}
                                </p>
                              )}
                              {unidade.direcao.vice_diretor && (
                                <p className="text-xs font-medium text-foreground">
                                  <span className="font-bold">Vice:</span> {unidade.direcao.vice_diretor}
                                </p>
                              )}
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

      {/* Dialog de Meus Documentos de Saúde */}
      <Dialog open={showDocumentos} onOpenChange={setShowDocumentos}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl p-0">
          <div className="bg-gradient-to-br from-emerald-500 to-teal-500 p-8 rounded-t-3xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-3 text-2xl font-black text-white">
                <div className="p-2.5 bg-white/20 rounded-xl backdrop-blur-sm">
                  <FolderHeart className="w-7 h-7 text-white" />
                </div>
                Meus Documentos de Saúde
              </DialogTitle>
              <DialogDescription className="text-white/80 font-medium text-base mt-2">
                Guarde atestados, receitas, exames e encaminhamentos em um só lugar. Só você tem acesso.
              </DialogDescription>
            </DialogHeader>
          </div>

          <div className="p-6 space-y-6">
            {/* Formulário de Upload */}
            <Card className="bg-muted/30 border-2 border-dashed border-border/50 rounded-2xl p-6">
              <div className="space-y-4">
                <h3 className="font-black text-foreground flex items-center gap-2">
                  <Plus className="w-5 h-5 text-emerald-500" />
                  Adicionar Documento
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="font-bold text-xs text-muted-foreground uppercase tracking-widest">Tipo do Documento</Label>
                    <Select value={tipoDoc} onValueChange={setTipoDoc}>
                      <SelectTrigger className="py-5 rounded-xl border-2 font-medium">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="rounded-xl">
                        {tiposDocumento.map(t => (
                          <SelectItem key={t.value} value={t.value} className="py-2.5">
                            {t.icon} {t.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label className="font-bold text-xs text-muted-foreground uppercase tracking-widest">Nome (opcional)</Label>
                    <Input
                      value={nomeDoc}
                      onChange={(e) => setNomeDoc(e.target.value)}
                      placeholder="Ex: Atestado Dr. Silva"
                      className="py-5 rounded-xl border-2 font-medium"
                    />
                  </div>
                </div>

                <Button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                  className="w-full py-6 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-base gap-3"
                >
                  {uploading ? (
                    <><Loader2 className="w-5 h-5 animate-spin" /> Enviando...</>
                  ) : (
                    <><Upload className="w-5 h-5" /> Escolher Arquivo (PDF, Imagem — até 10MB)</>
                  )}
                </Button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*,.pdf,.doc,.docx"
                  onChange={handleUploadDoc}
                  className="hidden"
                />
              </div>
            </Card>

            {/* Lista de Documentos */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-black text-foreground flex items-center gap-2">
                  <FileCheck className="w-5 h-5 text-emerald-500" />
                  Documentos Salvos
                </h3>
                <Badge className="bg-emerald-500/10 text-emerald-600 border-none font-bold">
                  {documentos.length} arquivo{documentos.length !== 1 ? 's' : ''}
                </Badge>
              </div>

              {loadingDocs ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
                </div>
              ) : documentos.length === 0 ? (
                <div className="text-center py-12 bg-muted/20 rounded-2xl border-2 border-dashed border-border/30">
                  <FolderHeart className="w-16 h-16 text-muted-foreground/20 mx-auto mb-4" />
                  <p className="text-lg font-black text-foreground">Nenhum documento salvo</p>
                  <p className="text-sm text-muted-foreground font-medium mt-1">Envie seu primeiro documento usando o formulário acima</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {documentos.map((doc) => {
                    const tipoConfig = getTipoDocConfig(doc.tipo);
                    return (
                      <Card key={doc.id} className="group bg-card border border-border/50 hover:border-emerald-500/30 rounded-2xl p-4 transition-all hover:shadow-md">
                        <div className="flex items-center gap-4">
                          <div className={`p-3 ${tipoConfig.color} bg-opacity-10 rounded-xl flex-shrink-0`}>
                            <span className="text-2xl">{tipoConfig.icon}</span>
                          </div>

                          <div className="flex-grow min-w-0">
                            <p className="font-black text-foreground truncate">{doc.nome}</p>
                            <div className="flex items-center gap-3 mt-1">
                              <Badge variant="secondary" className="bg-muted/50 text-muted-foreground font-bold text-[10px]">
                                {tipoConfig.label}
                              </Badge>
                              <span className="text-[10px] font-bold text-muted-foreground">
                                {doc.tamanho}
                              </span>
                              <span className="text-[10px] font-bold text-muted-foreground">
                                {new Date(doc.criado_em).toLocaleDateString('pt-BR')}
                              </span>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 flex-shrink-0">
                            <Button
                              size="icon"
                              variant="ghost"
                              className="rounded-xl hover:bg-emerald-500/10 hover:text-emerald-600"
                              onClick={() => window.open(doc.url, '_blank')}
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                            <Button
                              size="icon"
                              variant="ghost"
                              className="rounded-xl hover:bg-red-500/10 hover:text-red-600"
                              onClick={() => handleExcluirDoc(doc)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </Card>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Aviso de Privacidade */}
            <div className="flex items-start gap-3 bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-2xl p-4">
              <Lock className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-bold text-blue-700 dark:text-blue-400">Seus documentos são privados</p>
                <p className="text-xs text-blue-600/70 dark:text-blue-400/60 mt-1">Somente você tem acesso a estes arquivos. Ninguém mais pode visualizá-los.</p>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Login Dialog */}
      {showLogin && (
        <LoginDialog
          open={showLogin}
          onOpenChange={setShowLogin}
          onLoginSuccess={() => {
            setShowLogin(false);
            toast.success("Login realizado! 🎉", {
              description: "Agora você pode acessar seus documentos de saúde."
            });
            setTimeout(() => setShowDocumentos(true), 500);
          }}
        />
      )}
    </div>
  );
}
