import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useKV } from '@github/spark/hooks'
import { toast } from 'sonner'
import { 
  Building, 
  Eye, 
  Calendar,
  TrendUp,
  Phone,
  MapPin,
  Heart,
  Star,
  Clock,
  Users,
  MessageCircle,
  CheckCircle
} from '@phosphor-icons/react'

interface BusinessStats {
  views: number
  favorites: number
  contacts: number
  lastViewed?: string
  rating?: number
  reviewCount?: number
}

export function BusinessInsights() {
  const [user, setUser] = useState<any>(null)
  const [companies] = useKV<any[]>('companies', [])
  const [businessStats] = useKV<{ [key: string]: BusinessStats }>('business_stats', {})
  const [myBusinesses, setMyBusinesses] = useState<any[]>([])
  const [selectedBusiness, setSelectedBusiness] = useState<any>(null)

  useEffect(() => {
    const checkUser = async () => {
      try {
        const currentUser = await spark.user()
        setUser(currentUser)
        
        // Filter businesses owned by current user
        const userBusinesses = companies.filter(company => 
          company.ownerId === currentUser.id || company.ownerEmail === currentUser.email
        )
        setMyBusinesses(userBusinesses)
        
        if (userBusinesses.length > 0 && !selectedBusiness) {
          setSelectedBusiness(userBusinesses[0])
        }
      } catch (error) {
        console.error('Error checking user:', error)
      }
    }
    checkUser()
  }, [companies])

  const getBusinessStats = (businessId: string): BusinessStats => {
    return businessStats[businessId] || {
      views: 0,
      favorites: 0,
      contacts: 0,
      rating: 0,
      reviewCount: 0
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'bg-green-100 text-green-800 border-green-200'
      case 'pending_approval': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'rejected': return 'bg-red-100 text-red-800 border-red-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const generateInsights = (business: any, stats: BusinessStats) => {
    const insights = []
    
    if (stats.views < 10) {
      insights.push({
        type: 'tip',
        title: 'Aumente sua visibilidade',
        description: 'Adicione mais fotos e complete todas as informações para aparecer mais nas buscas.',
        icon: TrendUp,
        color: 'text-blue-600'
      })
    }
    
    if (!business.logo) {
      insights.push({
        type: 'suggestion',
        title: 'Adicione um logo',
        description: 'Empresas com logo recebem 40% mais cliques.',
        icon: Building,
        color: 'text-purple-600'
      })
    }
    
    if (!business.images || business.images.length < 3) {
      insights.push({
        type: 'suggestion',
        title: 'Adicione mais fotos',
        description: 'Pelo menos 3 fotos aumentam a confiança dos clientes.',
        icon: Eye,
        color: 'text-green-600'
      })
    }
    
    if (!business.whatsapp) {
      insights.push({
        type: 'tip',
        title: 'Configure WhatsApp',
        description: 'WhatsApp é o meio de contato preferido dos clientes.',
        icon: MessageCircle,
        color: 'text-green-600'
      })
    }
    
    return insights
  }

  if (!user || myBusinesses.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="flex items-center justify-center py-12">
            <div className="text-center">
              <Building className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Nenhuma empresa encontrada</h3>
              <p className="text-muted-foreground">Cadastre uma empresa para ver estatísticas e insights</p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Insights e Estatísticas</h1>
        <p className="text-muted-foreground">Acompanhe o desempenho das suas empresas no portal</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Business List Sidebar */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Suas Empresas</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {myBusinesses.map((business) => {
                const stats = getBusinessStats(business.id)
                return (
                  <Button
                    key={business.id}
                    variant={selectedBusiness?.id === business.id ? "default" : "ghost"}
                    className="w-full justify-start h-auto p-4"
                    onClick={() => setSelectedBusiness(business)}
                  >
                    <div className="text-left w-full">
                      <div className="font-medium truncate">{business.name}</div>
                      <div className="flex items-center justify-between mt-1">
                        <Badge className={`text-xs ${getStatusColor(business.status)}`}>
                          {business.status === 'approved' ? 'Aprovado' :
                           business.status === 'pending_approval' ? 'Pendente' : 'Rejeitado'}
                        </Badge>
                        <span className="text-xs text-muted-foreground">{stats.views} views</span>
                      </div>
                    </div>
                  </Button>
                )
              })}
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-3">
          {selectedBusiness && (
            <div className="space-y-6">
              {/* Header with basic info */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <Building className="w-5 h-5" />
                        {selectedBusiness.name}
                      </CardTitle>
                      <CardDescription className="flex items-center gap-4 mt-2">
                        <Badge className={getStatusColor(selectedBusiness.status)}>
                          {selectedBusiness.status === 'approved' ? (
                            <>
                              <CheckCircle className="w-3 h-3 mr-1" />
                              Aprovado
                            </>
                          ) : selectedBusiness.status === 'pending_approval' ? (
                            <>
                              <Clock className="w-3 h-3 mr-1" />
                              Pendente
                            </>
                          ) : (
                            'Rejeitado'
                          )}
                        </Badge>
                        {selectedBusiness.updatedAt && (
                          <span className="text-xs text-muted-foreground">
                            <Calendar className="w-3 h-3 inline mr-1" />
                            Atualizado em {new Date(selectedBusiness.updatedAt).toLocaleDateString('pt-BR')}
                          </span>
                        )}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
              </Card>

              <Tabs defaultValue="stats" className="space-y-6">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="stats">Estatísticas</TabsTrigger>
                  <TabsTrigger value="insights">Insights</TabsTrigger>
                  <TabsTrigger value="performance">Performance</TabsTrigger>
                </TabsList>

                {/* Statistics Tab */}
                <TabsContent value="stats" className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {(() => {
                      const stats = getBusinessStats(selectedBusiness.id)
                      const statCards = [
                        {
                          title: 'Visualizações',
                          value: stats.views,
                          icon: Eye,
                          color: 'text-blue-600',
                          bgColor: 'bg-blue-50'
                        },
                        {
                          title: 'Favoritos',
                          value: stats.favorites,
                          icon: Heart,
                          color: 'text-red-600',
                          bgColor: 'bg-red-50'
                        },
                        {
                          title: 'Contatos',
                          value: stats.contacts,
                          icon: Phone,
                          color: 'text-green-600',
                          bgColor: 'bg-green-50'
                        },
                        {
                          title: 'Avaliação',
                          value: stats.rating || 0,
                          suffix: stats.reviewCount ? `(${stats.reviewCount})` : '',
                          icon: Star,
                          color: 'text-yellow-600',
                          bgColor: 'bg-yellow-50'
                        }
                      ]

                      return statCards.map((stat, index) => (
                        <Card key={index}>
                          <CardContent className="p-4">
                            <div className="flex items-center gap-3">
                              <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                                <stat.icon className={`w-5 h-5 ${stat.color}`} />
                              </div>
                              <div>
                                <p className="text-sm font-medium text-muted-foreground">{stat.title}</p>
                                <p className="text-lg font-bold">
                                  {stat.value}
                                  {stat.suffix && (
                                    <span className="text-sm font-normal text-muted-foreground ml-1">
                                      {stat.suffix}
                                    </span>
                                  )}
                                </p>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))
                    })()}
                  </div>

                  {/* Recent Activity */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Atividade Recente</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="flex items-center gap-3 text-sm">
                          <Eye className="w-4 h-4 text-blue-600" />
                          <span>Última visualização: há 2 horas</span>
                        </div>
                        <div className="flex items-center gap-3 text-sm">
                          <Heart className="w-4 h-4 text-red-600" />
                          <span>Adicionado aos favoritos: há 1 dia</span>
                        </div>
                        <div className="flex items-center gap-3 text-sm">
                          <Phone className="w-4 h-4 text-green-600" />
                          <span>Último contato via WhatsApp: há 3 dias</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Insights Tab */}
                <TabsContent value="insights" className="space-y-6">
                  <div className="space-y-4">
                    {(() => {
                      const stats = getBusinessStats(selectedBusiness.id)
                      const insights = generateInsights(selectedBusiness, stats)
                      
                      return insights.map((insight, index) => (
                        <Card key={index}>
                          <CardContent className="p-4">
                            <div className="flex items-start gap-3">
                              <div className="p-2 bg-muted rounded-lg">
                                <insight.icon className={`w-5 h-5 ${insight.color}`} />
                              </div>
                              <div className="flex-1">
                                <h4 className="font-medium mb-1">{insight.title}</h4>
                                <p className="text-sm text-muted-foreground">{insight.description}</p>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))
                    })()}
                  </div>

                  {/* Completeness Score */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Completude do Perfil</CardTitle>
                      <CardDescription>
                        Perfis completos recebem mais visualizações
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      {(() => {
                        const completeness = [
                          { label: 'Informações básicas', completed: !!selectedBusiness.name && !!selectedBusiness.description },
                          { label: 'Contatos', completed: !!selectedBusiness.phone || !!selectedBusiness.whatsapp },
                          { label: 'Endereço', completed: !!selectedBusiness.address },
                          { label: 'Logo', completed: !!selectedBusiness.logo },
                          { label: 'Fotos (3+)', completed: selectedBusiness.images?.length >= 3 },
                          { label: 'Horários', completed: !!selectedBusiness.hours && Object.keys(selectedBusiness.hours).length > 0 },
                          { label: 'Redes sociais', completed: !!selectedBusiness.website || !!selectedBusiness.instagram }
                        ]

                        const completedCount = completeness.filter(item => item.completed).length
                        const percentage = Math.round((completedCount / completeness.length) * 100)

                        return (
                          <div className="space-y-4">
                            <div className="flex items-center justify-between">
                              <span className="text-sm font-medium">Progresso</span>
                              <span className="text-sm text-muted-foreground">{completedCount}/{completeness.length}</span>
                            </div>
                            
                            <div className="w-full bg-muted rounded-full h-2">
                              <div 
                                className="bg-primary h-2 rounded-full transition-all"
                                style={{ width: `${percentage}%` }}
                              />
                            </div>
                            
                            <div className="space-y-2">
                              {completeness.map((item, index) => (
                                <div key={index} className="flex items-center gap-2 text-sm">
                                  <div className={`w-4 h-4 rounded-full flex items-center justify-center ${
                                    item.completed ? 'bg-green-100 text-green-600' : 'bg-muted text-muted-foreground'
                                  }`}>
                                    {item.completed && <CheckCircle className="w-3 h-3" />}
                                  </div>
                                  <span className={item.completed ? 'text-foreground' : 'text-muted-foreground'}>
                                    {item.label}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )
                      })()}
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Performance Tab */}
                <TabsContent value="performance" className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Ranking de Categoria</CardTitle>
                      <CardDescription>
                        Como sua empresa está performando na categoria
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <span>Posição no ranking</span>
                          <Badge variant="secondary">#3 de 12</Badge>
                        </div>
                        <div className="flex items-center justify-between">
                          <span>Categoria principal</span>
                          <span className="text-muted-foreground">Restaurantes</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span>Score de qualidade</span>
                          <span className="font-medium">8.5/10</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Oportunidades de Melhoria</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="flex items-start gap-3">
                          <TrendUp className="w-5 h-5 text-blue-600 mt-0.5" />
                          <div>
                            <p className="font-medium">Otimize seu horário de funcionamento</p>
                            <p className="text-sm text-muted-foreground">
                              Complete os horários de todos os dias da semana
                            </p>
                          </div>
                        </div>
                        <div className="flex items-start gap-3">
                          <Users className="w-5 h-5 text-green-600 mt-0.5" />
                          <div>
                            <p className="font-medium">Incentive avaliações</p>
                            <p className="text-sm text-muted-foreground">
                              Peça para clientes satisfeitos deixarem avaliações
                            </p>
                          </div>
                        </div>
                        <div className="flex items-start gap-3">
                          <MapPin className="w-5 h-5 text-purple-600 mt-0.5" />
                          <div>
                            <p className="font-medium">Melhore a descrição</p>
                            <p className="text-sm text-muted-foreground">
                              Adicione palavras-chave que seus clientes procuram
                            </p>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}