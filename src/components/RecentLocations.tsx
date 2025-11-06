import { Clock, MapPin } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const RecentLocations = () => {
  const locations = [
    {
      name: "Farmácia Central",
      category: "Farmácia",
      address: "Av. Principal, 123 - Centro",
      time: "2h atrás",
    },
    {
      name: "Supermercado Família",
      category: "Supermercado",
      address: "Rua do Comércio, 654 - Centro",
      time: "Ontem",
    },
    {
      name: "Salão Beleza Pura",
      category: "Salão",
      address: "Av. das Palmeiras, 321 - Centro",
      time: "3 dias atrás",
    },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5" />
          Locais Recentes
        </CardTitle>
        <CardDescription>
          Seus destinos visitados recentemente
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {locations.map((location, index) => (
          <div
            key={index}
            className="flex items-start justify-between p-4 rounded-lg border border-border cursor-pointer"
          >
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h4 className="font-semibold">{location.name}</h4>
                <Badge className="bg-primary text-primary-foreground">
                  {location.category}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground mb-1">{location.address}</p>
              <p className="text-xs text-muted-foreground">{location.time}</p>
            </div>
            <MapPin className="h-5 w-5 text-muted-foreground flex-shrink-0 ml-4" />
          </div>
        ))}
      </CardContent>
    </Card>
  );
};

export default RecentLocations;
