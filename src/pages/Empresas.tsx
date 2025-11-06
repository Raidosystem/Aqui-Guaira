import { useEffect, useMemo, useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MapPin, Building2, RefreshCcw, LocateFixed, Phone, Mail, Globe, Clipboard, ExternalLink, Heart, Check } from "lucide-react";
import { toast } from "@/components/ui/sonner";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";

import { EMPRESAS, Empresa } from "@/lib/empresas";

const haversineKm = (lat1: number, lon1: number, lat2: number, lon2: number) => {
  const R = 6371; // km
  const toRad = (v: number) => (v * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

const Empresas = () => {
  const [busca, setBusca] = useState("");
  const [categoria, setCategoria] = useState<string>("todas");
  const [bairro, setBairro] = useState<string>("todos");
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [locError, setLocError] = useState<string | null>(null);
  const [maxDistance, setMaxDistance] = useState<number>(20); // km
  const [loadingLoc, setLoadingLoc] = useState(false);
  const [favoritos, setFavoritos] = useState<Set<string>>(() => {
    const raw = localStorage.getItem("favoritos_empresas");
    if (!raw) return new Set();
    try {
      return new Set(JSON.parse(raw));
    } catch {
      return new Set();
    }
  });
  const [copiado, setCopiado] = useState<string | null>(null);

  const categorias = useMemo(() => Array.from(new Set(EMPRESAS.map(e => e.categoria))), []);
  const bairros = useMemo(() => Array.from(new Set(EMPRESAS.map(e => e.bairro))), []);

  const requestLocation = () => {
    if (!navigator.geolocation) {
      setLocError("Geolocalização não suportada");
      return;
    }
    setLoadingLoc(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setLocError(null);
        setLoadingLoc(false);
      },
      (err) => {
        setLocError(err.message || "Falha ao obter localização");
        setLoadingLoc(false);
      },
      { enableHighAccuracy: true, timeout: 8000 }
    );
  };

  useEffect(() => {
    // Opcional: tentar automaticamente
    requestLocation();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    localStorage.setItem("favoritos_empresas", JSON.stringify(Array.from(favoritos)));
  }, [favoritos]);

  const empresasFiltradas = useMemo(() => {
    return EMPRESAS.map(emp => {
      const distancia = userLocation ? haversineKm(userLocation.lat, userLocation.lng, emp.lat, emp.lng) : null;
      return { ...emp, distancia };
    })
      .filter(emp => {
        if (busca && !emp.nome.toLowerCase().includes(busca.toLowerCase())) return false;
        if (categoria !== "todas" && emp.categoria !== categoria) return false;
        if (bairro !== "todos" && emp.bairro !== bairro) return false;
        if (userLocation && emp.distancia !== null && emp.distancia > maxDistance) return false;
        return true;
      })
      .sort((a, b) => {
        if (userLocation) {
          return (a.distancia ?? Infinity) - (b.distancia ?? Infinity);
        }
        return a.nome.localeCompare(b.nome);
      });
  }, [busca, categoria, bairro, userLocation, maxDistance]);

  // Paginação
  const [page, setPage] = useState(1);
  const pageSize = 4;
  const totalPages = Math.max(1, Math.ceil(empresasFiltradas.length / pageSize));

  useEffect(() => {
    if (page > totalPages) setPage(1); // reset se filtros reduzirem número de páginas
  }, [empresasFiltradas.length, totalPages, page]);

  const paginated = useMemo(() => {
    const start = (page - 1) * pageSize;
    return empresasFiltradas.slice(start, start + pageSize);
  }, [empresasFiltradas, page]);

  // Estado para modal de detalhes
  const [detalheAberto, setDetalheAberto] = useState(false);
  const [selecionada, setSelecionada] = useState<Empresa | null>(null);

  const abrirDetalhes = (emp: Empresa) => {
    setSelecionada(emp);
    setDetalheAberto(true);
  };

  const copiar = (texto?: string) => {
    if (!texto) return;
    navigator.clipboard.writeText(texto).then(() => {
      setCopiado(texto);
      toast("Copiado!", { description: texto, duration: 1200 });
      setTimeout(() => setCopiado(null), 1200);
    }).catch(() => {
      toast("Falha ao copiar", { description: "Tente novamente", duration: 1500 });
    });
  };

  const toggleFavorito = (id: string) => {
    setFavoritos(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      toast(next.has(id) ? "Adicionado aos favoritos" : "Removido dos favoritos", { duration: 1200 });
      return next;
    });
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-12 space-y-12">
        <div className="space-y-4">
          <h2 className="text-3xl font-bold gradient-text flex items-center gap-3"><Building2 className="h-8 w-8 text-primary" /> Empresas</h2>
          <p className="text-sm text-muted-foreground max-w-2xl">Explore empresas locais por categoria, bairro ou proximidade. Ative a localização para ordenar por distância em tempo real.</p>
        </div>

        {/* Filtros */}
        <Card className="glass-card border-2">
          <CardHeader className="pb-4">
            <CardTitle className="text-xl">Filtros</CardTitle>
            <CardDescription>Refine a busca usando os campos abaixo.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid md:grid-cols-4 gap-4">
              <div className="space-y-2">
                <label className="text-xs font-medium">Busca (nome)</label>
                <Input placeholder="Ex: Farmácia" value={busca} onChange={e => setBusca(e.target.value)} />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-medium">Categoria</label>
                <Select value={categoria} onValueChange={setCategoria}>
                  <SelectTrigger className="w-full"><SelectValue placeholder="Categoria" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todas">Todas</SelectItem>
                    {categorias.map(cat => <SelectItem key={cat} value={cat}>{cat}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-medium">Bairro</label>
                <Select value={bairro} onValueChange={setBairro}>
                  <SelectTrigger className="w-full"><SelectValue placeholder="Bairro" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todos">Todos</SelectItem>
                    {bairros.map(b => <SelectItem key={b} value={b}>{b}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-medium flex items-center gap-2">Distância (km) {userLocation ? <Badge variant="secondary">{maxDistance} km</Badge> : null}</label>
                <div className="space-y-3">
                  <Slider value={[maxDistance]} min={1} max={50} step={1} onValueChange={(v) => setMaxDistance(v[0])} disabled={!userLocation} />
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={requestLocation} disabled={loadingLoc} className="gap-2">
                      {loadingLoc ? <RefreshCcw className="h-4 w-4 animate-spin" /> : <LocateFixed className="h-4 w-4" />}
                      {userLocation ? "Atualizar" : "Ativar"}
                    </Button>
                    {locError && <span className="text-xs text-destructive">{locError}</span>}
                  </div>
                </div>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              {categoria !== "todas" && <Badge variant="secondary">Categoria: {categoria}</Badge>}
              {bairro !== "todos" && <Badge variant="secondary">Bairro: {bairro}</Badge>}
              {busca && <Badge variant="secondary">Busca: {busca}</Badge>}
              {userLocation && <Badge variant="secondary">Localização ativa</Badge>}
              {(categoria !== "todas" || bairro !== "todos" || busca || userLocation) && (
                <Button variant="ghost" size="sm" onClick={() => { setCategoria("todas"); setBairro("todos"); setBusca(""); }}>
                  Limpar filtros
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Lista */}
        <Card className="glass-card border-2">
          <CardHeader className="pb-4">
            <CardTitle className="text-xl">Empresas ({empresasFiltradas.length})</CardTitle>
            <CardDescription>
              Resultados conforme filtros aplicados. Página {page} de {totalPages}.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-8">
            <div className="grid md:grid-cols-2 gap-6">
            {paginated.map(emp => (
              <div key={emp.id} className="relative">
                <button
                  type="button"
                  onClick={() => abrirDetalhes(emp)}
                  className="w-full text-left group relative rounded-xl overflow-hidden border border-border/60 bg-gradient-to-br from-background to-accent/30 shadow-sm hover:shadow-md transition-shadow focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                >
                  <div className="h-40 w-full overflow-hidden">
                    <img src={emp.imagens[0]} alt={emp.nome} className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  </div>
                  <div className="p-5 space-y-3">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold text-lg flex items-center gap-2">
                        {emp.nome}
                        {favoritos.has(emp.id) && <Badge variant="secondary" className="animate-pulse">Favorito</Badge>}
                      </h3>
                      <Badge>{emp.categoria}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground leading-relaxed line-clamp-3">{emp.descricao}</p>
                    <div className="flex items-center justify-between text-xs mt-2">
                      <span className="flex items-center gap-1"><MapPin className="h-3 w-3 text-primary" />{emp.bairro}</span>
                      {emp.distancia !== null && userLocation ? (
                        <span className="font-medium">{emp.distancia.toFixed(2)} km</span>
                      ) : (
                        <span className="text-muted-foreground">Sem distância</span>
                      )}
                    </div>
                  </div>
                </button>
                <button
                  type="button"
                  aria-label={favoritos.has(emp.id) ? "Remover dos favoritos" : "Adicionar aos favoritos"}
                  onClick={() => toggleFavorito(emp.id)}
                  className="absolute top-2 right-2 bg-background/70 backdrop-blur-sm rounded-full p-2 shadow-sm hover:bg-primary hover:text-primary-foreground transition-colors"
                >
                  <Heart className={"h-4 w-4 " + (favoritos.has(emp.id) ? "fill-primary text-primary" : "")} />
                </button>
              </div>
            ))}
            {empresasFiltradas.length === 0 && (
              <div className="col-span-full text-center py-12 text-sm text-muted-foreground">Nenhuma empresa encontrada com esses filtros.</div>
            )}
            </div>
            {empresasFiltradas.length > pageSize && (
              <Pagination className="pt-2">
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious
                      href="#"
                      onClick={(e) => { e.preventDefault(); setPage(p => Math.max(1, p - 1)); }}
                      className={page === 1 ? "pointer-events-none opacity-40" : ""}
                    />
                  </PaginationItem>
                  {Array.from({ length: totalPages }).map((_, i) => (
                    <PaginationItem key={i}>
                      <PaginationLink
                        href="#"
                        isActive={page === i + 1}
                        onClick={(e) => { e.preventDefault(); setPage(i + 1); }}
                      >
                        {i + 1}
                      </PaginationLink>
                    </PaginationItem>
                  ))}
                  <PaginationItem>
                    <PaginationNext
                      href="#"
                      onClick={(e) => { e.preventDefault(); setPage(p => Math.min(totalPages, p + 1)); }}
                      className={page === totalPages ? "pointer-events-none opacity-40" : ""}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            )}
          </CardContent>
        </Card>

        {/* Modal de detalhes */}
        {selecionada && detalheAberto && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-6">
            <div className="absolute inset-0 bg-background/70 backdrop-blur-sm" onClick={() => setDetalheAberto(false)} />
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
                  onClick={() => setDetalheAberto(false)}
                  className="absolute top-3 right-3 bg-background/70 backdrop-blur-sm rounded-full px-3 py-1 text-xs font-medium hover:bg-primary hover:text-primary-foreground transition-colors"
                >Fechar</button>
              </div>
              {/* Conteúdo scrollável mantendo barra inferior fixa */}
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
                            {copiado === selecionada.telefone ? <Check className="h-4 w-4 text-green-500 animate-in zoom-in-75" /> : <Clipboard className="h-4 w-4" />}
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
                              {copiado === selecionada.whatsapp ? <Check className="h-4 w-4 text-green-500 animate-in zoom-in-75" /> : <Clipboard className="h-4 w-4" />}
                            </button>
                          </div>
                        </li>
                      )}
                      {selecionada.email && (
                        <li className="flex items-center justify-between gap-3">
                          <span className="flex items-center gap-2"><Mail className="h-4 w-4 text-primary" />{selecionada.email}</span>
                          <button onClick={() => copiar(selecionada.email)} className="p-1 rounded hover:bg-accent" aria-label="Copiar email">
                            {copiado === selecionada.email ? <Check className="h-4 w-4 text-green-500 animate-in zoom-in-75" /> : <Clipboard className="h-4 w-4" />}
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
                              {copiado === selecionada.site ? <Check className="h-4 w-4 text-green-500 animate-in zoom-in-75" /> : <Clipboard className="h-4 w-4" />}
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
                      {userLocation && (
                        <span className="text-xs mt-1">Distância estimada: {haversineKm(userLocation.lat, userLocation.lng, selecionada.lat, selecionada.lng).toFixed(2)} km</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
              {/* Barra de ações fixa */}
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
                  <Button variant="ghost" size="sm" onClick={() => setDetalheAberto(false)} className="flex-1 sm:flex-none">Fechar</Button>
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

export default Empresas;
