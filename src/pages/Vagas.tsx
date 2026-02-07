import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
    Briefcase,
    Search,
    MapPin,
    Clock,
    DollarSign,
    Building2,
    ArrowLeft,
    Home,
    Loader2,
    Calendar,
    AlertCircle
} from "lucide-react";
import { buscarVagas, Vaga } from "@/lib/supabase";

const Vagas = () => {
    const navigate = useNavigate();
    const [vagas, setVagas] = useState<Vaga[]>([]);
    const [loading, setLoading] = useState(true);
    const [busca, setBusca] = useState("");
    const [filtroTipo, setFiltroTipo] = useState("todos");

    useEffect(() => {
        carregarVagas();
        window.scrollTo(0, 0);
    }, []);

    const carregarVagas = async () => {
        setLoading(true);
        try {
            const data = await buscarVagas();
            // @ts-ignore
            setVagas(data || []);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const vagasFiltradas = vagas.filter((vaga) => {
        const matchBusca =
            vaga.titulo.toLowerCase().includes(busca.toLowerCase()) ||
            vaga.descricao.toLowerCase().includes(busca.toLowerCase()) ||
            vaga.empresas?.nome.toLowerCase().includes(busca.toLowerCase());

        const matchTipo = filtroTipo === "todos" || vaga.tipo === filtroTipo;

        return matchBusca && matchTipo;
    });

    const getTipoBadge = (tipo: string) => {
        switch (tipo) {
            case "CLT":
                return <Badge className="bg-blue-500 hover:bg-blue-600">CLT</Badge>;
            case "PJ":
                return <Badge className="bg-purple-500 hover:bg-purple-600">PJ</Badge>;
            case "Estágio":
                return <Badge className="bg-green-500 hover:bg-green-600">Estágio</Badge>;
            case "Freelance":
                return <Badge className="bg-orange-500 hover:bg-orange-600">Freelance</Badge>;
            default:
                return <Badge variant="secondary">{tipo}</Badge>;
        }
    };

    return (
        <>
            <Header />
            <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
                {/* Hero Section */}
                <section className="relative overflow-hidden bg-gradient-to-br from-primary/10 via-background to-primary/5 border-b">
                    <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
                    <div className="container mx-auto px-4 py-12 relative">
                        <div className="flex gap-2 mb-6">
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

                        <div className="max-w-5xl mx-auto space-y-6 text-center">
                            <div className="inline-flex p-3 bg-primary/10 rounded-2xl mb-2">
                                <Briefcase className="w-8 h-8 text-primary" />
                            </div>
                            <h1 className="text-4xl md:text-6xl font-black tracking-tight text-foreground leading-[1.1]">
                                Vagas de Emprego em <span className="gradient-text">Guaíra-SP</span>
                            </h1>
                            <p className="text-lg md:text-xl text-muted-foreground font-medium max-w-2xl mx-auto">
                                Confira as oportunidades disponíveis na cidade e região. Encontre seu próximo emprego aqui.
                            </p>

                            {/* Barra de Busca */}
                            <div className="max-w-2xl mx-auto mt-8">
                                <div className="relative">
                                    <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                                    <Input
                                        value={busca}
                                        onChange={(e) => setBusca(e.target.value)}
                                        placeholder="Busque por cargo, empresa ou palavra-chave..."
                                        className="pl-12 py-6 text-lg rounded-2xl border-2 focus:border-primary shadow-lg"
                                    />
                                </div>
                            </div>

                            {/* Filtros de Tipo */}
                            <div className="flex flex-wrap justify-center gap-2 mt-4">
                                {["todos", "CLT", "PJ", "Estágio", "Freelance"].map((tipo) => (
                                    <Button
                                        key={tipo}
                                        variant={filtroTipo === tipo ? "default" : "outline"}
                                        onClick={() => setFiltroTipo(tipo)}
                                        className="rounded-xl capitalize"
                                        size="sm"
                                    >
                                        {tipo}
                                    </Button>
                                ))}
                            </div>
                        </div>
                    </div>
                </section>

                {/* Lista de Vagas */}
                <section className="container mx-auto px-4 py-12">
                    {loading ? (
                        <div className="py-20 text-center">
                            <Loader2 className="w-10 h-10 animate-spin text-primary mx-auto mb-4" />
                            <p className="text-muted-foreground">Carregando vagas...</p>
                        </div>
                    ) : vagasFiltradas.length === 0 ? (
                        <Card className="max-w-2xl mx-auto bg-gradient-to-br from-primary/5 to-background border-none shadow-lg">
                            <CardContent className="p-12 text-center space-y-6">
                                <div className="inline-flex p-4 bg-primary/10 rounded-full">
                                    <AlertCircle className="w-12 h-12 text-primary" />
                                </div>
                                <div className="space-y-2">
                                    <h3 className="text-xl font-bold">Nenhuma vaga encontrada</h3>
                                    <p className="text-muted-foreground">
                                        Não encontramos vagas com os filtros selecionados no momento. Tente buscar por outros termos.
                                    </p>
                                </div>
                            </CardContent>
                        </Card>
                    ) : (
                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {vagasFiltradas.map((vaga) => (
                                <Card
                                    key={vaga.id}
                                    className="group hover:shadow-xl transition-all duration-300 border-zinc-200 dark:border-zinc-800 overflow-hidden flex flex-col"
                                >
                                    <CardContent className="p-6 flex flex-col h-full">
                                        <div className="flex justify-between items-start mb-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-12 h-12 rounded-xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center shrink-0 border border-zinc-200 dark:border-zinc-700">
                                                    {vaga.empresas?.logo ? (
                                                        <img
                                                            src={vaga.empresas.logo}
                                                            alt={vaga.empresas.nome}
                                                            className="w-full h-full object-cover rounded-xl"
                                                        />
                                                    ) : (
                                                        <Building2 className="w-6 h-6 text-muted-foreground" />
                                                    )}
                                                </div>
                                                <div>
                                                    <h3 className="font-bold text-lg leading-tight line-clamp-2" title={vaga.titulo}>
                                                        {vaga.titulo}
                                                    </h3>
                                                    <p className="text-sm font-medium text-muted-foreground">
                                                        {vaga.empresas?.nome || "Empresa Confidencial"}
                                                    </p>
                                                </div>
                                            </div>
                                            {getTipoBadge(vaga.tipo)}
                                        </div>

                                        <div className="space-y-3 mb-6 flex-grow">
                                            <div className="flex items-center gap-2 text-sm text-zinc-600 dark:text-zinc-400">
                                                <MapPin className="w-4 h-4 shrink-0" />
                                                <span>Guaíra - SP</span>
                                            </div>
                                            {vaga.salario && (
                                                <div className="flex items-center gap-2 text-sm text-zinc-600 dark:text-zinc-400">
                                                    <DollarSign className="w-4 h-4 shrink-0" />
                                                    <span>{vaga.salario}</span>
                                                </div>
                                            )}
                                            <div className="flex items-center gap-2 text-sm text-zinc-600 dark:text-zinc-400">
                                                <Calendar className="w-4 h-4 shrink-0" />
                                                <span>Publicada em {new Date(vaga.created_at).toLocaleDateString()}</span>
                                            </div>

                                            <p className="text-sm text-muted-foreground line-clamp-3 mt-2">
                                                {vaga.descricao}
                                            </p>
                                        </div>

                                        {vaga.empresas?.whatsapp ? (
                                            <Button asChild className="w-full font-bold shadow-lg shadow-green-500/20 bg-green-600 hover:bg-green-700 text-white group-hover:scale-[1.02] transition-transform">
                                                <a
                                                    href={`https://wa.me/${vaga.empresas.whatsapp.replace(/\D/g, '')}?text=${encodeURIComponent(`Olá, vi a vaga de ${vaga.titulo} no Aqui Guaíra e gostaria de me candidatar.`)}`}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                >
                                                    Candidatar-se via WhatsApp
                                                </a>
                                            </Button>
                                        ) : (
                                            <Button disabled className="w-full font-bold opacity-50 cursor-not-allowed">
                                                Contato indisponível
                                            </Button>
                                        )}
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    )}
                </section>
            </div>
            <Footer />
        </>
    );
};

export default Vagas;
