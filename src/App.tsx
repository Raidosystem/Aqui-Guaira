import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Building, MapPin, MessageCircle, Phone, Clock, ExternalLink, Search, Menu, X, Shield, Heart } from '@phosphor-icons/react'
import { useKV } from '@github/spark/hooks'
import { useInitializeData } from '@/hooks/useInitializeData'
import { HeroSection } from '@/components/HeroSection'
import { CompanyDirectory } from '@/components/CompanyDirectory' 
import { CommunityFeed } from '@/components/CommunityFeed'
import { ReportProblem } from '@/components/ReportProblem'
import { AboutGuaira } from '@/components/AboutGuaira'
import { AdminPanel } from '@/components/AdminPanel'
import { BusinessRegistration } from '@/components/BusinessRegistration'
import { BusinessManagement } from '@/components/BusinessManagement'
import { LocationManager } from '@/components/LocationManager'
import { CategoriesWidget } from '@/components/CategoriesWidget'
import { RecentDestinationsWidget } from '@/components/RecentDestinationsWidget'

function App() {
  const [activeTab, setActiveTab] = useState('home')
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [selectedCategory, setSelectedCategory] = useState<string | undefined>(undefined)

  // Initialize sample data
  useInitializeData()

  // Check user status for admin access
  useEffect(() => {
    const checkUserStatus = async () => {
      try {
        const currentUser = await spark.user()
        setUser(currentUser)
      } catch (error) {
        console.error('Error checking user status:', error)
      }
    }
    checkUserStatus()
  }, [])

  // Reset category selection when leaving empresas tab
  useEffect(() => {
    if (activeTab !== 'empresas') {
      setSelectedCategory(undefined)
    }
  }, [activeTab])

  const navigation = [
    { id: 'home', label: 'Início', icon: Building },
    { id: 'empresas', label: 'Empresas', icon: Building },
    { id: 'cadastro-empresa', label: 'Cadastrar', icon: Building },
    { id: 'gerenciar-empresa', label: 'Gerenciar', icon: Building },
    { id: 'locais', label: 'Meus Locais', icon: Heart },
    { id: 'mural', label: 'Mural', icon: MessageCircle },
    { id: 'problemas', label: 'Reportar', icon: MapPin },
    { id: 'sobre', label: 'Sobre Guaíra', icon: ExternalLink },
    ...(user?.isOwner ? [{ id: 'admin', label: 'Admin', icon: Shield }] : [])
  ]

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-card border-b shadow-sm">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <Building className="w-5 h-5 text-primary-foreground" weight="bold" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-foreground">Aqui Guaíra</h1>
                <p className="text-sm text-muted-foreground">Portal da Cidade</p>
              </div>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-6">
              {navigation.map(({ id, label, icon: Icon }) => (
                <Button 
                  key={id}
                  variant={activeTab === id ? "default" : "ghost"}
                  onClick={() => {
                    setActiveTab(id)
                    if (id !== 'empresas') setSelectedCategory(undefined)
                  }}
                  className="gap-2"
                >
                  <Icon className="w-4 h-4" />
                  {label}
                </Button>
              ))}
            </nav>

            {/* Mobile Menu Toggle */}
            <Button
              variant="ghost"
              size="sm"
              className="md:hidden"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </Button>
          </div>

          {/* Mobile Navigation */}
          {isMobileMenuOpen && (
            <nav className="md:hidden border-t py-4">
              <div className="flex flex-col gap-2">
                {navigation.map(({ id, label, icon: Icon }) => (
                  <Button 
                    key={id}
                    variant={activeTab === id ? "default" : "ghost"}
                    onClick={() => {
                      setActiveTab(id)
                      if (id !== 'empresas') setSelectedCategory(undefined)
                      setIsMobileMenuOpen(false)
                    }}
                    className="justify-start gap-2"
                  >
                    <Icon className="w-4 h-4" />
                    {label}
                  </Button>
                ))}
              </div>
            </nav>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main>
        {activeTab === 'home' && (
          <div className="space-y-12">
            <HeroSection />
            
            {/* Quick Search */}
            <section className="container mx-auto px-4">
              <Card className="border-2 border-primary/20 bg-primary/5">
                <CardHeader className="text-center">
                  <CardTitle className="text-2xl">Encontre empresas locais</CardTitle>
                  <CardDescription>Busque por nome, categoria ou serviço</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex gap-2 max-w-md mx-auto">
                    <Input 
                      placeholder="Ex: farmácia, restaurante, mecânico..."
                      className="flex-1"
                    />
                    <Button onClick={() => {
                      setSelectedCategory(undefined)
                      setActiveTab('empresas')
                    }}>
                      <Search className="w-4 h-4" />
                    </Button>
                  </div>
                  
                  {/* Quick access to saved locations */}
                  <div className="mt-4 pt-4 border-t">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-muted-foreground">Acesso rápido:</span>
                      <Button 
                        variant="link" 
                        size="sm" 
                        onClick={() => setActiveTab('locais')}
                        className="text-xs"
                      >
                        Ver todos
                      </Button>
                    </div>
                    <div className="flex gap-2 flex-wrap">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => setActiveTab('locais')}
                        className="gap-2"
                      >
                        <Heart className="w-3 h-3" />
                        Meus Favoritos
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => {
                          setSelectedCategory(undefined)
                          setActiveTab('empresas')
                        }}
                        className="gap-2"
                      >
                        <Building className="w-3 h-3" />
                        Por Categoria
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </section>

            {/* Categories and Recent Locations */}
            <section className="container mx-auto px-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <CategoriesWidget 
                  maxItems={6}
                  onNavigateToDirectory={() => setActiveTab('empresas')}
                  onCategorySelect={(categoryId) => {
                    setSelectedCategory(categoryId)
                    setActiveTab('empresas')
                  }}
                />
                <RecentDestinationsWidget 
                  maxItems={3}
                  onLocationSelect={(location) => {
                    // Could navigate to map view or trigger directions
                    console.log('Selected recent location:', location)
                  }}
                />
              </div>
            </section>

            {/* Business Registration */}
            <section className="container mx-auto px-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="border-accent/30 bg-accent/5">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <Building className="w-5 h-5 text-accent" />
                      Cadastre sua empresa
                    </CardTitle>
                    <CardDescription>
                      Divulgue seu negócio gratuitamente no portal da cidade
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2 text-sm text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 bg-accent rounded-full"></div>
                        <span>Divulgação gratuita</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 bg-accent rounded-full"></div>
                        <span>Localização no mapa</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 bg-accent rounded-full"></div>
                        <span>Contato direto via WhatsApp</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 bg-accent rounded-full"></div>
                        <span>Galeria de fotos</span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button 
                        className="flex-1" 
                        variant="default"
                        onClick={() => {
                          setSelectedCategory(undefined)
                          setActiveTab('cadastro-empresa')
                        }}
                      >
                        Cadastrar Empresa
                      </Button>
                      <Button 
                        className="flex-1" 
                        variant="outline"
                        onClick={() => {
                          setSelectedCategory(undefined)
                          setActiveTab('gerenciar-empresa')
                        }}
                      >
                        Gerenciar
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-secondary/30 bg-secondary/5">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <MessageCircle className="w-5 h-5 text-secondary" />
                      Participe do mural
                    </CardTitle>
                    <CardDescription>
                      Compartilhe novidades e conecte-se com a comunidade
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2 text-sm text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 bg-secondary rounded-full"></div>
                        <span>Publique fotos e vídeos</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 bg-secondary rounded-full"></div>
                        <span>Compartilhe eventos locais</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 bg-secondary rounded-full"></div>
                        <span>Conecte-se com vizinhos</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 bg-secondary rounded-full"></div>
                        <span>Moderação segura</span>
                      </div>
                    </div>
                    <Button 
                      className="w-full" 
                      variant="secondary"
                      onClick={() => setActiveTab('mural')}
                    >
                      Ver Mural
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </section>

            <AboutGuaira />
            <CommunityFeed isPreview />
          </div>
        )}

        {activeTab === 'empresas' && <CompanyDirectory onNavigate={setActiveTab} initialCategory={selectedCategory} />}
        {activeTab === 'cadastro-empresa' && <BusinessRegistration />}
        {activeTab === 'gerenciar-empresa' && <BusinessManagement />}
        {activeTab === 'locais' && <LocationManager />}
        {activeTab === 'mural' && <CommunityFeed />}
        {activeTab === 'problemas' && <ReportProblem />}
        {activeTab === 'sobre' && <AboutGuaira />}
        {activeTab === 'admin' && user?.isOwner && <AdminPanel />}
      </main>

      {/* Footer */}
      <footer className="bg-muted/50 border-t mt-16">
        <div className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <h3 className="font-semibold mb-4">Aqui Guaíra</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Portal comunitário não oficial da cidade de Guaíra, SP.
              </p>
              <p className="text-xs text-muted-foreground">
                Este não é o site oficial da Prefeitura de Guaíra.
              </p>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Links Úteis</h3>
              <div className="space-y-2 text-sm">
                <a href="#" className="block text-muted-foreground hover:text-primary">
                  Prefeitura de Guaíra
                </a>
                <a href="#" className="block text-muted-foreground hover:text-primary">
                  Câmara Municipal
                </a>
                <a href="#" className="block text-muted-foreground hover:text-primary">
                  Emergências: 190/193
                </a>
              </div>
            </div>

            <div>
              <h3 className="font-semibold mb-4">Portal</h3>
              <div className="space-y-2 text-sm">
                <a href="#" className="block text-muted-foreground hover:text-primary">
                  Termos de Uso
                </a>
                <a href="#" className="block text-muted-foreground hover:text-primary">
                  Política de Privacidade
                </a>
                <a href="#" className="block text-muted-foreground hover:text-primary">
                  Contato
                </a>
              </div>
            </div>
          </div>
          
          <div className="border-t mt-8 pt-8 text-center text-sm text-muted-foreground">
            <p>© 2024 Aqui Guaíra. Dados populacionais fonte: IBGE. Conteúdo turístico: Portal Municipal.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default App