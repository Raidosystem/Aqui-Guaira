import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Home,
  Search,
  Wrench,
  Droplet,
  Zap,
  Hammer,
  PaintBucket,
  Scissors,
  Laptop,
  Car,
  Shirt,
  Utensils,
  Wind,
  Sparkles,
  ArrowLeft,
} from "lucide-react";

const AquiResolve = () => {
  const navigate = useNavigate();
  const [busca, setBusca] = useState("");
  const [categoriaFiltro, setCategoriaFiltro] = useState("todas");

  const categorias = [
    { nome: "Encanador", icon: Droplet, cor: "text-blue-600", bgCor: "bg-blue-50 dark:bg-blue-950" },
    { nome: "Eletricista", icon: Zap, cor: "text-yellow-600", bgCor: "bg-yellow-50 dark:bg-yellow-950" },
    { nome: "Pedreiro", icon: Hammer, cor: "text-orange-600", bgCor: "bg-orange-50 dark:bg-orange-950" },
    { nome: "Pintor", icon: PaintBucket, cor: "text-purple-600", bgCor: "bg-purple-50 dark:bg-purple-950" },
    { nome: "Marceneiro", icon: Wrench, cor: "text-amber-600", bgCor: "bg-amber-50 dark:bg-amber-950" },
    { nome: "Cabelereiro", icon: Scissors, cor: "text-pink-600", bgCor: "bg-pink-50 dark:bg-pink-950" },
    { nome: "Costureira", icon: Shirt, cor: "text-teal-600", bgCor: "bg-teal-50 dark:bg-teal-950" },
    { nome: "Cozinheiro", icon: Utensils, cor: "text-green-600", bgCor: "bg-green-50 dark:bg-green-950" },
    { nome: "Climatização", icon: Wind, cor: "text-cyan-600", bgCor: "bg-cyan-50 dark:bg-cyan-950" },
    { nome: "Diarista", icon: Sparkles, cor: "text-violet-600", bgCor: "bg-violet-50 dark:bg-violet-950" },
  ];

  const profissionais: any[] = [];

  const profissionaisFiltrados = profissionais.filter((prof) => {
    const matchBusca = prof.nome.toLowerCase().includes(busca.toLowerCase()) ||
                       prof.categoria.toLowerCase().includes(busca.toLowerCase());
    const matchCategoria = categoriaFiltro === "todas" || prof.categoria === categoriaFiltro;
    return matchBusca && matchCategoria;
  });

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <>
      <Header />
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
        {/* Hero Section */}
        <section className="relative overflow-hidden bg-gradient-to-br from-primary/10 via-background to-primary/5 border-b">
          <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
          <div className="container mx-auto px-4 py-16 relative">
            <div className="flex gap-2 mb-8">
              <Button
                onClick={() => navigate(-1)}
                className="gap-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg px-6"
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

            <div className="max-w-4xl mx-auto text-center space-y-6">
              <div className="inline-flex p-3 bg-primary/10 rounded-2xl mb-2">
                <Wrench className="w-8 h-8 text-primary" />
              </div>
              <h1 className="text-4xl md:text-6xl font-black tracking-tight text-foreground leading-[1.1]">
                Aqui <span className="gradient-text">Resolve</span>
              </h1>
              <p className="text-lg md:text-xl text-muted-foreground font-medium max-w-2xl mx-auto">
                Encontre profissionais de confiança em Guaíra.
              </p>
            </div>
          </div>
        </section>

      {/* Categorias em Grid */}
      <section className="container mx-auto px-4 py-12">
        <h2 className="text-2xl font-bold mb-6">Categorias de Serviços</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {categorias.map((cat) => {
            const Icon = cat.icon;
            return (
              <Card
                key={cat.nome}
                className={`cursor-pointer transition-all hover:shadow-lg hover:scale-105 ${
                  categoriaFiltro === cat.nome ? 'ring-2 ring-primary' : ''
                }`}
                onClick={() => setCategoriaFiltro(categoriaFiltro === cat.nome ? 'todas' : cat.nome)}
              >
                <CardContent className={`p-6 text-center space-y-3 ${cat.bgCor}`}>
                  <div className="flex justify-center">
                    <Icon className={`w-8 h-8 ${cat.cor}`} />
                  </div>
                  <h3 className="font-semibold text-sm leading-tight">{cat.nome}</h3>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </section>

      {/* Filtros e Busca */}
      <section className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="p-6">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Buscar Profissional</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input
                    value={busca}
                    onChange={(e) => setBusca(e.target.value)}
                    placeholder="Nome ou categoria..."
                    className="pl-10"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Filtrar por Categoria</Label>
                <Select value={categoriaFiltro} onValueChange={setCategoriaFiltro}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todas">Todas as Categorias</SelectItem>
                    {categorias.map((cat) => (
                      <SelectItem key={cat.nome} value={cat.nome}>
                        {cat.nome}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Lista de Profissionais */}
      <section className="container mx-auto px-4 pb-16">
        <h2 className="text-2xl font-bold mb-6">
          Profissionais Encontrados ({profissionaisFiltrados.length})
        </h2>

        {profissionaisFiltrados.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <Search className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">
                Nenhum profissional encontrado com os filtros selecionados.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {profissionaisFiltrados.map((prof) => {
              const categoria = categorias.find((c) => c.nome === prof.categoria);
              const Icon = categoria?.icon || Wrench;
              
              return (
                <Card key={prof.id} className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-6 space-y-4">
                    <div className="flex items-start gap-4">
                      <div className={`p-3 rounded-xl ${categoria?.bgCor}`}>
                        <Icon className={`w-6 h-6 ${categoria?.cor}`} />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-bold text-lg">{prof.nome}</h3>
                        <p className="text-sm text-muted-foreground">{prof.categoria}</p>
                      </div>
                    </div>

                    <p className="text-sm text-muted-foreground">{prof.descricao}</p>

                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Telefone:</span>
                        <span className="font-medium">{prof.telefone}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Disponibilidade:</span>
                        <span className="font-medium">{prof.disponibilidade}</span>
                      </div>
                    </div>

                    <Button className="w-full" asChild>
                      <a href={`tel:${prof.telefone.replace(/\D/g, '')}`}>
                        Entrar em Contato
                      </a>
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </section>

      {/* CTA Section */}
      <section className="bg-primary/5 border-y py-12">
        <div className="container mx-auto px-4 text-center space-y-6">
          <h2 className="text-3xl font-bold">Você é um profissional?</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Cadastre-se gratuitamente e seja encontrado por clientes em Guaíra.
          </p>
          <Button size="lg" className="font-bold">
            Cadastrar Meu Serviço
          </Button>
        </div>
      </section>
    </div>
    <Footer />
    </>
  );
};

export default AquiResolve;
