import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Building, MapPin, MessageCircle, Phone, Clock, ExternalLink, Search, Menu, X } from '@phosphor-icons/react'
import { useKV } from '@github/spark/hooks'
import { HeroSection } from './components/HeroSection'
import { CompanyDirectory } from './components/CompanyDirectory' 
import { CommunityFeed } from './components/CommunityFeed'
import { ReportProblem } from './components/ReportProblem'
import { AboutGuaira } from './components/AboutGuaira'

function App() {
  const [activeTab, setActiveTab] = useState('home')
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const navigation = [
    { id: 'home', label: 'Início', icon: Building },
    { id: 'empresas', label: 'Empresas', icon: Building },
    { id: 'mural', label: 'Mural', icon: MessageCircle },
    { id: 'problemas', label: 'Reportar', icon: MapPin },
    { id: 'sobre', label: 'Sobre Guaíra', icon: ExternalLink }
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
                  onClick={() => setActiveTab(id)}
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
                    <Button onClick={() => setActiveTab('empresas')}>
                      <Search className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </section>

            <AboutGuaira />
            <CommunityFeed isPreview />
          </div>
        )}

        {activeTab === 'empresas' && <CompanyDirectory />}
        {activeTab === 'mural' && <CommunityFeed />}
        {activeTab === 'problemas' && <ReportProblem />}
        {activeTab === 'sobre' && <AboutGuaira />}
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