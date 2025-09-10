import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Warning, MapPin, Phone, Camera, CheckCircle, Clock, ArrowRight } from '@phosphor-icons/react'
import { useKV } from '@github/spark/hooks'

interface Issue {
  id: string
  title: string
  description: string
  type: string
  author: string
  email: string
  phone: string
  address: string
  neighborhood: string
  coordinates?: { lat: number; lng: number }
  images: string[]
  status: 'received' | 'analyzing' | 'forwarded' | 'resolved'
  createdAt: string
  protocol: string
  isAnonymous: boolean
}

const issueTypes = [
  { id: 'pothole', label: 'Buraco na rua', icon: Warning },
  { id: 'lighting', label: 'Iluminação pública', icon: Warning },
  { id: 'traffic', label: 'Problema de trânsito', icon: Warning },
  { id: 'cleaning', label: 'Limpeza pública', icon: Warning },
  { id: 'infrastructure', label: 'Infraestrutura', icon: Warning },
  { id: 'other', label: 'Outro problema', icon: Warning }
]

const statusLabels = {
  received: 'Recebido',
  analyzing: 'Em análise',
  forwarded: 'Encaminhado',
  resolved: 'Resolvido'
}

const statusColors = {
  received: 'bg-blue-100 text-blue-800',
  analyzing: 'bg-yellow-100 text-yellow-800',
  forwarded: 'bg-purple-100 text-purple-800',
  resolved: 'bg-green-100 text-green-800'
}

export function ReportProblem() {
  const [issues, setIssues] = useKV<Issue[]>('city-issues', [])
  const [activeTab, setActiveTab] = useState('report')

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Reporte um Problema</h1>
        <p className="text-muted-foreground">
          Ajude a melhorar nossa cidade reportando problemas urbanos
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="report">Reportar Problema</TabsTrigger>
          <TabsTrigger value="track">Acompanhar Protocolos</TabsTrigger>
        </TabsList>

        <TabsContent value="report" className="mt-6">
          <ReportForm onSubmit={(issue) => {
            setIssues((current: Issue[]) => [issue, ...current])
            setActiveTab('track')
          }} />
        </TabsContent>

        <TabsContent value="track" className="mt-6">
          <IssueTracker issues={issues} />
        </TabsContent>
      </Tabs>
    </div>
  )
}

interface ReportFormProps {
  onSubmit: (issue: Issue) => void
}

function ReportForm({ onSubmit }: ReportFormProps) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: '',
    author: '',
    email: '',
    phone: '',
    address: '',
    neighborhood: '',
    isAnonymous: false
  })

  const [selectedImages, setSelectedImages] = useState<string[]>([])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.title.trim() || !formData.description.trim() || !formData.type) return

    const protocol = `GRA${Date.now().toString().slice(-6)}`
    
    const newIssue: Issue = {
      id: Date.now().toString(),
      ...formData,
      images: selectedImages,
      status: 'received',
      createdAt: new Date().toISOString(),
      protocol,
      coordinates: { lat: -20.3186, lng: -48.3103 } // Guaíra coordinates
    }

    onSubmit(newIssue)
    
    // Reset form
    setFormData({
      title: '',
      description: '',
      type: '',
      author: '',
      email: '',
      phone: '',
      address: '',
      neighborhood: '',
      isAnonymous: false
    })
    setSelectedImages([])
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Novo Reporte</CardTitle>
        <CardDescription>
          Preencha as informações sobre o problema encontrado
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Problem Details */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">Detalhes do Problema</h3>
            
            <div>
              <Label htmlFor="type">Tipo do problema</Label>
              <Select value={formData.type} onValueChange={(value) => 
                setFormData(prev => ({ ...prev, type: value }))
              }>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o tipo" />
                </SelectTrigger>
                <SelectContent>
                  {issueTypes.map(type => (
                    <SelectItem key={type.id} value={type.id}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="title">Título do problema</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Ex: Buraco grande na Rua das Flores"
                required
              />
            </div>

            <div>
              <Label htmlFor="description">Descrição detalhada</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Descreva o problema em detalhes..."
                rows={4}
                required
              />
            </div>
          </div>

          {/* Location */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">Localização</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="address">Endereço</Label>
                <Input
                  id="address"
                  value={formData.address}
                  onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                  placeholder="Rua, número, referência"
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="neighborhood">Bairro</Label>
                <Input
                  id="neighborhood"
                  value={formData.neighborhood}
                  onChange={(e) => setFormData(prev => ({ ...prev, neighborhood: e.target.value }))}
                  placeholder="Nome do bairro"
                  required
                />
              </div>
            </div>

            <Card className="bg-muted/50">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <MapPin className="w-4 h-4" />
                  <span>Clique no mapa para marcar a localização exata (opcional)</span>
                </div>
                <div className="mt-2 aspect-video bg-muted rounded-lg flex items-center justify-center">
                  <div className="text-center">
                    <MapPin className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">Mapa interativo</p>
                    <p className="text-xs text-muted-foreground">Funcionalidade em desenvolvimento</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Contact Info */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">Informações de Contato</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="author">Seu nome</Label>
                <Input
                  id="author"
                  value={formData.author}
                  onChange={(e) => setFormData(prev => ({ ...prev, author: e.target.value }))}
                  placeholder="Nome completo"
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="email">E-mail</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  placeholder="seu@email.com"
                  required
                />
              </div>
            </div>

            <div>
              <Label htmlFor="phone">Telefone/WhatsApp</Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                placeholder="(16) 99999-9999"
                required
              />
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="anonymous"
                checked={formData.isAnonymous}
                onChange={(e) => setFormData(prev => ({ ...prev, isAnonymous: e.target.checked }))}
                className="rounded"
              />
              <Label htmlFor="anonymous" className="text-sm">
                Manter anônimo no feed público (dados ficam apenas para administração)
              </Label>
            </div>
          </div>

          {/* Photos */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">Fotos (opcional)</h3>
            
            <div className="border-2 border-dashed border-muted rounded-lg p-6 text-center">
              <Camera className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">
                Adicione fotos para ajudar a identificar o problema
              </p>
              <Button type="button" variant="outline" className="mt-2">
                Selecionar fotos
              </Button>
            </div>
          </div>

          <div className="bg-muted/50 p-4 rounded-lg">
            <p className="text-sm text-muted-foreground">
              ⚠️ Este sistema encaminha reportes para análise da administração municipal. 
              Para emergências, ligue 190 (Polícia) ou 193 (Bombeiros).
            </p>
          </div>

          <Button type="submit" size="lg" className="w-full">
            Enviar Reporte
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}

interface IssueTrackerProps {
  issues: Issue[]
}

function IssueTracker({ issues }: IssueTrackerProps) {
  if (issues.length === 0) {
    return (
      <Card className="text-center py-12">
        <CardContent>
          <Warning className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">Nenhum protocolo encontrado</h3>
          <p className="text-muted-foreground">
            Você ainda não fez nenhum reporte
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Seus Protocolos</h3>
      
      {issues.map(issue => (
        <IssueCard key={issue.id} issue={issue} />
      ))}
    </div>
  )
}

interface IssueCardProps {
  issue: Issue
}

function IssueCard({ issue }: IssueCardProps) {
  const formatDate = (dateString: string) => {
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(new Date(dateString))
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-lg">{issue.title}</CardTitle>
            <CardDescription className="flex items-center gap-2">
              <span>Protocolo: {issue.protocol}</span>
              <span>•</span>
              <span>{formatDate(issue.createdAt)}</span>
            </CardDescription>
          </div>
          
          <Badge className={statusColors[issue.status]}>
            {statusLabels[issue.status]}
          </Badge>
        </div>
      </CardHeader>

      <CardContent>
        <p className="text-sm mb-4">{issue.description}</p>
        
        <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
          <div className="flex items-center gap-1">
            <MapPin className="w-4 h-4" />
            {issue.address}, {issue.neighborhood}
          </div>
        </div>

        {/* Status Timeline */}
        <div className="space-y-2">
          <h4 className="font-medium text-sm">Status do atendimento:</h4>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded-full ${
                ['received', 'analyzing', 'forwarded', 'resolved'].indexOf(issue.status) >= 0 
                  ? 'bg-primary' : 'bg-muted'
              }`} />
              <span className="text-sm">Recebido</span>
            </div>
            
            <ArrowRight className="w-3 h-3 text-muted-foreground" />
            
            <div className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded-full ${
                ['analyzing', 'forwarded', 'resolved'].indexOf(issue.status) >= 0 
                  ? 'bg-primary' : 'bg-muted'
              }`} />
              <span className="text-sm">Em análise</span>
            </div>
            
            <ArrowRight className="w-3 h-3 text-muted-foreground" />
            
            <div className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded-full ${
                ['forwarded', 'resolved'].indexOf(issue.status) >= 0 
                  ? 'bg-primary' : 'bg-muted'
              }`} />
              <span className="text-sm">Encaminhado</span>
            </div>
            
            <ArrowRight className="w-3 h-3 text-muted-foreground" />
            
            <div className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded-full ${
                issue.status === 'resolved' ? 'bg-green-500' : 'bg-muted'
              }`} />
              <span className="text-sm">Resolvido</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}