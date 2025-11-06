import { Building2, HelpCircle } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const CategoriesSection = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Building2 className="h-5 w-5" />
          Categorias de Empresas
        </CardTitle>
        <CardDescription>
          As categorias com empresas cadastradas aparecerão aqui
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <HelpCircle className="h-12 w-12 text-muted-foreground mb-4" />
          <h4 className="font-semibold text-foreground mb-2">
            Nenhuma categoria com empresas ainda
          </h4>
          <p className="text-sm text-muted-foreground max-w-md">
            Empresas cadastradas e aprovadas aparecerão organizadas por categoria
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default CategoriesSection;
