import { useEffect, useMemo, useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { EMPRESAS, Empresa } from "@/lib/empresas";
import { MapPin, Heart, Phone, Mail, Globe, Clipboard, Check } from "lucide-react";
import { toast } from "@/components/ui/sonner";

// Redesign: removido cálculo de distância (geolocalização não usada aqui)

const MeusLocais = () => {
  const [favoritos, setFavoritos] = useState<Set<string>>(() => {
    const raw = localStorage.getItem("favoritos_empresas");
    if (!raw) return new Set();
    try { return new Set(JSON.parse(raw)); } catch { return new Set(); }
  });
  const [busca, setBusca] = useState("");
  // Sem userLocation neste contexto
  const [copiado, setCopiado] = useState<string | null>(null);

  // Removido bloco de requestLocation conforme redesign solicitado.

  useEffect(() => {
    localStorage.setItem("favoritos_empresas", JSON.stringify(Array.from(favoritos)));
  }, [favoritos]);

  const [categoria, setCategoria] = useState<string>("todas");
  const [bairro, setBairro] = useState<string>("todos");

  const listaFavoritos = useMemo(() => {
    const base = EMPRESAS.filter(e => favoritos.has(e.id));
    const categorias = categoria === "todas" ? base : base.filter(e => e.categoria === categoria);
    const bairros = bairro === "todos" ? categorias : categorias.filter(e => e.bairro === bairro);
    const buscados = busca ? bairros.filter(e => e.nome.toLowerCase().includes(busca.toLowerCase())) : bairros;
    return buscados.sort((a, b) => a.nome.localeCompare(b.nome));
  }, [favoritos, busca, categoria, bairro]);

  const categoriasDisponiveis = useMemo(() => Array.from(new Set(EMPRESAS.filter(e => favoritos.has(e.id)).map(e => e.categoria))), [favoritos]);
  const bairrosDisponiveis = useMemo(() => Array.from(new Set(EMPRESAS.filter(e => favoritos.has(e.id)).map(e => e.bairro))), [favoritos]);

  const toggleFavorito = (id: string) => {
    setFavoritos(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      toast(next.has(id) ? "Mantido nos favoritos" : "Removido", { duration: 1200 });
      return next;
    });
  };

  const copiar = (texto?: string) => {
    if (!texto) return;
    navigator.clipboard.writeText(texto).then(() => {
      setCopiado(texto); toast("Copiado!", { description: texto, duration: 1200 }); setTimeout(() => setCopiado(null), 1200);
    }).catch(() => toast("Falha ao copiar", { duration: 1500 }));
  };

  const [selecionada, setSelecionada] = useState<Empresa | null>(null);
  const [modalAberto, setModalAberto] = useState(false);
  const abrir = (e: Empresa) => { setSelecionada(e); setModalAberto(true); };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-12 space-y-12">
        <div className="space-y-4">
          <h2 className="text-3xl font-bold gradient-text flex items-center gap-3"><Heart className="h-8 w-8 text-primary" /> Meus Locais</h2>
          <p className="text-sm text-muted-foreground max-w-2xl">Empresas que você marcou como favoritas. Remova ou abra detalhes.</p>
        </div>

        <Card className="glass-card border-2">
          <CardHeader className="pb-4">
            <CardTitle className="text-xl">Filtros</CardTitle>
            <CardDescription>Refine seus favoritos por nome, categoria e bairro.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid md:grid-cols-4 gap-4">
              <div className="space-y-2 md:col-span-2">
                <label className="text-xs font-medium">Buscar (nome)</label>
                <Input placeholder="Ex: Padaria" value={busca} onChange={e => setBusca(e.target.value)} />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-medium">Categoria</label>
                <Select value={categoria} onValueChange={setCategoria}>
                  <SelectTrigger className="w-full"><SelectValue placeholder="Categoria" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todas">Todas</SelectItem>
                    {categoriasDisponiveis.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-medium">Bairro</label>
                <Select value={bairro} onValueChange={setBairro}>
                  <SelectTrigger className="w-full"><SelectValue placeholder="Bairro" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todos">Todos</SelectItem>
                    {bairrosDisponiveis.map(b => <SelectItem key={b} value={b}>{b}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              {categoria !== "todas" && <Badge variant="secondary">Categoria: {categoria}</Badge>}
              {bairro !== "todos" && <Badge variant="secondary">Bairro: {bairro}</Badge>}
              {busca && <Badge variant="secondary">Busca: {busca}</Badge>}
              {(categoria !== "todas" || bairro !== "todos" || busca) && (
                <Button variant="ghost" size="sm" onClick={() => { setCategoria("todas"); setBairro("todos"); setBusca(""); }}>Limpar filtros</Button>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card border-2">
          <CardHeader className="pb-4">
            <CardTitle className="text-xl">Favoritos ({listaFavoritos.length})</CardTitle>
            <CardDescription>Empresas que você marcou. Remova ou abra detalhes.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-8">
            <div className="grid md:grid-cols-2 gap-6">
              {listaFavoritos.map(emp => (
                <div key={emp.id} className="relative">
                  <button
                    type="button"
                    onClick={() => abrir(emp)}
                    className="w-full text-left group relative rounded-xl overflow-hidden border border-border/60 bg-gradient-to-br from-background to-accent/30 shadow-sm hover:shadow-md transition-shadow focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                  >
                    <div className="h-40 w-full overflow-hidden">
                      <img src={emp.imagens[0]} alt={emp.nome} className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    </div>
                    <div className="p-5 space-y-3">
                      <div className="flex items-center justify-between">
                        <h3 className="font-semibold text-lg flex items-center gap-2">{emp.nome}<Badge variant="secondary">Favorito</Badge></h3>
                        <Badge>{emp.categoria}</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground leading-relaxed line-clamp-3">{emp.descricao}</p>
                      <div className="flex items-center text-xs mt-2">
                        <span className="flex items-center gap-1"><MapPin className="h-3 w-3 text-primary" />{emp.bairro}</span>
                      </div>
                    </div>
                  </button>
                  <button
                    type="button"
                    aria-label="Remover dos favoritos"
                    onClick={() => toggleFavorito(emp.id)}
                    className="absolute top-2 right-2 bg-background/70 backdrop-blur-sm rounded-full p-2 shadow-sm hover:bg-destructive hover:text-destructive-foreground transition-colors"
                  >
                    <Heart className="h-4 w-4 fill-primary text-primary" />
                  </button>
                </div>
              ))}
              {listaFavoritos.length === 0 && (
                <div className="col-span-full text-center py-12 text-sm text-muted-foreground space-y-4">
                  <p>Nenhuma empresa favoritada ainda.</p>
                  <Button variant="outline" size="sm" asChild>
                    <a href="/empresas" className="gap-2 flex items-center"><Heart className="h-4 w-4" /> Explorar empresas</a>
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {selecionada && modalAberto && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-6">
            <div className="absolute inset-0 bg-background/70 backdrop-blur-sm" onClick={() => setModalAberto(false)} />
            <div
              role="dialog"
              aria-modal="true"
              aria-label={`Detalhes da empresa ${selecionada.nome}`}
              className="relative w-full max-w-xl sm:max-w-2xl md:max-w-3xl rounded-lg sm:rounded-2xl border border-border/60 glass-card shadow-lg animate-in fade-in-0 zoom-in-95 max-h-[calc(100vh-1rem)] sm:max-h-[calc(100vh-4rem)] flex flex-col overflow-hidden"
            >
              <div className="h-48 sm:h-56 md:h-64 w-full overflow-hidden relative shrink-0">
                <img src={selecionada.imagens[0]} alt={selecionada.nome} className="h-full w-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-background/10" />
                <button
                  type="button"
                  aria-label="Fechar modal"
                  onClick={() => setModalAberto(false)}
                  className="absolute top-3 right-3 bg-background/70 backdrop-blur-sm rounded-full px-3 py-1 text-xs font-medium hover:bg-primary hover:text-primary-foreground transition-colors"
                >Fechar</button>
              </div>
              <div className="flex-grow overflow-y-auto px-4 sm:px-6 py-4 sm:py-6 space-y-6">
                <div className="flex flex-col gap-1">
                  <h3 className="text-xl sm:text-2xl font-bold flex flex-wrap items-center gap-2">
                    {selecionada.nome}
                    <Badge className="whitespace-nowrap">{selecionada.categoria}</Badge>
                  </h3>
                  {selecionada.endereco && <p className="text-sm text-muted-foreground">{selecionada.endereco}</p>}
                </div>
                <p className="text-sm leading-relaxed text-foreground/80">{selecionada.descricao}</p>
                <div className="grid sm:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <h4 className="text-xs uppercase tracking-wide font-semibold text-muted-foreground">Contato</h4>
                    <ul className="space-y-2 text-sm">
                      {selecionada.telefone && (
                        <li className="flex items-center justify-between gap-3">
                          <span className="flex items-center gap-2"><Phone className="h-4 w-4 text-primary" />{selecionada.telefone}</span>
                          <button onClick={() => copiar(selecionada.telefone)} className="p-1 rounded hover:bg-accent" aria-label="Copiar telefone">
                            {copiado === selecionada.telefone ? <Check className="h-4 w-4 text-green-500" /> : <Clipboard className="h-4 w-4" />}
                          </button>
                        </li>
                      )}
                      {selecionada.whatsapp && (
                        <li className="flex items-center justify-between gap-3">
                          <span className="flex items-center gap-2"><Phone className="h-4 w-4 text-primary" />WhatsApp: {selecionada.whatsapp}</span>
                          <div className="flex items-center gap-2">
                            <Button variant="outline" size="sm" asChild>
                              <a href={`https://wa.me/${selecionada.whatsapp.replace(/[^\d]/g,'')}`} target="_blank" rel="noopener noreferrer">Abrir</a>
                            </Button>
                            <button onClick={() => copiar(selecionada.whatsapp)} className="p-1 rounded hover:bg-accent" aria-label="Copiar WhatsApp">
                              {copiado === selecionada.whatsapp ? <Check className="h-4 w-4 text-green-500" /> : <Clipboard className="h-4 w-4" />}
                            </button>
                          </div>
                        </li>
                      )}
                      {selecionada.email && (
                        <li className="flex items-center justify-between gap-3">
                          <span className="flex items-center gap-2"><Mail className="h-4 w-4 text-primary" />{selecionada.email}</span>
                          <button onClick={() => copiar(selecionada.email)} className="p-1 rounded hover:bg-accent" aria-label="Copiar email">
                            {copiado === selecionada.email ? <Check className="h-4 w-4 text-green-500" /> : <Clipboard className="h-4 w-4" />}
                          </button>
                        </li>
                      )}
                      {selecionada.site && (
                        <li className="flex items-center justify-between gap-3">
                          <span className="flex items-center gap-2"><Globe className="h-4 w-4 text-primary" />{selecionada.site}</span>
                          <div className="flex items-center gap-2">
                            <Button variant="outline" size="sm" asChild>
                              <a href={selecionada.site} target="_blank" rel="noopener noreferrer">Abrir</a>
                            </Button>
                            <button onClick={() => copiar(selecionada.site)} className="p-1 rounded hover:bg-accent" aria-label="Copiar site">
                              {copiado === selecionada.site ? <Check className="h-4 w-4 text-green-500" /> : <Clipboard className="h-4 w-4" />}
                            </button>
                          </div>
                        </li>
                      )}
                    </ul>
                  </div>
                  <div className="space-y-3">
                    <h4 className="text-xs uppercase tracking-wide font-semibold text-muted-foreground">Localização</h4>
                    <div className="text-sm flex flex-col gap-1">
                      <span className="flex items-center gap-2"><MapPin className="h-4 w-4 text-primary" />{selecionada.bairro}</span>
                      {selecionada.endereco && <span className="text-muted-foreground break-words">{selecionada.endereco}</span>}
                      {/* Distância removida no redesign */}
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/70 border-t px-4 sm:px-6 py-3 flex flex-wrap gap-3 justify-between items-center">
                <div className="flex items-center gap-2">
                  {selecionada && favoritos.has(selecionada.id) && <Badge variant="secondary">Favorito</Badge>}
                </div>
                <div className="flex gap-2 w-full sm:w-auto justify-end">
                  {selecionada && (
                    <Button
                      variant={favoritos.has(selecionada.id) ? "secondary" : "outline"}
                      size="sm"
                      onClick={() => toggleFavorito(selecionada.id)}
                      className="gap-2 flex-1 sm:flex-none"
                    >
                      <Heart className={"h-4 w-4 " + (favoritos.has(selecionada.id) ? "fill-primary text-primary" : "")} />
                      {favoritos.has(selecionada.id) ? "Remover" : "Favoritar"}
                    </Button>
                  )}
                  <Button variant="ghost" size="sm" onClick={() => setModalAberto(false)} className="flex-1 sm:flex-none">Fechar</Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default MeusLocais;
