import { Search, Heart, Building2, MapPin, Star } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useState, useEffect, useRef } from "react";
import { supabase, type EmpresaCompleta } from "@/lib/supabase";
import { useNavigate } from "react-router-dom";

const SearchSection = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState<EmpresaCompleta[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

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
        const { data, error } = await supabase
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
          .or(`nome.ilike.%${searchTerm}%,descricao.ilike.%${searchTerm}%,bairro.ilike.%${searchTerm}%`)
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
  }, [searchTerm]);

  const handleSelectEmpresa = (empresaId: string) => {
    setShowDropdown(false);
    setSearchTerm("");
    navigate(`/empresas?id=${empresaId}`);
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
              <Input
                type="text"
                placeholder="Ex: farmácia, restaurante, mecânico..."
                className="pl-6 pr-6 py-7 text-lg bg-background border-2 border-border focus:border-primary rounded-2xl shadow-lg"
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
        <div className="flex items-center justify-between mb-4">
          <p className="text-base font-medium text-muted-foreground">Acesso rápido:</p>
          <a href="/ver-todos" className="text-sm text-primary font-semibold hover:underline">
            Ver todos
          </a>
        </div>

        <div className="flex flex-wrap gap-3">
          <Button 
            variant="outline" 
            className="gap-2 border-2"
            size="default"
          >
            <Heart className="h-5 w-5" />
            Meus Favoritos
          </Button>
          <Button 
            variant="outline" 
            className="gap-2 border-2"
            size="default"
          >
            <Building2 className="h-5 w-5" />
            Por Categoria
          </Button>
        </div>
      </div>
    </section>
  );
};

export default SearchSection;
