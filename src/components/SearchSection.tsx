import { Search, Heart, Building2, MapPin, Star, ChevronDown, Filter, X, Check } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useState, useEffect, useRef } from "react";
import { supabase, type EmpresaCompleta, getUsuarioLogado } from "@/lib/supabase";
import { useNavigate } from "react-router-dom";
import { LoginDialog } from "@/components/LoginDialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface Categoria {
  id: string;
  nome: string;
  icone: string;
  cor: string;
}

const SearchSection = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState<EmpresaCompleta[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [loadingCategorias, setLoadingCategorias] = useState(false);
  const [categoriaFiltro, setCategoriaFiltro] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const user = getUsuarioLogado();

  // Carregar categorias que têm empresas
  useEffect(() => {
    const carregarCategorias = async () => {
      setLoadingCategorias(true);
      try {
        // Buscar todas as empresas aprovadas para pegar categorias únicas
        const { data: empresasData, error } = await supabase
          .from('empresas')
          .select(`
            categoria_id,
            categorias:categoria_id(id, nome, icone, cor)
          `)
          .eq('status', 'aprovado');

        if (error) throw error;

        // Extrair categorias únicas
        const categoriasUnicas = new Map<string, Categoria>();
        empresasData?.forEach(empresa => {
          if (empresa.categorias && empresa.categoria_id) {
            const cat = empresa.categorias as any;
            if (!categoriasUnicas.has(cat.id)) {
              categoriasUnicas.set(cat.id, {
                id: cat.id,
                nome: cat.nome,
                icone: cat.icone,
                cor: cat.cor
              });
            }
          }
        });

        // Converter para array e ordenar por nome
        const categoriasArray = Array.from(categoriasUnicas.values())
          .sort((a, b) => a.nome.localeCompare(b.nome));

        setCategorias(categoriasArray);
      } catch (error) {
        console.error('Erro ao carregar categorias:', error);
      } finally {
        setLoadingCategorias(false);
      }
    };

    carregarCategorias();
  }, []);

  // Fechar dropdown ao clicar fora
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Buscar empresas
  useEffect(() => {
    const searchEmpresas = async () => {
      if (searchTerm.trim().length < 2) {
        setSearchResults([]);
        setShowDropdown(false);
        return;
      }

      setLoading(true);
      try {
        let query = supabase
          .from("empresas")
          .select(`
            *,
            categorias:categoria_id (
              nome,
              icone,
              cor
            )
          `)
          .eq("status", "aprovado")
          .or(`nome.ilike.%${searchTerm}%,descricao.ilike.%${searchTerm}%,bairro.ilike.%${searchTerm}%`);

        // Aplicar filtro de categoria se selecionado
        if (categoriaFiltro) {
          query = query.eq('categoria_id', categoriaFiltro);
        }

        const { data, error } = await query
          .order("destaque", { ascending: false })
          .order("visualizacoes", { ascending: false })
          .limit(8);

        if (error) throw error;

        const empresasComCategoria = data?.map((empresa: any) => ({
          ...empresa,
          categoria_nome: empresa.categorias?.nome,
          categoria_icone: empresa.categorias?.icone,
          categoria_cor: empresa.categorias?.cor,
        })) || [];

        setSearchResults(empresasComCategoria);
        setShowDropdown(true);
      } catch (error) {
        console.error("Erro ao buscar empresas:", error);
        setSearchResults([]);
      } finally {
        setLoading(false);
      }
    };

    const debounce = setTimeout(() => {
      searchEmpresas();
    }, 300);

    return () => clearTimeout(debounce);
  }, [searchTerm, categoriaFiltro]);

  const handleSelectEmpresa = (empresaId: string) => {
    setShowDropdown(false);
    setSearchTerm("");
    navigate(`/empresas?id=${empresaId}`);
  };

  const handleMeusFavoritos = () => {
    if (!user) {
      setShowLogin(true);
      return;
    }
    navigate('/meus-locais');
  };

  const handleSelecionarCategoria = (categoriaId: string) => {
    navigate(`/empresas?categoria=${categoriaId}`);
  };

  return (
    <section className="container mx-auto px-4 -mt-16 relative z-10">
      <div className="glass-card rounded-3xl shadow-2xl p-8 md:p-10 border-2 animate-slide-up">
        <h3 className="text-3xl md:text-4xl font-bold text-center mb-3 gradient-text">
          Encontre empresas locais
        </h3>
        <p className="text-center text-muted-foreground mb-8 text-lg">
          Busque por nome, categoria ou serviço
        </p>

        {/* Search Bar */}
        <div className="max-w-3xl mx-auto mb-10" ref={dropdownRef}>
          <div className="relative flex items-center gap-3">
            <div className="relative flex-1">
              <div className="absolute left-2 top-1/2 -translate-y-1/2 flex items-center gap-1.5 z-10">
                {/* Filtro de Categoria */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      className={`h-8 px-2 hover:bg-primary/10 ${categoriaFiltro ? 'text-primary' : 'text-muted-foreground'}`}
                      disabled={loadingCategorias}
                    >
                      <Filter className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start" className="w-56 max-h-[400px] overflow-y-auto">
                    <div className="p-2">
                      <p className="text-xs font-semibold text-muted-foreground mb-2 px-2">Filtrar por categoria</p>
                      {categoriaFiltro && (
                        <DropdownMenuItem
                          onClick={() => setCategoriaFiltro(null)}
                          className="cursor-pointer text-destructive mb-2"
                        >
                          <X className="h-4 w-4 mr-2" />
                          Limpar filtro
                        </DropdownMenuItem>
                      )}
                      {loadingCategorias ? (
                        <div className="p-4 text-center text-sm text-muted-foreground">
                          Carregando...
                        </div>
                      ) : categorias.length === 0 ? (
                        <div className="p-4 text-center text-sm text-muted-foreground">
                          Nenhuma categoria disponível
                        </div>
                      ) : (
                        categorias.map((categoria) => (
                          <DropdownMenuItem
                            key={categoria.id}
                            onClick={() => setCategoriaFiltro(categoria.id)}
                            className={`cursor-pointer ${categoriaFiltro === categoria.id ? 'bg-primary/10' : ''}`}
                          >
                            <span className="font-medium">{categoria.nome}</span>
                            {categoriaFiltro === categoria.id && (
                              <Check className="h-4 w-4 ml-auto text-primary" />
                            )}
                          </DropdownMenuItem>
                        ))
                      )}
                    </div>
                  </DropdownMenuContent>
                </DropdownMenu>

                {/* Badge do Filtro Selecionado */}
                {categoriaFiltro && (
                  <>
                    <div className="h-5 w-px bg-border/60" />
                    <Badge 
                      variant="secondary"
                      className="flex items-center gap-1 pr-0.5 py-0.5 bg-primary/10 text-primary border border-primary/20 hover:bg-primary/15"
                    >
                      <span className="text-xs font-semibold pl-1.5">
                        {categorias.find(c => c.id === categoriaFiltro)?.nome}
                      </span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setCategoriaFiltro(null);
                        }}
                        className="hover:bg-primary/20 rounded-full p-0.5 transition-colors"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  </>
                )}
              </div>

              <Input
                type="text"
                placeholder="Ex: farmácia, restaurante, mecânico..."
                className={`${categoriaFiltro ? 'pl-40' : 'pl-12'} pr-6 py-7 text-lg bg-background border-2 border-border focus:border-primary rounded-2xl shadow-lg transition-all`}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onFocus={() => searchResults.length > 0 && setShowDropdown(true)}
              />

              {/* Dropdown de Resultados */}
              {showDropdown && searchResults.length > 0 && (
                <div className="absolute top-full mt-2 w-full bg-background border-2 border-border rounded-2xl shadow-2xl overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                  <div className="max-h-[400px] overflow-y-auto">
                    {searchResults.map((empresa) => (
                      <button
                        key={empresa.id}
                        onClick={() => handleSelectEmpresa(empresa.id)}
                        className="w-full px-4 py-3 hover:bg-accent transition-colors flex items-start gap-3 border-b border-border last:border-0"
                      >
                        {/* Logo ou Ícone */}
                        <div className="flex-shrink-0 w-12 h-12 rounded-lg overflow-hidden bg-muted flex items-center justify-center">
                          {empresa.logo ? (
                            <img 
                              src={empresa.logo} 
                              alt={empresa.nome}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <Building2 className="h-6 w-6 text-muted-foreground" />
                          )}
                        </div>

                        {/* Informações */}
                        <div className="flex-1 text-left">
                          <div className="flex items-start justify-between gap-2">
                            <h4 className="font-semibold text-foreground line-clamp-1">
                              {empresa.nome}
                            </h4>
                            {empresa.destaque && (
                              <Star className="h-4 w-4 text-yellow-500 fill-yellow-500 flex-shrink-0" />
                            )}
                          </div>
                          
                          <div className="flex items-center gap-2 mt-1">
                            {empresa.categoria_nome && (
                              <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary font-medium">
                                {empresa.categoria_nome}
                              </span>
                            )}
                            <div className="flex items-center gap-1 text-xs text-muted-foreground">
                              <MapPin className="h-3 w-3" />
                              <span className="line-clamp-1">{empresa.bairro}</span>
                            </div>
                          </div>

                          {empresa.descricao && (
                            <p className="text-xs text-muted-foreground mt-1 line-clamp-1">
                              {empresa.descricao}
                            </p>
                          )}
                        </div>
                      </button>
                    ))}
                  </div>
                  
                  {/* Footer do Dropdown */}
                  <div className="px-4 py-2 bg-muted/30 border-t border-border">
                    <p className="text-xs text-center text-muted-foreground">
                      {searchResults.length} {searchResults.length === 1 ? 'resultado encontrado' : 'resultados encontrados'}
                    </p>
                  </div>
                </div>
              )}

              {/* Loading */}
              {loading && (
                <div className="absolute right-4 top-1/2 -translate-y-1/2">
                  <div className="animate-spin h-5 w-5 border-2 border-primary border-t-transparent rounded-full" />
                </div>
              )}

              {/* Sem Resultados */}
              {showDropdown && !loading && searchTerm.trim().length >= 2 && searchResults.length === 0 && (
                <div className="absolute top-full mt-2 w-full bg-background border-2 border-border rounded-2xl shadow-2xl p-6 z-50 text-center">
                  <Building2 className="h-12 w-12 text-muted-foreground mx-auto mb-2 opacity-50" />
                  <p className="text-sm font-medium text-foreground">Nenhuma empresa encontrada</p>
                  <p className="text-xs text-muted-foreground mt-1">Tente outro termo de busca</p>
                </div>
              )}
            </div>
            <Button 
              size="lg" 
              className="px-8 py-7 rounded-2xl shadow-lg bg-gradient-to-r from-primary to-primary/80"
              onClick={() => searchTerm.trim() && navigate(`/empresas?search=${searchTerm}`)}
            >
              <Search className="h-6 w-6" />
            </Button>
          </div>
        </div>

        {/* Quick Access */}
        <div className="mb-4">
          <p className="text-base font-medium text-muted-foreground">Acesso rápido:</p>
        </div>

        <div className="flex flex-wrap gap-3">
          <Button 
            variant="outline" 
            className="gap-2 border-2"
            size="default"
            onClick={handleMeusFavoritos}
          >
            <Heart className="h-5 w-5" />
            Meus Favoritos
          </Button>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="outline" 
                className="gap-2 border-2"
                size="default"
                disabled={loadingCategorias}
              >
                <Building2 className="h-5 w-5" />
                Por Categoria
                <ChevronDown className="h-4 w-4 ml-1" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-56 max-h-[400px] overflow-y-auto">
              {loadingCategorias ? (
                <div className="p-4 text-center text-sm text-muted-foreground">
                  Carregando...
                </div>
              ) : categorias.length === 0 ? (
                <div className="p-4 text-center text-sm text-muted-foreground">
                  Nenhuma categoria com empresas
                </div>
              ) : (
                categorias.map((categoria) => (
                  <DropdownMenuItem
                    key={categoria.id}
                    onClick={() => handleSelecionarCategoria(categoria.id)}
                    className="cursor-pointer"
                  >
                    <span className="font-medium">{categoria.nome}</span>
                  </DropdownMenuItem>
                ))
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Dialog de Login */}
      <LoginDialog
        open={showLogin}
        onOpenChange={setShowLogin}
      />
    </section>
  );
};

export default SearchSection;
