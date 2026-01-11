import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  MapPin, 
  ArrowLeft, 
  Search, 
  Building2, 
  Hospital, 
  Trash2, 
  Phone, 
  Clock, 
  AlertCircle,
  Home,
  School,
  ShoppingBag,
  Briefcase,
  Activity
} from "lucide-react";

// Lista de todos os bairros de Guaíra
const BAIRROS = [
  { slug: "aniceto-carlos-nogueira", nome_exibicao: "Aniceto Carlos Nogueira" },
  { slug: "associacao-nipo-brasileira", nome_exibicao: "Associação Nipo-Brasileira" },
  { slug: "campos-eliseos", nome_exibicao: "Campos Elíseos" },
  { slug: "centro", nome_exibicao: "Centro" },
  { slug: "conjunto-habitacional-abdala-elias", nome_exibicao: "Conjunto Habitacional Abdala Elias" },
  { slug: "conjunto-habitacional-gabriel-garcia-de-carvalho", nome_exibicao: "Conjunto Habitacional Gabriel Garcia de Carvalho" },
  { slug: "conjunto-habitacional-geralda-geltrudes-da-silva", nome_exibicao: "Conjunto Habitacional Geralda Geltrudes da Silva" },
  { slug: "conjunto-habitacional-padre-mario-lano", nome_exibicao: "Conjunto Habitacional Padre Mário Lano" },
  { slug: "conjunto-residencial-antonio-garcia", nome_exibicao: "Conjunto Residencial Antônio Garcia" },
  { slug: "desmembramento-barros", nome_exibicao: "Desmembramento Barros" },
  { slug: "desmembramento-chacara-bela-vista", nome_exibicao: "Desmembramento Chácara Bela Vista" },
  { slug: "desmembramento-chacara-delfim", nome_exibicao: "Desmembramento Chácara Delfim" },
  { slug: "desmembramento-chacara-nossa-senhora", nome_exibicao: "Desmembramento Chácara Nossa Senhora" },
  { slug: "desmembramento-chacara-santa-quiteria", nome_exibicao: "Desmembramento Chácara Santa Quitéria" },
  { slug: "desmembramento-fazenda-antas", nome_exibicao: "Desmembramento Fazenda Antas" },
  { slug: "desmembramento-fazenda-sao-judas-tadeu", nome_exibicao: "Desmembramento Fazenda São Judas Tadeu" },
  { slug: "desmembramento-katsumi-miura", nome_exibicao: "Desmembramento Katsumi Miura" },
  { slug: "desmembramento-reis-e-marques", nome_exibicao: "Desmembramento Reis e Marques" },
  { slug: "desmembramento-recreio-santa-isabel", nome_exibicao: "Desmembramento Recreio Santa Isabel" },
  { slug: "desmembramento-rialga", nome_exibicao: "Desmembramento Rialga" },
  { slug: "desmembramento-santa-elydia", nome_exibicao: "Desmembramento Santa Elýdia" },
  { slug: "desmembramento-santo-antonio", nome_exibicao: "Desmembramento Santo Antônio" },
  { slug: "desmembramento-sao-francisco", nome_exibicao: "Desmembramento São Francisco" },
  { slug: "distrito-industrial-i", nome_exibicao: "Distrito Industrial I" },
  { slug: "distrito-industrial-luiz-carlos-nogueira", nome_exibicao: "Distrito Industrial Luiz Carlos Nogueira" },
  { slug: "doutor-fabio-talarico", nome_exibicao: "Doutor Fábio Talarico" },
  { slug: "etelvina-santana-da-silva", nome_exibicao: "Etelvina Santana da Silva" },
  { slug: "estancia-morada-nova", nome_exibicao: "Estância Morada Nova" },
  { slug: "industrial", nome_exibicao: "Industrial" },
  { slug: "jardim-alegria", nome_exibicao: "Jardim Alegria" },
  { slug: "jardim-california", nome_exibicao: "Jardim Califórnia" },
  { slug: "jardim-das-acacias", nome_exibicao: "Jardim das Acácias" },
  { slug: "jardim-eldorado", nome_exibicao: "Jardim Eldorado" },
  { slug: "jardim-eliza", nome_exibicao: "Jardim Eliza" },
  { slug: "jardim-ligia", nome_exibicao: "Jardim Lígia" },
  { slug: "jardim-ligia-ii", nome_exibicao: "Jardim Lígia II" },
  { slug: "jardim-palmares", nome_exibicao: "Jardim Palmares" },
  { slug: "jardim-paulista", nome_exibicao: "Jardim Paulista" },
  { slug: "jardim-sao-francisco-i", nome_exibicao: "Jardim São Francisco I" },
  { slug: "jardim-solaris", nome_exibicao: "Jardim Solaris" },
  { slug: "joao-vaccaro", nome_exibicao: "João Vaccaro" },
  { slug: "joaquim-pereira-lelis", nome_exibicao: "Joaquim Pereira Lelis" },
  { slug: "loteamento-sao-jose", nome_exibicao: "Loteamento São José" },
  { slug: "maraca", nome_exibicao: "Maracá" },
  { slug: "morada-do-sol", nome_exibicao: "Morada do Sol" },
  { slug: "paranoa", nome_exibicao: "Paranoá" },
  { slug: "portal-do-lago", nome_exibicao: "Portal do Lago" },
  { slug: "recreio-sao-bernardo", nome_exibicao: "Recreio São Bernardo" },
  { slug: "residencial-antonio-manoel-da-silva", nome_exibicao: "Residencial Antônio Manoel da Silva" },
  { slug: "residencial-cidade-jardim", nome_exibicao: "Residencial Cidade Jardim" },
  { slug: "residencial-dona-ira", nome_exibicao: "Residencial Dona Ira" },
  { slug: "residencial-dr-orlando-garcia-junqueira", nome_exibicao: "Residencial Dr. Orlando Garcia Junqueira" },
  { slug: "residencial-julieta", nome_exibicao: "Residencial Julieta" },
  { slug: "residencial-maria-luiza", nome_exibicao: "Residencial Maria Luiza" },
  { slug: "residencial-nadia", nome_exibicao: "Residencial Nádia" },
  { slug: "residencial-nadia-iv", nome_exibicao: "Residencial Nádia IV" },
  { slug: "residencial-nautico-e-pesca-rio-pardo", nome_exibicao: "Residencial Náutico e Pesca Rio Pardo" },
  { slug: "residencial-nobre-ville", nome_exibicao: "Residencial Nobre Ville" },
  { slug: "residencial-nova-guaira", nome_exibicao: "Residencial Nova Guaíra" },
  { slug: "residencial-portinari", nome_exibicao: "Residencial Portinari" },
  { slug: "residencial-r-guimaraes", nome_exibicao: "Residencial R. Guimarães" },
  { slug: "residencial-reynaldo-stein", nome_exibicao: "Residencial Reynaldo Stein" },
  { slug: "residencial-santa-terezinha", nome_exibicao: "Residencial Santa Terezinha" },
  { slug: "residencial-tais", nome_exibicao: "Residencial Taís" },
  { slug: "residencial-thobias-landim", nome_exibicao: "Residencial Thobias Landim" },
  { slug: "residencial-zenaide", nome_exibicao: "Residencial Zenaide" },
  { slug: "santa-helena", nome_exibicao: "Santa Helena" },
  { slug: "terra-do-sol", nome_exibicao: "Terra do Sol" },
  { slug: "vila-miguel-fabiano", nome_exibicao: "Vila Miguel Fabiano" },
  { slug: "vila-nossa-senhora-aparecida", nome_exibicao: "Vila Nossa Senhora Aparecida" },
  { slug: "vila-sao-bom-jesus-lapa", nome_exibicao: "Vila São Bom Jesus Lapa" },
  { slug: "vivendas-do-bom-jardim", nome_exibicao: "Vivendas do Bom Jardim" }
];

// Dados de serviços por bairro (mock - você pode integrar com o banco)
const SERVICOS_BAIRRO: Record<string, any> = {
  "centro": {
    saude: [
      {
        nome: "Santa Casa de Misericórdia de Guaíra",
        tipo: "Hospital",
        endereco: "Rua Francisco Fachini, 550",
        telefone: "(17) 3331-9200",
        horario: "24 horas",
        servicos: ["Pronto Socorro", "Internação", "Cirurgias", "Maternidade"]
      },
      {
        nome: "UPA 24h",
        tipo: "Pronto Atendimento",
        endereco: "Av. Dom Pedro I, 1234",
        telefone: "(17) 3331-5000",
        horario: "24 horas",
        servicos: ["Urgência e Emergência", "Raio-X", "Medicação"]
      }
    ],
    coleta_lixo: {
      dias: "Segunda, Quarta e Sexta",
      horario: "06:00 às 12:00",
      tipo_coleta: ["Domiciliar", "Reciclável (Terça)"]
    },
    servicos_publicos: [
      {
        nome: "Prefeitura Municipal",
        endereco: "Praça Dr. Jayme de Moraes, 100",
        telefone: "(17) 3331-9100",
        horario: "08:00 às 17:00"
      },
      {
        nome: "Câmara Municipal",
        endereco: "Rua 7 de Setembro, 456",
        telefone: "(17) 3331-2200",
        horario: "08:00 às 18:00"
      }
    ],
    comercio: ["Supermercados", "Farmácias", "Bancos", "Restaurantes", "Lojas diversas"]
  },
  "jardim-california": {
    saude: [
      {
        nome: "UBS Jardim Califórnia",
        tipo: "Unidade Básica de Saúde",
        endereco: "Rua das Flores, 890",
        telefone: "(17) 3331-4500",
        horario: "07:00 às 16:00",
        servicos: ["Consultas", "Vacinas", "Curativos", "Preventivo"]
      }
    ],
    coleta_lixo: {
      dias: "Terça, Quinta e Sábado",
      horario: "07:00 às 13:00",
      tipo_coleta: ["Domiciliar", "Reciclável (Quarta)"]
    },
    servicos_publicos: [
      {
        nome: "EMEI Jardim Califórnia",
        endereco: "Rua dos Lírios, 234",
        telefone: "(17) 3331-6700",
        horario: "07:00 às 17:00"
      }
    ],
    comercio: ["Padarias", "Mercados", "Farmácia"]
  }
};

// Função para obter serviços (mock - substitua por busca no banco)
const getServicosBairro = (slug: string) => {
  return SERVICOS_BAIRRO[slug] || {
    saude: [],
    coleta_lixo: {
      dias: "Segunda, Quarta e Sexta",
      horario: "06:00 às 12:00",
      tipo_coleta: ["Domiciliar"]
    },
    servicos_publicos: [],
    comercio: []
  };
};

export default function ServicosPorBairro() {
  const [bairroSelecionado, setBairroSelecionado] = useState<string | null>(null);
  const [busca, setBusca] = useState("");

  // Filtrar bairros pela busca
  const bairrosFiltrados = BAIRROS.filter(b =>
    b.nome_exibicao.toLowerCase().includes(busca.toLowerCase())
  );

  // Se um bairro está selecionado, mostrar detalhes
  if (bairroSelecionado) {
    const bairro = BAIRROS.find(b => b.slug === bairroSelecionado);
    const servicos = getServicosBairro(bairroSelecionado);

    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-green-600 text-white py-8 shadow-lg">
          <div className="container mx-auto px-4">
            <div className="flex gap-2 mb-4">
              <Button
                variant="ghost"
                className="text-white hover:bg-white/20"
                onClick={() => setBairroSelecionado(null)}
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Voltar para Bairros
              </Button>
              <Button
                variant="ghost"
                className="text-white hover:bg-white/20"
                onClick={() => window.location.href = '/'}
              >
                <Home className="w-4 h-4 mr-2" />
                Página Inicial
              </Button>
            </div>
            <div className="flex items-center gap-3">
              <MapPin className="w-8 h-8" />
              <div>
                <h1 className="text-3xl font-bold">{bairro?.nome_exibicao}</h1>
                <p className="text-blue-100">Serviços disponíveis no bairro</p>
              </div>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 py-8">
          {/* Saúde */}
          {servicos.saude && servicos.saude.length > 0 && (
            <section className="mb-8">
              <div className="flex items-center gap-2 mb-4">
                <Hospital className="w-6 h-6 text-red-600" />
                <h2 className="text-2xl font-bold text-gray-800">Saúde</h2>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                {servicos.saude.map((unidade: any, idx: number) => (
                  <Card key={idx} className="hover:shadow-lg transition-shadow">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <CardTitle className="text-lg">{unidade.nome}</CardTitle>
                        <Badge variant="outline" className="bg-red-50 text-red-700">
                          {unidade.tipo}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <div className="flex items-start gap-2 text-sm">
                        <MapPin className="w-4 h-4 text-gray-500 mt-0.5 flex-shrink-0" />
                        <span className="text-gray-700">{unidade.endereco}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Phone className="w-4 h-4 text-gray-500 flex-shrink-0" />
                        <a href={`tel:${unidade.telefone}`} className="text-blue-600 hover:underline">
                          {unidade.telefone}
                        </a>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Clock className="w-4 h-4 text-gray-500 flex-shrink-0" />
                        <span className="text-gray-700">{unidade.horario}</span>
                      </div>
                      {unidade.servicos && (
                        <div className="mt-3 flex flex-wrap gap-1">
                          {unidade.servicos.map((serv: string, i: number) => (
                            <Badge key={i} variant="secondary" className="text-xs">
                              {serv}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </section>
          )}

          {/* Coleta de Lixo */}
          {servicos.coleta_lixo && (
            <section className="mb-8">
              <div className="flex items-center gap-2 mb-4">
                <Trash2 className="w-6 h-6 text-green-600" />
                <h2 className="text-2xl font-bold text-gray-800">Coleta de Lixo</h2>
              </div>
              <Card className="bg-gradient-to-r from-green-50 to-emerald-50">
                <CardContent className="pt-6">
                  <div className="grid gap-4 md:grid-cols-3">
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <Clock className="w-5 h-5 text-green-600" />
                        <span className="font-semibold text-gray-700">Dias de Coleta</span>
                      </div>
                      <p className="text-gray-600">{servicos.coleta_lixo.dias}</p>
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <AlertCircle className="w-5 h-5 text-green-600" />
                        <span className="font-semibold text-gray-700">Horário</span>
                      </div>
                      <p className="text-gray-600">{servicos.coleta_lixo.horario}</p>
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <Trash2 className="w-5 h-5 text-green-600" />
                        <span className="font-semibold text-gray-700">Tipo</span>
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {servicos.coleta_lixo.tipo_coleta.map((tipo: string, i: number) => (
                          <Badge key={i} className="bg-green-600">
                            {tipo}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </section>
          )}

          {/* Serviços Públicos */}
          {servicos.servicos_publicos && servicos.servicos_publicos.length > 0 && (
            <section className="mb-8">
              <div className="flex items-center gap-2 mb-4">
                <Building2 className="w-6 h-6 text-blue-600" />
                <h2 className="text-2xl font-bold text-gray-800">Serviços Públicos</h2>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                {servicos.servicos_publicos.map((servico: any, idx: number) => (
                  <Card key={idx} className="hover:shadow-lg transition-shadow">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Building2 className="w-5 h-5 text-blue-600" />
                        {servico.nome}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <div className="flex items-start gap-2 text-sm">
                        <MapPin className="w-4 h-4 text-gray-500 mt-0.5 flex-shrink-0" />
                        <span className="text-gray-700">{servico.endereco}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Phone className="w-4 h-4 text-gray-500 flex-shrink-0" />
                        <a href={`tel:${servico.telefone}`} className="text-blue-600 hover:underline">
                          {servico.telefone}
                        </a>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Clock className="w-4 h-4 text-gray-500 flex-shrink-0" />
                        <span className="text-gray-700">{servico.horario}</span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </section>
          )}

          {/* Comércio */}
          {servicos.comercio && servicos.comercio.length > 0 && (
            <section className="mb-8">
              <div className="flex items-center gap-2 mb-4">
                <ShoppingBag className="w-6 h-6 text-purple-600" />
                <h2 className="text-2xl font-bold text-gray-800">Comércio Local</h2>
              </div>
              <Card className="bg-gradient-to-r from-purple-50 to-pink-50">
                <CardContent className="pt-6">
                  <div className="flex flex-wrap gap-2">
                    {servicos.comercio.map((item: string, idx: number) => (
                      <Badge key={idx} variant="outline" className="bg-white text-purple-700 border-purple-300">
                        {item}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </section>
          )}

          {/* Mensagem se não houver serviços */}
          {(!servicos.saude || servicos.saude.length === 0) &&
           (!servicos.servicos_publicos || servicos.servicos_publicos.length === 0) &&
           (!servicos.comercio || servicos.comercio.length === 0) && (
            <Card className="bg-yellow-50 border-yellow-200">
              <CardContent className="pt-6 text-center">
                <AlertCircle className="w-12 h-12 text-yellow-600 mx-auto mb-3" />
                <h3 className="text-lg font-semibold text-gray-800 mb-2">
                  Informações em atualização
                </h3>
                <p className="text-gray-600">
                  Estamos coletando os dados dos serviços disponíveis neste bairro.
                  Em breve teremos todas as informações atualizadas.
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    );
  }

  // Tela de listagem de bairros
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-green-600 text-white py-12 shadow-lg">
        <div className="container mx-auto px-4">
          {/* Botões de Navegação */}
          <div className="flex gap-2 mb-6">
            <Button
              variant="ghost"
              onClick={() => window.history.back()}
              className="text-white hover:bg-white/20 gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Voltar
            </Button>
            <Button
              variant="ghost"
              onClick={() => window.location.href = '/'}
              className="text-white hover:bg-white/20 gap-2"
            >
              <Home className="w-4 h-4" />
              Página Inicial
            </Button>
          </div>
          
          <div className="flex items-center gap-3 mb-4">
            <MapPin className="w-10 h-10" />
            <div>
              <h1 className="text-4xl font-bold">Serviços por Bairro</h1>
              <p className="text-blue-100 text-lg">
                Encontre serviços de saúde, coleta de lixo e mais em cada bairro de Guaíra
              </p>
            </div>
          </div>

          {/* Barra de busca */}
          <div className="relative mt-6 max-w-2xl">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <Input
              type="text"
              placeholder="Buscar bairro..."
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              className="pl-10 py-6 text-lg bg-white/95 backdrop-blur"
            />
          </div>
        </div>
      </div>

      {/* Grid de Bairros */}
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6 flex items-center justify-between">
          <p className="text-gray-600">
            <span className="font-semibold text-gray-800">{bairrosFiltrados.length}</span> bairros encontrados
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {bairrosFiltrados.map((bairro) => (
            <Card
              key={bairro.slug}
              className="group hover:shadow-xl transition-all duration-300 cursor-pointer hover:-translate-y-1 border-2 hover:border-blue-300"
              onClick={() => setBairroSelecionado(bairro.slug)}
            >
              <CardContent className="pt-6">
                <div className="flex items-start gap-3">
                  <div className="p-3 bg-gradient-to-br from-blue-500 to-green-500 rounded-lg group-hover:scale-110 transition-transform">
                    <Home className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-800 group-hover:text-blue-600 transition-colors mb-1">
                      {bairro.nome_exibicao}
                    </h3>
                    <p className="text-sm text-gray-500">Ver serviços →</p>
                  </div>
                </div>

                {/* Preview de serviços disponíveis */}
                <div className="mt-4 flex flex-wrap gap-2">
                  {SERVICOS_BAIRRO[bairro.slug]?.saude?.length > 0 && (
                    <Badge variant="secondary" className="text-xs">
                      <Activity className="w-3 h-3 mr-1" />
                      Saúde
                    </Badge>
                  )}
                  <Badge variant="secondary" className="text-xs">
                    <Trash2 className="w-3 h-3 mr-1" />
                    Coleta
                  </Badge>
                  {SERVICOS_BAIRRO[bairro.slug]?.servicos_publicos?.length > 0 && (
                    <Badge variant="secondary" className="text-xs">
                      <Building2 className="w-3 h-3 mr-1" />
                      Serviços
                    </Badge>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {bairrosFiltrados.length === 0 && (
          <div className="text-center py-12">
            <MapPin className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-700 mb-2">
              Nenhum bairro encontrado
            </h3>
            <p className="text-gray-500">
              Tente buscar com outro termo
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
