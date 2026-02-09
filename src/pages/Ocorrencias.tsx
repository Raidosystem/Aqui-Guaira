import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, PlusCircle, MapPin, Calendar, Phone, AlertTriangle, ArrowLeft, Home, Loader2, X, ImagePlus, User, Tag, Clock, CheckCircle, XCircle, ShieldAlert, Zap, Droplets, TreePine, Car, Volume2, Trash2, Construction, HelpCircle } from "lucide-react";
import { toast } from "sonner";
import { LoginDialog } from "@/components/LoginDialog";
import { getUsuarioLogado } from "@/lib/supabase";
import { supabase } from "@/lib/supabase";

interface Ocorrencia {
  id: string;
  titulo: string;
  descricao: string;
  categoria: string;
  tipo: string;
  status: "aberto" | "em_andamento" | "resolvido";
  bairro: string;
  local_referencia?: string;
  data_ocorrencia: string;
  telefone_contato: string;
  nome_contato: string;
  imagem?: string;
  user_id: string;
  criado_em: string;
  users?: {
    nome: string;
  };
}

const categorias = [
  { value: "buraco_rua", label: "Buraco na Rua", icon: "🕳️" },
  { value: "iluminacao", label: "Iluminação Pública", icon: "💡" },
  { value: "agua_esgoto", label: "Água / Esgoto", icon: "💧" },
  { value: "lixo_entulho", label: "Lixo / Entulho", icon: "🗑️" },
  { value: "arvore_mato", label: "Árvore / Mato Alto", icon: "🌳" },
  { value: "transito", label: "Trânsito / Sinalização", icon: "🚗" },
  { value: "barulho", label: "Barulho / Perturbação", icon: "🔊" },
  { value: "animal_solto", label: "Animal Solto", icon: "🐕" },
  { value: "calcada", label: "Calçada Danificada", icon: "🚧" },
  { value: "dengue", label: "Foco de Dengue", icon: "🦟" },
  { value: "seguranca", label: "Segurança Pública", icon: "🛡️" },
  { value: "outros", label: "Outros", icon: "❓" },
];

const tiposOcorrencia = [
  { value: "reclamacao", label: "Reclamação", color: "bg-red-500" },
  { value: "sugestao", label: "Sugestão", color: "bg-blue-500" },
  { value: "elogio", label: "Elogio", color: "bg-green-500" },
  { value: "denuncia", label: "Denúncia", color: "bg-amber-500" },
];

export default function Ocorrencias() {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [ocorrencias, setOcorrencias] = useState<Ocorrencia[]>([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Filtros
  const [busca, setBusca] = useState("");
  const [filtroTipo, setFiltroTipo] = useState<string>("todos");
  const [filtroCategoria, setFiltroCategoria] = useState<string>("todas");
  const [filtroStatus, setFiltroStatus] = useState<string>("aberto");

  // Formulário
  const [titulo, setTitulo] = useState("");
  const [descricao, setDescricao] = useState("");
  const [categoria, setCategoria] = useState("");
  const [tipo, setTipo] = useState("reclamacao");
  const [bairro, setBairro] = useState("");
  const [localReferencia, setLocalReferencia] = useState("");
  const [dataOcorrencia, setDataOcorrencia] = useState("");
  const [telefoneContato, setTelefoneContato] = useState("");
  const [nomeContato, setNomeContato] = useState("");
  const [imagemFile, setImagemFile] = useState<File | null>(null);
  const [imagemPreview, setImagemPreview] = useState<string>("");
  const [showLogin, setShowLogin] = useState(false);

  useEffect(() => {
    carregarUsuario();
    carregarOcorrencias();
  }, []);

  const carregarUsuario = () => {
    const usuarioLogado = getUsuarioLogado();
    setUser(usuarioLogado);
  };

  const carregarOcorrencias = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('ocorrencias')
        .select('*, users(nome)')
        .order('criado_em', { ascending: false });

      if (data) setOcorrencias(data as Ocorrencia[]);
    } catch (e) {
      console.log("Tabela ocorrencias ainda não existe ou está vazia");
    }
    setLoading(false);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error("Imagem muito grande. Máximo 5MB");
        return;
      }
      setImagemFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setImagemPreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const limparFormulario = () => {
    setTitulo("");
    setDescricao("");
    setCategoria("");
    setTipo("reclamacao");
    setBairro("");
    setLocalReferencia("");
    setDataOcorrencia("");
    setTelefoneContato("");
    setNomeContato("");
    setImagemFile(null);
    setImagemPreview("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      setShowLogin(true);
      return;
    }

    if (!titulo || !descricao || !categoria || !bairro || !dataOcorrencia || !telefoneContato || !nomeContato) {
      toast.error("Preencha todos os campos obrigatórios");
      return;
    }

    setSubmitting(true);
    try {
      let imagemUrl = "";

      if (imagemFile) {
        const fileName = `ocorrencias/${Date.now()}-${imagemFile.name}`;
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('imagens')
          .upload(fileName, imagemFile);

        if (!uploadError && uploadData) {
          const { data: { publicUrl } } = supabase.storage.from('imagens').getPublicUrl(fileName);
          imagemUrl = publicUrl;
        }
      }

      const { error } = await supabase.from('ocorrencias').insert({
        titulo,
        descricao,
        categoria,
        tipo,
        bairro,
        local_referencia: localReferencia || null,
        data_ocorrencia: dataOcorrencia,
        telefone_contato: telefoneContato,
        nome_contato: nomeContato,
        imagem: imagemUrl || null,
        user_id: user.id,
        status: 'aberto'
      });

      if (error) throw error;

      toast.success("Ocorrência registrada com sucesso!", {
        description: "Sua ocorrência será analisada pela administração."
      });
      limparFormulario();
      setOpenDialog(false);
      carregarOcorrencias();
    } catch (error: any) {
      console.error(error);
      toast.error("Erro ao registrar ocorrência", {
        description: error?.message || "Tente novamente mais tarde"
      });
    } finally {
      setSubmitting(false);
    }
  };

  const ocorrenciasFiltradas = ocorrencias.filter(item => {
    const matchBusca = item.titulo.toLowerCase().includes(busca.toLowerCase()) ||
      item.descricao.toLowerCase().includes(busca.toLowerCase()) ||
      item.bairro.toLowerCase().includes(busca.toLowerCase());
    const matchTipo = filtroTipo === "todos" || item.tipo === filtroTipo;
    const matchCategoria = filtroCategoria === "todas" || item.categoria === filtroCategoria;
    const matchStatus = filtroStatus === "todos" || item.status === filtroStatus;

    return matchBusca && matchTipo && matchCategoria && matchStatus;
  });

  const formatarData = (data: string) => {
    return new Date(data).toLocaleDateString('pt-BR');
  };

  const getCategoriaLabel = (value: string) => {
    return categorias.find(c => c.value === value)?.label || value;
  };

  const getCategoriaIcon = (value: string) => {
    return categorias.find(c => c.value === value)?.icon || "❓";
  };

  const getTipoLabel = (value: string) => {
    return tiposOcorrencia.find(t => t.value === value)?.label || value;
  };

  const getTipoColor = (value: string) => {
    return tiposOcorrencia.find(t => t.value === value)?.color || "bg-gray-500";
  };

  const getStatusConfig = (status: string) => {
    switch (status) {
      case "aberto": return { label: "Aberto", color: "bg-red-500", icon: AlertTriangle };
      case "em_andamento": return { label: "Em Andamento", color: "bg-amber-500", icon: Clock };
      case "resolvido": return { label: "Resolvido", color: "bg-emerald-500", icon: CheckCircle };
      default: return { label: status, color: "bg-gray-500", icon: HelpCircle };
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />

      <main className="flex-grow">
        {/* Premium Hero Section */}
        <section className="relative pt-12 pb-20 overflow-hidden bg-background">
          <div className="absolute top-0 right-0 -mr-24 -mt-24 w-[500px] h-[500px] bg-amber-500/5 rounded-full blur-[100px]" />
          <div className="absolute bottom-0 left-0 -ml-24 -mb-24 w-[400px] h-[400px] bg-amber-500/5 rounded-full blur-[100px]" />

          <div className="container mx-auto px-4 relative z-10">
            {/* Navegação */}
            <div className="flex flex-wrap items-center justify-between gap-4 mb-12">
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

            <div className="max-w-4xl mx-auto text-center space-y-6 mb-12">
              <div className="inline-flex p-3 bg-amber-500/10 rounded-2xl mb-2">
                <AlertTriangle className="w-8 h-8 text-amber-500" />
              </div>
              <h1 className="text-4xl md:text-6xl font-black tracking-tight text-foreground leading-[1.1]">
                Registre sua <br />
                <span className="bg-gradient-to-r from-amber-500 to-orange-500 bg-clip-text text-transparent">Ocorrência</span>
              </h1>
              <p className="text-lg md:text-xl text-muted-foreground font-medium max-w-2xl mx-auto">
                Problemas na rua? Falta de iluminação? Buraco? Registre aqui e ajude a melhorar Guaíra para todos.
              </p>
            </div>

            <div className="flex justify-center">
              <Dialog open={openDialog} onOpenChange={setOpenDialog}>
                <DialogTrigger asChild>
                  <Button 
                    size="lg" 
                    className="rounded-xl px-8 py-7 bg-amber-500 hover:bg-amber-600 text-white text-lg font-bold gap-2"
                    onClick={() => {
                      if (!user) {
                        setShowLogin(true);
                        setOpenDialog(false);
                      }
                    }}
                  >
                    <PlusCircle className="w-6 h-6" />
                    Registrar Ocorrência
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl">
                  <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-2xl font-bold">
                      <AlertTriangle className="w-6 h-6 text-amber-500" />
                      Nova Ocorrência
                    </DialogTitle>
                    <DialogDescription className="font-medium">
                      Descreva o problema encontrado para que a comunidade e as autoridades possam agir.
                    </DialogDescription>
                  </DialogHeader>

                  <form onSubmit={handleSubmit} className="space-y-6 mt-4">
                    <div className="space-y-2">
                      <Label className="font-bold">Tipo de Registro *</Label>
                      <Select value={tipo} onValueChange={setTipo}>
                        <SelectTrigger className="py-6 rounded-xl border-2">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="rounded-xl">
                          {tiposOcorrencia.map(t => (
                            <SelectItem key={t.value} value={t.value} className="py-3">
                              <span className="font-bold">{t.label}</span>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label className="font-bold">Título da Ocorrência *</Label>
                        <Input
                          value={titulo}
                          onChange={(e) => setTitulo(e.target.value)}
                          placeholder="Ex: Buraco na Av. Brasil"
                          className="py-6 rounded-xl border-2"
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <Label className="font-bold">Categoria *</Label>
                        <Select value={categoria} onValueChange={setCategoria}>
                          <SelectTrigger className="py-6 rounded-xl border-2">
                            <SelectValue placeholder="Selecione" />
                          </SelectTrigger>
                          <SelectContent className="rounded-xl">
                            {categorias.map(cat => (
                              <SelectItem key={cat.value} value={cat.value} className="py-2.5">
                                {cat.icon} {cat.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label className="font-bold">Descrição Detalhada *</Label>
                      <Textarea
                        value={descricao}
                        onChange={(e) => setDescricao(e.target.value)}
                        placeholder="Descreva o problema com o máximo de detalhes possível..."
                        rows={3}
                        className="rounded-xl border-2 p-4"
                        required
                      />
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label className="font-bold">Bairro *</Label>
                        <Input
                          value={bairro}
                          onChange={(e) => setBairro(e.target.value)}
                          placeholder="Onde está o problema?"
                          className="py-6 rounded-xl border-2"
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <Label className="font-bold">Local / Referência</Label>
                        <Input
                          value={localReferencia}
                          onChange={(e) => setLocalReferencia(e.target.value)}
                          placeholder="Ex: Em frente ao posto Shell"
                          className="py-6 rounded-xl border-2"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label className="font-bold">Data da Ocorrência *</Label>
                      <Input
                        type="date"
                        value={dataOcorrencia}
                        onChange={(e) => setDataOcorrencia(e.target.value)}
                        className="py-6 rounded-xl border-2"
                        required
                      />
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label className="font-bold">Seu Nome *</Label>
                        <Input
                          value={nomeContato}
                          onChange={(e) => setNomeContato(e.target.value)}
                          placeholder="Nome completo"
                          className="py-6 rounded-xl border-2"
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <Label className="font-bold">Telefone/WhatsApp *</Label>
                        <Input
                          value={telefoneContato}
                          onChange={(e) => setTelefoneContato(e.target.value)}
                          placeholder="(00) 00000-0000"
                          className="py-6 rounded-xl border-2"
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label className="font-bold">Foto da Ocorrência (Recomendado)</Label>
                      <div className="flex items-center gap-4">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => document.getElementById('ocorrencia-image-upload')?.click()}
                          className="gap-2 py-8 px-6 rounded-2xl border-2 border-dashed border-gray-200 hover:border-amber-500 transition-colors"
                        >
                          <ImagePlus className="w-5 h-5" />
                          Adicionar Foto
                        </Button>
                        <input
                          id="ocorrencia-image-upload"
                          type="file"
                          accept="image/*"
                          onChange={handleImageChange}
                          className="hidden"
                        />
                        {imagemPreview && (
                          <div className="relative group">
                            <img src={imagemPreview} alt="Preview" className="w-24 h-24 object-cover rounded-2xl border-2 border-amber-500/20 shadow-lg" />
                            <Button
                              type="button"
                              variant="destructive"
                              size="icon"
                              className="absolute -top-2 -right-2 w-7 h-7 rounded-full shadow-lg scale-0 group-hover:scale-100 transition-transform"
                              onClick={() => { setImagemFile(null); setImagemPreview(""); }}
                            >
                              <X className="w-4 h-4" />
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>

                    <DialogFooter className="pt-6">
                      <Button type="button" variant="ghost" onClick={() => setOpenDialog(false)} className="rounded-xl font-bold">
                        Cancelar
                      </Button>
                      <Button type="submit" disabled={submitting} className="rounded-xl px-12 font-bold py-6 h-auto bg-amber-500 hover:bg-amber-600 text-white">
                        {submitting ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Registrando...</> : 'Registrar Ocorrência'}
                      </Button>
                    </DialogFooter>
                  </form>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </section>

        {/* Filtros e Resultados Section */}
        <section className="container mx-auto px-4 py-8 space-y-12">
          {/* Barra de Filtros Premium */}
          <Card className="bg-card border border-border/50 shadow-xl rounded-[2.5rem] p-8">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="space-y-2">
                <Label className="font-bold text-gray-500 uppercase text-[10px] tracking-widest pl-1">Busca Rápida</Label>
                <div className="relative group">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-hover:text-amber-500 transition-colors w-4 h-4" />
                  <Input
                    value={busca}
                    onChange={(e) => setBusca(e.target.value)}
                    placeholder="Buscar ocorrência..."
                    className="pl-10 py-5 rounded-xl border-gray-100 focus:border-amber-500 transition-all"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="font-bold text-gray-500 uppercase text-[10px] tracking-widest pl-1">Tipo</Label>
                <Select value={filtroTipo} onValueChange={setFiltroTipo}>
                  <SelectTrigger className="py-5 rounded-xl border-gray-100 font-medium">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl font-medium">
                    <SelectItem value="todos">Todos os tipos</SelectItem>
                    {tiposOcorrencia.map(t => (
                      <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="font-bold text-gray-500 uppercase text-[10px] tracking-widest pl-1">Categoria</Label>
                <Select value={filtroCategoria} onValueChange={setFiltroCategoria}>
                  <SelectTrigger className="py-5 rounded-xl border-gray-100 font-medium">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl font-medium">
                    <SelectItem value="todas">Todas Categorias</SelectItem>
                    {categorias.map(cat => (
                      <SelectItem key={cat.value} value={cat.value}>{cat.icon} {cat.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="font-bold text-gray-500 uppercase text-[10px] tracking-widest pl-1">Status</Label>
                <Select value={filtroStatus} onValueChange={setFiltroStatus}>
                  <SelectTrigger className="py-5 rounded-xl border-gray-100 font-medium">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl font-medium">
                    <SelectItem value="aberto">🔴 Abertos</SelectItem>
                    <SelectItem value="em_andamento">🟡 Em Andamento</SelectItem>
                    <SelectItem value="resolvido">🟢 Resolvidos</SelectItem>
                    <SelectItem value="todos">Mostrar Todos</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </Card>

          {/* Listagem de Resultados */}
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 animate-pulse">
              <Loader2 className="w-12 h-12 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mb-4" />
              <p className="text-muted-foreground font-bold">Carregando ocorrências...</p>
            </div>
          ) : ocorrenciasFiltradas.length === 0 ? (
            <div className="text-center py-24 bg-muted/20 rounded-[2.5rem] border-2 border-dashed border-border/50 flex flex-col items-center gap-4">
              <AlertTriangle className="w-20 h-20 text-muted-foreground/30" />
              <div className="space-y-2">
                <h3 className="text-2xl font-black text-foreground">Nenhuma ocorrência encontrada</h3>
                <p className="text-muted-foreground font-medium">Registre a primeira ocorrência da sua comunidade.</p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {ocorrenciasFiltradas.map((item) => {
                const statusConfig = getStatusConfig(item.status);
                const StatusIcon = statusConfig.icon;
                return (
                  <Card key={item.id} className="group bg-card border border-border/50 hover:border-amber-500/40 transition-all duration-300 overflow-hidden shadow-sm hover:shadow-xl p-0 flex flex-col rounded-[2rem]">
                    {/* Container da Imagem */}
                    <div className="relative h-64 overflow-hidden bg-muted/20">
                      {item.imagem ? (
                        <img
                          src={item.imagem}
                          alt={item.titulo}
                          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/20 dark:to-orange-950/20">
                          <AlertTriangle className="w-16 h-16 text-amber-500/30" />
                        </div>
                      )}

                      {/* Badge de Status/Tipo */}
                      <div className="absolute top-4 left-4 right-4 flex justify-between items-start">
                        <Badge
                          className={`px-4 py-1.5 rounded-xl border-none font-black text-[10px] uppercase shadow-lg text-white ${getTipoColor(item.tipo)}`}
                        >
                          {getTipoLabel(item.tipo)}
                        </Badge>

                        <Badge className={`${statusConfig.color} text-white px-4 py-1.5 rounded-xl border-none font-black text-[10px] uppercase shadow-lg`}>
                          <StatusIcon className="w-3 h-3 mr-1.5" /> {statusConfig.label}
                        </Badge>
                      </div>
                    </div>

                    {/* Conteúdo do Card */}
                    <div className="p-6 flex-grow flex flex-col gap-4">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <span className="text-base">{getCategoriaIcon(item.categoria)}</span>
                          <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">{getCategoriaLabel(item.categoria)}</span>
                        </div>
                        <h3 className="text-xl font-black text-foreground leading-tight group-hover:text-amber-500 transition-colors">
                          {item.titulo}
                        </h3>
                        <p className="text-sm text-muted-foreground font-medium line-clamp-2 leading-relaxed italic">
                          "{item.descricao}"
                        </p>
                      </div>

                      <div className="mt-auto space-y-4">
                        <div className="space-y-2.5 pt-4 border-t border-border/50">
                          <div className="flex items-center gap-3 text-sm font-bold text-foreground">
                            <div className="p-2 bg-muted rounded-lg group-hover:bg-amber-500/10 transition-colors">
                              <MapPin className="w-4 h-4 text-amber-500" />
                            </div>
                            <span className="truncate">[{item.bairro}] <span className="text-muted-foreground font-medium">{item.local_referencia}</span></span>
                          </div>
                          <div className="flex items-center gap-3 text-sm font-bold text-foreground">
                            <div className="p-2 bg-muted rounded-lg group-hover:bg-amber-500/10 transition-colors">
                              <Calendar className="w-4 h-4 text-amber-500" />
                            </div>
                            <span>{formatarData(item.data_ocorrencia)}</span>
                          </div>
                          <div className="flex items-center gap-3 text-sm font-bold text-amber-600">
                            <div className="p-2 bg-amber-500/10 rounded-lg">
                              <Phone className="w-4 h-4" />
                            </div>
                            <a href={`tel:${item.telefone_contato}`} className="hover:underline">
                              {item.telefone_contato}
                            </a>
                          </div>
                        </div>

                        <div className="flex items-center justify-between text-[10px] font-bold text-muted-foreground uppercase tracking-widest pt-2">
                          <span className="flex items-center gap-1.5">
                            <User className="w-3 h-3" /> Por: {item.users?.nome || item.nome_contato || 'Comunidade'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </section>
      </main>

      <Footer />

      {showLogin && (
        <LoginDialog
          open={showLogin}
          onOpenChange={setShowLogin}
          onLoginSuccess={() => {
            carregarUsuario();
            setShowLogin(false);
          }}
        />
      )}
    </div>
  );
}
