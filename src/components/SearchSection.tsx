import { Search, Heart, Building2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const SearchSection = () => {
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
        <div className="max-w-3xl mx-auto mb-10">
          <div className="relative flex items-center gap-3">
            <div className="relative flex-1">
              <Input
                type="text"
                placeholder="Ex: farmácia, restaurante, mecânico..."
                className="pl-6 pr-6 py-7 text-lg bg-background border-2 border-border focus:border-primary rounded-2xl shadow-lg"
              />
            </div>
            <Button 
              size="lg" 
              className="px-8 py-7 rounded-2xl shadow-lg bg-gradient-to-r from-primary to-primary/80"
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
