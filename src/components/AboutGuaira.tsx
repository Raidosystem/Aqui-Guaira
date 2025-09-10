import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { MapPin, ExternalLink, Users, Calendar, Building2, TreePine, Camera, Waves } from '@phosphor-icons/react'

const touristAttractions = [
  {
    id: 'lago-maraca',
    name: 'Parque/Lago Maracá',
    description: 'Complexo de esporte e lazer com pistas de caminhada/ciclismo, quadras de areia, pesca e eventos como o Guaíra Open.',
    image: '/api/placeholder/300/200',
    icon: Waves,
    coordinates: { lat: -20.3186, lng: -48.3103 }
  },
  {
    id: 'escultura-tomie',
    name: 'Escultura de Tomie Ohtake',
    description: 'Obra da renomada artista nipo-brasileira Tomie Ohtake, marco cultural da cidade.',
    image: '/api/placeholder/300/200',
    icon: Camera,
    coordinates: { lat: -20.3186, lng: -48.3103 }
  },
  {
    id: 'casa-cultura',
    name: 'Casa de Cultura',
    description: 'Espaço cultural com exposições, eventos e atividades artísticas para toda a comunidade.',
    image: '/api/placeholder/300/200',
    icon: Building2,
    coordinates: { lat: -20.3186, lng: -48.3103 }
  },
  {
    id: 'jardim-japones',
    name: 'Praça São Sebastião (Jardim Japonês)',
    description: 'Área verde tranquila com elementos da cultura japonesa, ideal para contemplação e descanso.',
    image: '/api/placeholder/300/200',
    icon: TreePine,
    coordinates: { lat: -20.3186, lng: -48.3103 }
  },
  {
    id: 'balneario',
    name: 'Balneário Municipal',
    description: 'Área de lazer aquático com piscinas e estrutura para recreação familiar.',
    image: '/api/placeholder/300/200',
    icon: Waves,
    coordinates: { lat: -20.3186, lng: -48.3103 }
  },
  {
    id: 'vilarejo-guarita',
    name: 'Vilarejo Guaritá',
    description: 'Distrito rural com características históricas e paisagens naturais preservadas.',
    image: '/api/placeholder/300/200',
    icon: TreePine,
    coordinates: { lat: -20.3186, lng: -48.3103 }
  }
]

export function AboutGuaira() {
  const openInMaps = (attraction: typeof touristAttractions[0]) => {
    const url = `https://www.google.com/maps?q=${attraction.coordinates.lat},${attraction.coordinates.lng}`
    window.open(url, '_blank')
  }

  return (
    <section className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-3xl">Sobre Guaíra – SP</CardTitle>
              <CardDescription className="text-base">
                Conheça nossa cidade, sua história e características
              </CardDescription>
            </CardHeader>
            <CardContent className="prose prose-sm max-w-none">
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                    <Users className="w-5 h-5 text-primary" />
                    Dados Populacionais
                  </h3>
                  <p className="text-muted-foreground leading-relaxed">
                    Guaíra é um município do estado de São Paulo, com gentílico <strong>guairense</strong> e código IBGE <strong>3517406</strong>. 
                    No Censo 2022 o município registrou <strong>39.279 habitantes</strong> e densidade de <strong>31,21 hab/km²</strong>. 
                    A área territorial é de <strong>1.258,465 km²</strong> (IBGE). A estimativa 2024 indica cerca de <strong>40 mil habitantes</strong>.
                  </p>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-primary" />
                    Atrativos e Pontos Turísticos
                  </h3>
                  <p className="text-muted-foreground leading-relaxed mb-4">
                    Entre os atrativos locais destacam-se o <strong>Parque Ecológico/Lago Maracá</strong> — complexo de esporte e lazer 
                    com pistas de caminhada/ciclismo, quadras de areia e pesca, palco de torneios como o Guaíra Open, além de 
                    equipamentos culturais como <strong>Casa de Cultura</strong> e <strong>Museu Municipal</strong>.
                  </p>
                  <p className="text-muted-foreground leading-relaxed">
                    Outros pontos citados pelo portal da Prefeitura incluem <strong>Praça São Sebastião (Jardim Japonês)</strong>, 
                    <strong>Balneário Municipal</strong>, <strong>Zoológico</strong>, <strong>Vilarejo Guaritá</strong>, 
                    <strong>Capela do Pindoba</strong> e a <strong>Escultura de Tomie Ohtake</strong>.
                  </p>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-primary" />
                    Eventos e Festividades
                  </h3>
                  <p className="text-muted-foreground leading-relaxed">
                    A cidade realiza diversas festividades ao longo do ano, incluindo <strong>Carnaval</strong>, 
                    <strong>Festa do Peão</strong>, <strong>ECAL (Exposição Comercial, Agropecuária e Industrial de Guaíra)</strong> 
                    e festividades religiosas como a <strong>Festa de Santa Luzia</strong>.
                  </p>
                </div>

                <div className="border-t pt-6">
                  <h4 className="font-medium mb-2">Fontes:</h4>
                  <div className="text-sm text-muted-foreground space-y-1">
                    <p>• IBGE (censo/área): <a href="https://cidades.ibge.gov.br" target="_blank" className="text-primary hover:underline">Cidades IBGE</a></p>
                    <p>• Município de Guaíra: Portal oficial da Prefeitura</p>
                    <p>• Página municipal de turismo e "A Cidade"</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tourist Attractions Sidebar */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle className="text-xl flex items-center gap-2">
                <Camera className="w-5 h-5" />
                Pontos Turísticos
              </CardTitle>
              <CardDescription>
                Principais atrativos de Guaíra
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {touristAttractions.slice(0, 4).map(attraction => (
                  <div key={attraction.id} className="group cursor-pointer">
                    <div className="relative aspect-video rounded-lg overflow-hidden mb-3">
                      <img
                        src={attraction.image}
                        alt={attraction.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                      <div className="absolute bottom-2 left-2 right-2">
                        <h4 className="font-semibold text-white text-sm leading-tight">
                          {attraction.name}
                        </h4>
                      </div>
                    </div>
                    
                    <p className="text-xs text-muted-foreground leading-relaxed mb-3">
                      {attraction.description}
                    </p>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full gap-2"
                      onClick={() => openInMaps(attraction)}
                    >
                      <MapPin className="w-3 h-3" />
                      Ver no mapa
                    </Button>
                  </div>
                ))}

                {touristAttractions.length > 4 && (
                  <Button variant="ghost" className="w-full">
                    Ver todos os atrativos
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Quick Stats */}
          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="text-lg">Dados Rápidos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">População</span>
                  <span className="text-sm font-medium">39.279 hab</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Área</span>
                  <span className="text-sm font-medium">1.258,465 km²</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Densidade</span>
                  <span className="text-sm font-medium">31,21 hab/km²</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Código IBGE</span>
                  <span className="text-sm font-medium">3517406</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Gentílico</span>
                  <span className="text-sm font-medium">Guairense</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Links Úteis */}
          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="text-lg">Links Oficiais</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Button variant="outline" className="w-full justify-start gap-2" asChild>
                  <a href="https://cidades.ibge.gov.br/brasil/sp/guaira" target="_blank">
                    <ExternalLink className="w-4 h-4" />
                    IBGE Cidades
                  </a>
                </Button>
                <Button variant="outline" className="w-full justify-start gap-2" asChild>
                  <a href="#" target="_blank">
                    <ExternalLink className="w-4 h-4" />
                    Portal da Prefeitura
                  </a>
                </Button>
                <Button variant="outline" className="w-full justify-start gap-2" asChild>
                  <a href="#" target="_blank">
                    <ExternalLink className="w-4 h-4" />
                    Câmara Municipal
                  </a>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  )
}