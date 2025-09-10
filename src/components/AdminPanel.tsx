import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { Checkbox } from '@/components/ui/checkbox'
import { 
  Shield, 
  MessageCircle, 
  Building, 
  Check, 
  X, 
  Eye, 
  Trash2, 
  Edit3, 
  Plus,
  Calendar,
  MapPin,
  Phone,
  Globe,
  AlertTriangle,
  Users,
  TrendingUp,
  Clock,
  CheckSquare,
  Square,
  CheckCircle,
  XCircle
} from '@phosphor-icons/react'
import { useKV } from '@github/spark/hooks'
import { toast } from 'sonner'

// Types
interface Post {
  id: string
  author: string
  authorAvatar?: string
  neighborhood: string
  content: string
  images: string[]
  videos: string[]
  createdAt: string
  likes: number
  status: 'approved' | 'pending' | 'rejected'
  isIssue: boolean
  moderatedBy?: string
  moderatedAt?: string
  rejectionReason?: string
}

interface Company {
  id: string
  name: string
  description: string
  phone: string
  whatsapp?: string
  address: string
  neighborhood: string
  categories: string[]
  hours: string
  logoUrl?: string
  website?: string
  status: 'approved' | 'pending' | 'rejected'
  createdAt: string
  moderatedBy?: string
  moderatedAt?: string
  rejectionReason?: string
}

interface Category {
  id: string
  name: string
  color: string
}

export function AdminPanel() {
  const [user, setUser] = useState<any>(null)
  const [posts, setPosts] = useKV<Post[]>('community-posts', [])
  const [companies, setCompanies] = useKV<Company[]>('companies', [])
  const [categories, setCategories] = useKV<Category[]>('categories', [])
  
  // Check if user is admin
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

  if (!user?.isOwner) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <Card className="max-w-md mx-auto">
          <CardContent className="pt-6">
            <Shield className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Acesso Restrito</h2>
            <p className="text-muted-foreground">
              Apenas administradores podem acessar este painel.
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
          <Shield className="w-8 h-8 text-primary" />
          Painel Administrativo
        </h1>
        <p className="text-muted-foreground">
          Modere postagens e gerencie empresas do portal
        </p>
      </div>

      <AdminStats posts={posts} companies={companies} />

      <Tabs defaultValue="posts" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="posts" className="gap-2">
            <MessageCircle className="w-4 h-4" />
            Postagens
          </TabsTrigger>
          <TabsTrigger value="companies" className="gap-2">
            <Building className="w-4 h-4" />
            Empresas
          </TabsTrigger>
          <TabsTrigger value="categories" className="gap-2">
            <Plus className="w-4 h-4" />
            Categorias
          </TabsTrigger>
          <TabsTrigger value="reports" className="gap-2">
            <TrendingUp className="w-4 h-4" />
            Relatórios
          </TabsTrigger>
        </TabsList>

        <TabsContent value="posts">
          <PostModeration posts={posts} setPosts={setPosts} />
        </TabsContent>

        <TabsContent value="companies">
          <CompanyModeration companies={companies} setCompanies={setCompanies} categories={categories} />
        </TabsContent>

        <TabsContent value="categories">
          <CategoryManagement categories={categories} setCategories={setCategories} />
        </TabsContent>

        <TabsContent value="reports">
          <AdminReports posts={posts} companies={companies} />
        </TabsContent>
      </Tabs>
    </div>
  )
}

// Admin Statistics Component
function AdminStats({ posts, companies }: { posts: Post[], companies: Company[] }) {
  const pendingPosts = posts.filter(p => p.status === 'pending').length
  const pendingCompanies = companies.filter(c => c.status === 'pending').length
  const totalUsers = new Set(posts.map(p => p.author)).size
  const approvedPosts = posts.filter(p => p.status === 'approved').length

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
              <Clock className="w-6 h-6 text-yellow-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Postagens Pendentes</p>
              <p className="text-2xl font-bold">{pendingPosts}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Building className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Empresas Pendentes</p>
              <p className="text-2xl font-bold">{pendingCompanies}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <Users className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Usuários Ativos</p>
              <p className="text-2xl font-bold">{totalUsers}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <MessageCircle className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Posts Aprovados</p>
              <p className="text-2xl font-bold">{approvedPosts}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// Post Moderation Component
function PostModeration({ posts, setPosts }: { posts: Post[], setPosts: any }) {
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [selectedPost, setSelectedPost] = useState<Post | null>(null)
  const [rejectionReason, setRejectionReason] = useState('')
  const [selectedPosts, setSelectedPosts] = useState<Set<string>>(new Set())
  const [bulkRejectionReason, setBulkRejectionReason] = useState('')
  const [showBulkActions, setShowBulkActions] = useState(false)

  const filteredPosts = posts.filter(post => {
    if (statusFilter === 'all') return true
    return post.status === statusFilter
  })

  const pendingPosts = filteredPosts.filter(post => post.status === 'pending')

  const togglePostSelection = (postId: string) => {
    const newSelected = new Set(selectedPosts)
    if (newSelected.has(postId)) {
      newSelected.delete(postId)
    } else {
      newSelected.add(postId)
    }
    setSelectedPosts(newSelected)
  }

  const toggleSelectAll = () => {
    if (selectedPosts.size === pendingPosts.length) {
      setSelectedPosts(new Set())
    } else {
      setSelectedPosts(new Set(pendingPosts.map(p => p.id)))
    }
  }

  const moderatePost = (postId: string, status: 'approved' | 'rejected', reason?: string) => {
    setPosts((current: Post[]) => 
      current.map(post => 
        post.id === postId 
          ? { 
              ...post, 
              status, 
              moderatedAt: new Date().toISOString(),
              moderatedBy: 'admin',
              rejectionReason: reason 
            }
          : post
      )
    )
    
    toast.success(`Postagem ${status === 'approved' ? 'aprovada' : 'rejeitada'} com sucesso`)
    setSelectedPost(null)
    setRejectionReason('')
  }

  const bulkModerate = (status: 'approved' | 'rejected', reason?: string) => {
    const selectedPostIds = Array.from(selectedPosts)
    
    setPosts((current: Post[]) => 
      current.map(post => 
        selectedPostIds.includes(post.id)
          ? { 
              ...post, 
              status, 
              moderatedAt: new Date().toISOString(),
              moderatedBy: 'admin',
              rejectionReason: reason 
            }
          : post
      )
    )
    
    toast.success(`${selectedPostIds.length} postagem${selectedPostIds.length > 1 ? 's' : ''} ${status === 'approved' ? 'aprovada' : 'rejeitada'}${selectedPostIds.length > 1 ? 's' : ''} com sucesso`)
    setSelectedPosts(new Set())
    setBulkRejectionReason('')
    setShowBulkActions(false)
  }

  const deletePost = (postId: string) => {
    setPosts((current: Post[]) => current.filter(post => post.id !== postId))
    toast.success('Postagem excluída com sucesso')
  }

  const bulkDelete = () => {
    const selectedPostIds = Array.from(selectedPosts)
    setPosts((current: Post[]) => current.filter(post => !selectedPostIds.includes(post.id)))
    toast.success(`${selectedPostIds.length} postagem${selectedPostIds.length > 1 ? 's' : ''} excluída${selectedPostIds.length > 1 ? 's' : ''} com sucesso`)
    setSelectedPosts(new Set())
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Moderação de Postagens</h2>
          <p className="text-muted-foreground">
            {filteredPosts.length} postagem{filteredPosts.length !== 1 ? 's' : ''}
            {selectedPosts.size > 0 && (
              <span className="ml-2 text-primary font-medium">
                • {selectedPosts.size} selecionada{selectedPosts.size > 1 ? 's' : ''}
              </span>
            )}
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas as postagens</SelectItem>
              <SelectItem value="pending">Pendentes</SelectItem>
              <SelectItem value="approved">Aprovadas</SelectItem>
              <SelectItem value="rejected">Rejeitadas</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Bulk Actions Bar */}
      {statusFilter === 'pending' && pendingPosts.length > 0 && (
        <Card className="border-primary/20 bg-primary/5">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <Checkbox
                    checked={selectedPosts.size === pendingPosts.length && pendingPosts.length > 0}
                    onCheckedChange={toggleSelectAll}
                    className="border-primary"
                  />
                  <span className="text-sm font-medium">
                    Selecionar todas ({pendingPosts.length})
                  </span>
                </div>
                
                {selectedPosts.size > 0 && (
                  <Badge variant="secondary" className="gap-1">
                    <CheckSquare className="w-3 h-3" />
                    {selectedPosts.size} selecionada{selectedPosts.size > 1 ? 's' : ''}
                  </Badge>
                )}
              </div>

              {selectedPosts.size > 0 && (
                <div className="flex items-center gap-2">
                  <Button 
                    size="sm" 
                    className="gap-2"
                    onClick={() => bulkModerate('approved')}
                  >
                    <CheckCircle className="w-4 h-4" />
                    Aprovar Todas ({selectedPosts.size})
                  </Button>
                  
                  <Dialog open={showBulkActions} onOpenChange={setShowBulkActions}>
                    <DialogTrigger asChild>
                      <Button variant="destructive" size="sm" className="gap-2">
                        <XCircle className="w-4 h-4" />
                        Rejeitar Todas ({selectedPosts.size})
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Rejeitar {selectedPosts.size} Postagem{selectedPosts.size > 1 ? 's' : ''}</DialogTitle>
                        <DialogDescription>
                          Informe o motivo da rejeição para todas as postagens selecionadas
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="bulk-reason">Motivo da rejeição</Label>
                          <Textarea
                            id="bulk-reason"
                            value={bulkRejectionReason}
                            onChange={(e) => setBulkRejectionReason(e.target.value)}
                            placeholder="Ex: Conteúdo inadequado, informações incorretas..."
                            rows={3}
                          />
                        </div>
                        <div className="flex gap-2 justify-end">
                          <Button variant="outline" onClick={() => setShowBulkActions(false)}>
                            Cancelar
                          </Button>
                          <Button 
                            variant="destructive"
                            onClick={() => bulkModerate('rejected', bulkRejectionReason)}
                            disabled={!bulkRejectionReason.trim()}
                          >
                            Rejeitar Todas
                          </Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>

                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="gap-2 text-destructive hover:text-destructive"
                    onClick={bulkDelete}
                  >
                    <Trash2 className="w-4 h-4" />
                    Excluir Todas ({selectedPosts.size})
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 gap-4">
        {filteredPosts.map(post => (
          <Card key={post.id} className="overflow-hidden">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                {statusFilter === 'pending' && (
                  <div className="pt-1">
                    <Checkbox
                      checked={selectedPosts.has(post.id)}
                      onCheckedChange={() => togglePostSelection(post.id)}
                      className="border-primary"
                    />
                  </div>
                )}
                
                <Avatar className="w-10 h-10">
                  <AvatarImage src={post.authorAvatar} />
                  <AvatarFallback>
                    {post.author.split(' ').map(n => n[0]).join('').toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="font-semibold">{post.author}</h3>
                    <Badge variant="outline">{post.neighborhood}</Badge>
                    <Badge 
                      variant={
                        post.status === 'approved' ? 'default' : 
                        post.status === 'pending' ? 'secondary' : 
                        'destructive'
                      }
                    >
                      {post.status === 'approved' ? 'Aprovada' : 
                       post.status === 'pending' ? 'Pendente' : 
                       'Rejeitada'}
                    </Badge>
                  </div>
                  
                  <p className="text-sm text-muted-foreground mb-3 flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {new Date(post.createdAt).toLocaleString('pt-BR')}
                  </p>
                  
                  <p className="mb-4">{post.content}</p>
                  
                  {post.rejectionReason && (
                    <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-3 mb-4">
                      <p className="text-sm text-destructive font-medium mb-1">Motivo da rejeição:</p>
                      <p className="text-sm text-destructive">{post.rejectionReason}</p>
                    </div>
                  )}
                  
                  <div className="flex items-center gap-2">
                    {post.status === 'pending' && (
                      <>
                        <Button 
                          size="sm" 
                          className="gap-2"
                          onClick={() => moderatePost(post.id, 'approved')}
                        >
                          <Check className="w-4 h-4" />
                          Aprovar
                        </Button>
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="destructive" size="sm" className="gap-2">
                              <X className="w-4 h-4" />
                              Rejeitar
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Rejeitar Postagem</DialogTitle>
                              <DialogDescription>
                                Informe o motivo da rejeição para o usuário
                              </DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4">
                              <div>
                                <Label htmlFor="reason">Motivo da rejeição</Label>
                                <Textarea
                                  id="reason"
                                  value={rejectionReason}
                                  onChange={(e) => setRejectionReason(e.target.value)}
                                  placeholder="Ex: Conteúdo inadequado, informações incorretas..."
                                  rows={3}
                                />
                              </div>
                              <div className="flex gap-2 justify-end">
                                <Button variant="outline" onClick={() => setRejectionReason('')}>
                                  Cancelar
                                </Button>
                                <Button 
                                  variant="destructive"
                                  onClick={() => moderatePost(post.id, 'rejected', rejectionReason)}
                                  disabled={!rejectionReason.trim()}
                                >
                                  Rejeitar
                                </Button>
                              </div>
                            </div>
                          </DialogContent>
                        </Dialog>
                      </>
                    )}
                    
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="ghost" size="sm" className="gap-2">
                          <Eye className="w-4 h-4" />
                          Visualizar
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-lg">
                        <PostPreview post={post} />
                      </DialogContent>
                    </Dialog>
                    
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="gap-2 text-destructive hover:text-destructive"
                      onClick={() => deletePost(post.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                      Excluir
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredPosts.length === 0 && (
        <Card className="text-center py-12">
          <CardContent>
            <MessageCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Nenhuma postagem encontrada</h3>
            <p className="text-muted-foreground">
              Não há postagens com o status selecionado
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

// Post Preview Component
function PostPreview({ post }: { post: Post }) {
  return (
    <div>
      <DialogHeader>
        <DialogTitle>Visualizar Postagem</DialogTitle>
      </DialogHeader>
      
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <Avatar className="w-10 h-10">
            <AvatarImage src={post.authorAvatar} />
            <AvatarFallback>
              {post.author.split(' ').map(n => n[0]).join('').toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div>
            <h3 className="font-semibold">{post.author}</h3>
            <p className="text-sm text-muted-foreground">{post.neighborhood}</p>
          </div>
        </div>
        
        <Separator />
        
        <p>{post.content}</p>
        
        {(post.images.length > 0 || post.videos.length > 0) && (
          <div>
            <h4 className="font-medium mb-2">Mídia anexada:</h4>
            <div className="text-sm text-muted-foreground">
              {post.images.length > 0 && <p>{post.images.length} imagem(ns)</p>}
              {post.videos.length > 0 && <p>{post.videos.length} vídeo(s)</p>}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// Company Moderation Component
function CompanyModeration({ companies, setCompanies, categories }: { 
  companies: Company[], 
  setCompanies: any, 
  categories: Category[]
}) {
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [rejectionReason, setRejectionReason] = useState('')
  const [selectedCompanies, setSelectedCompanies] = useState<Set<string>>(new Set())
  const [bulkRejectionReason, setBulkRejectionReason] = useState('')
  const [showBulkActions, setShowBulkActions] = useState(false)

  const filteredCompanies = companies.filter(company => {
    if (statusFilter === 'all') return true
    return company.status === statusFilter
  })

  const pendingCompanies = filteredCompanies.filter(company => company.status === 'pending')

  const toggleCompanySelection = (companyId: string) => {
    const newSelected = new Set(selectedCompanies)
    if (newSelected.has(companyId)) {
      newSelected.delete(companyId)
    } else {
      newSelected.add(companyId)
    }
    setSelectedCompanies(newSelected)
  }

  const toggleSelectAll = () => {
    if (selectedCompanies.size === pendingCompanies.length) {
      setSelectedCompanies(new Set())
    } else {
      setSelectedCompanies(new Set(pendingCompanies.map(c => c.id)))
    }
  }

  const moderateCompany = (companyId: string, status: 'approved' | 'rejected', reason?: string) => {
    setCompanies((current: Company[]) => 
      current.map(company => 
        company.id === companyId 
          ? { 
              ...company, 
              status, 
              moderatedAt: new Date().toISOString(),
              moderatedBy: 'admin',
              rejectionReason: reason 
            }
          : company
      )
    )
    
    toast.success(`Empresa ${status === 'approved' ? 'aprovada' : 'rejeitada'} com sucesso`)
    setRejectionReason('')
  }

  const bulkModerate = (status: 'approved' | 'rejected', reason?: string) => {
    const selectedCompanyIds = Array.from(selectedCompanies)
    
    setCompanies((current: Company[]) => 
      current.map(company => 
        selectedCompanyIds.includes(company.id)
          ? { 
              ...company, 
              status, 
              moderatedAt: new Date().toISOString(),
              moderatedBy: 'admin',
              rejectionReason: reason 
            }
          : company
      )
    )
    
    toast.success(`${selectedCompanyIds.length} empresa${selectedCompanyIds.length > 1 ? 's' : ''} ${status === 'approved' ? 'aprovada' : 'rejeitada'}${selectedCompanyIds.length > 1 ? 's' : ''} com sucesso`)
    setSelectedCompanies(new Set())
    setBulkRejectionReason('')
    setShowBulkActions(false)
  }

  const deleteCompany = (companyId: string) => {
    setCompanies((current: Company[]) => current.filter(company => company.id !== companyId))
    toast.success('Empresa excluída com sucesso')
  }

  const bulkDelete = () => {
    const selectedCompanyIds = Array.from(selectedCompanies)
    setCompanies((current: Company[]) => current.filter(company => !selectedCompanyIds.includes(company.id)))
    toast.success(`${selectedCompanyIds.length} empresa${selectedCompanyIds.length > 1 ? 's' : ''} excluída${selectedCompanyIds.length > 1 ? 's' : ''} com sucesso`)
    setSelectedCompanies(new Set())
  }

  const getCategoryName = (categoryId: string) => {
    const category = categories.find(c => c.id === categoryId)
    return category?.name || categoryId
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Moderação de Empresas</h2>
          <p className="text-muted-foreground">
            {filteredCompanies.length} empresa{filteredCompanies.length !== 1 ? 's' : ''}
            {selectedCompanies.size > 0 && (
              <span className="ml-2 text-primary font-medium">
                • {selectedCompanies.size} selecionada{selectedCompanies.size > 1 ? 's' : ''}
              </span>
            )}
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas as empresas</SelectItem>
              <SelectItem value="pending">Pendentes</SelectItem>
              <SelectItem value="approved">Aprovadas</SelectItem>
              <SelectItem value="rejected">Rejeitadas</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Bulk Actions Bar */}
      {statusFilter === 'pending' && pendingCompanies.length > 0 && (
        <Card className="border-primary/20 bg-primary/5">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <Checkbox
                    checked={selectedCompanies.size === pendingCompanies.length && pendingCompanies.length > 0}
                    onCheckedChange={toggleSelectAll}
                    className="border-primary"
                  />
                  <span className="text-sm font-medium">
                    Selecionar todas ({pendingCompanies.length})
                  </span>
                </div>
                
                {selectedCompanies.size > 0 && (
                  <Badge variant="secondary" className="gap-1">
                    <CheckSquare className="w-3 h-3" />
                    {selectedCompanies.size} selecionada{selectedCompanies.size > 1 ? 's' : ''}
                  </Badge>
                )}
              </div>

              {selectedCompanies.size > 0 && (
                <div className="flex items-center gap-2">
                  <Button 
                    size="sm" 
                    className="gap-2"
                    onClick={() => bulkModerate('approved')}
                  >
                    <CheckCircle className="w-4 h-4" />
                    Aprovar Todas ({selectedCompanies.size})
                  </Button>
                  
                  <Dialog open={showBulkActions} onOpenChange={setShowBulkActions}>
                    <DialogTrigger asChild>
                      <Button variant="destructive" size="sm" className="gap-2">
                        <XCircle className="w-4 h-4" />
                        Rejeitar Todas ({selectedCompanies.size})
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Rejeitar {selectedCompanies.size} Empresa{selectedCompanies.size > 1 ? 's' : ''}</DialogTitle>
                        <DialogDescription>
                          Informe o motivo da rejeição para todas as empresas selecionadas
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="bulk-reason">Motivo da rejeição</Label>
                          <Textarea
                            id="bulk-reason"
                            value={bulkRejectionReason}
                            onChange={(e) => setBulkRejectionReason(e.target.value)}
                            placeholder="Ex: Dados incompletos, empresa não encontrada..."
                            rows={3}
                          />
                        </div>
                        <div className="flex gap-2 justify-end">
                          <Button variant="outline" onClick={() => setShowBulkActions(false)}>
                            Cancelar
                          </Button>
                          <Button 
                            variant="destructive"
                            onClick={() => bulkModerate('rejected', bulkRejectionReason)}
                            disabled={!bulkRejectionReason.trim()}
                          >
                            Rejeitar Todas
                          </Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>

                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="gap-2 text-destructive hover:text-destructive"
                    onClick={bulkDelete}
                  >
                    <Trash2 className="w-4 h-4" />
                    Excluir Todas ({selectedCompanies.size})
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 gap-4">
        {filteredCompanies.map(company => (
          <Card key={company.id} className="overflow-hidden">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                {statusFilter === 'pending' && (
                  <div className="pt-1">
                    <Checkbox
                      checked={selectedCompanies.has(company.id)}
                      onCheckedChange={() => toggleCompanySelection(company.id)}
                      className="border-primary"
                    />
                  </div>
                )}
                
                {company.logoUrl ? (
                  <img 
                    src={company.logoUrl} 
                    alt={`Logo ${company.name}`}
                    className="w-16 h-16 rounded-lg object-cover"
                  />
                ) : (
                  <div className="w-16 h-16 bg-primary/10 rounded-lg flex items-center justify-center">
                    <Building className="w-8 h-8 text-primary" />
                  </div>
                )}
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="text-xl font-semibold">{company.name}</h3>
                    <Badge 
                      variant={
                        company.status === 'approved' ? 'default' : 
                        company.status === 'pending' ? 'secondary' : 
                        'destructive'
                      }
                    >
                      {company.status === 'approved' ? 'Aprovada' : 
                       company.status === 'pending' ? 'Pendente' : 
                       'Rejeitada'}
                    </Badge>
                  </div>
                  
                  <p className="text-sm text-muted-foreground mb-3">{company.description}</p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm">
                        <Phone className="w-4 h-4 text-muted-foreground" />
                        {company.phone}
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <MapPin className="w-4 h-4 text-muted-foreground" />
                        {company.address}, {company.neighborhood}
                      </div>
                      {company.website && (
                        <div className="flex items-center gap-2 text-sm">
                          <Globe className="w-4 h-4 text-muted-foreground" />
                          {company.website}
                        </div>
                      )}
                    </div>
                    
                    <div>
                      <p className="text-sm font-medium mb-2">Categorias:</p>
                      <div className="flex flex-wrap gap-1">
                        {company.categories.map(categoryId => (
                          <Badge key={categoryId} variant="outline">
                            {getCategoryName(categoryId)}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                  
                  {company.rejectionReason && (
                    <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-3 mb-4">
                      <p className="text-sm text-destructive font-medium mb-1">Motivo da rejeição:</p>
                      <p className="text-sm text-destructive">{company.rejectionReason}</p>
                    </div>
                  )}
                  
                  <div className="flex items-center gap-2">
                    {company.status === 'pending' && (
                      <>
                        <Button 
                          size="sm" 
                          className="gap-2"
                          onClick={() => moderateCompany(company.id, 'approved')}
                        >
                          <Check className="w-4 h-4" />
                          Aprovar
                        </Button>
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="destructive" size="sm" className="gap-2">
                              <X className="w-4 h-4" />
                              Rejeitar
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Rejeitar Empresa</DialogTitle>
                              <DialogDescription>
                                Informe o motivo da rejeição
                              </DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4">
                              <div>
                                <Label htmlFor="reason">Motivo da rejeição</Label>
                                <Textarea
                                  id="reason"
                                  value={rejectionReason}
                                  onChange={(e) => setRejectionReason(e.target.value)}
                                  placeholder="Ex: Dados incompletos, empresa não encontrada..."
                                  rows={3}
                                />
                              </div>
                              <div className="flex gap-2 justify-end">
                                <Button variant="outline" onClick={() => setRejectionReason('')}>
                                  Cancelar
                                </Button>
                                <Button 
                                  variant="destructive"
                                  onClick={() => moderateCompany(company.id, 'rejected', rejectionReason)}
                                  disabled={!rejectionReason.trim()}
                                >
                                  Rejeitar
                                </Button>
                              </div>
                            </div>
                          </DialogContent>
                        </Dialog>
                      </>
                    )}
                    
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="gap-2 text-destructive hover:text-destructive"
                      onClick={() => deleteCompany(company.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                      Excluir
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredCompanies.length === 0 && (
        <Card className="text-center py-12">
          <CardContent>
            <Building className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Nenhuma empresa encontrada</h3>
            <p className="text-muted-foreground">
              Não há empresas com o status selecionado
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

// Category Management Component
function CategoryManagement({ categories, setCategories }: { 
  categories: Category[], 
  setCategories: any 
}) {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)
  const [categoryName, setCategoryName] = useState('')
  const [categoryColor, setCategoryColor] = useState('#3B82F6')

  const predefinedColors = [
    '#3B82F6', '#EF4444', '#10B981', '#F59E0B', 
    '#8B5CF6', '#EC4899', '#06B6D4', '#84CC16'
  ]

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!categoryName.trim()) return

    if (editingCategory) {
      setCategories((current: Category[]) => 
        current.map(cat => 
          cat.id === editingCategory.id 
            ? { ...cat, name: categoryName.trim(), color: categoryColor }
            : cat
        )
      )
      toast.success('Categoria atualizada com sucesso')
    } else {
      const newCategory: Category = {
        id: categoryName.toLowerCase().replace(/\s+/g, '-'),
        name: categoryName.trim(),
        color: categoryColor
      }
      
      setCategories((current: Category[]) => [...current, newCategory])
      toast.success('Categoria criada com sucesso')
    }
    
    setCategoryName('')
    setCategoryColor('#3B82F6')
    setEditingCategory(null)
    setIsCreateDialogOpen(false)
  }

  const deleteCategory = (categoryId: string) => {
    setCategories((current: Category[]) => current.filter(cat => cat.id !== categoryId))
    toast.success('Categoria excluída com sucesso')
  }

  const startEdit = (category: Category) => {
    setEditingCategory(category)
    setCategoryName(category.name)
    setCategoryColor(category.color)
    setIsCreateDialogOpen(true)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Gerenciar Categorias</h2>
          <p className="text-muted-foreground">
            {categories.length} categoria{categories.length !== 1 ? 's' : ''} cadastrada{categories.length !== 1 ? 's' : ''}
          </p>
        </div>
        
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="w-4 h-4" />
              Nova Categoria
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingCategory ? 'Editar Categoria' : 'Nova Categoria'}
              </DialogTitle>
              <DialogDescription>
                Crie categorias para organizar as empresas
              </DialogDescription>
            </DialogHeader>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="name">Nome da categoria</Label>
                <Input
                  id="name"
                  value={categoryName}
                  onChange={(e) => setCategoryName(e.target.value)}
                  placeholder="Ex: Restaurantes, Farmácias..."
                  required
                />
              </div>
              
              <div>
                <Label>Cor da categoria</Label>
                <div className="flex gap-2 mt-2">
                  {predefinedColors.map(color => (
                    <button
                      key={color}
                      type="button"
                      className={`w-8 h-8 rounded-full border-2 ${
                        categoryColor === color ? 'border-foreground' : 'border-muted'
                      }`}
                      style={{ backgroundColor: color }}
                      onClick={() => setCategoryColor(color)}
                    />
                  ))}
                </div>
              </div>
              
              <div className="flex gap-2 justify-end">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => {
                    setIsCreateDialogOpen(false)
                    setEditingCategory(null)
                    setCategoryName('')
                    setCategoryColor('#3B82F6')
                  }}
                >
                  Cancelar
                </Button>
                <Button type="submit">
                  {editingCategory ? 'Atualizar' : 'Criar'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {categories.map(category => (
          <Card key={category.id}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div 
                    className="w-4 h-4 rounded-full"
                    style={{ backgroundColor: category.color }}
                  />
                  <h3 className="font-semibold">{category.name}</h3>
                </div>
                
                <div className="flex items-center gap-1">
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => startEdit(category)}
                  >
                    <Edit3 className="w-4 h-4" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    className="text-destructive hover:text-destructive"
                    onClick={() => deleteCategory(category.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {categories.length === 0 && (
        <Card className="text-center py-12">
          <CardContent>
            <Plus className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Nenhuma categoria cadastrada</h3>
            <p className="text-muted-foreground mb-4">
              Crie categorias para organizar as empresas
            </p>
            <Button onClick={() => setIsCreateDialogOpen(true)}>
              Criar primeira categoria
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

// Admin Reports Component
function AdminReports({ posts, companies }: { posts: Post[], companies: Company[] }) {
  const totalPosts = posts.length
  const approvedPosts = posts.filter(p => p.status === 'approved').length
  const pendingPosts = posts.filter(p => p.status === 'pending').length
  const rejectedPosts = posts.filter(p => p.status === 'rejected').length
  
  const totalCompanies = companies.length
  const approvedCompanies = companies.filter(c => c.status === 'approved').length
  const pendingCompanies = companies.filter(c => c.status === 'pending').length
  const rejectedCompanies = companies.filter(c => c.status === 'rejected').length

  const recentActivity = [
    ...posts.slice(0, 5).map(p => ({
      type: 'post',
      title: `Nova postagem de ${p.author}`,
      time: p.createdAt,
      status: p.status
    })),
    ...companies.slice(0, 5).map(c => ({
      type: 'company',
      title: `Nova empresa: ${c.name}`,
      time: c.createdAt,
      status: c.status
    }))
  ].sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime()).slice(0, 10)

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Relatórios e Estatísticas</h2>
        <p className="text-muted-foreground">
          Visão geral da atividade do portal
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageCircle className="w-5 h-5" />
              Postagens
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span>Total:</span>
                <span className="font-semibold">{totalPosts}</span>
              </div>
              <div className="flex justify-between">
                <span>Aprovadas:</span>
                <span className="font-semibold text-green-600">{approvedPosts}</span>
              </div>
              <div className="flex justify-between">
                <span>Pendentes:</span>
                <span className="font-semibold text-yellow-600">{pendingPosts}</span>
              </div>
              <div className="flex justify-between">
                <span>Rejeitadas:</span>
                <span className="font-semibold text-red-600">{rejectedPosts}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building className="w-5 h-5" />
              Empresas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span>Total:</span>
                <span className="font-semibold">{totalCompanies}</span>
              </div>
              <div className="flex justify-between">
                <span>Aprovadas:</span>
                <span className="font-semibold text-green-600">{approvedCompanies}</span>
              </div>
              <div className="flex justify-between">
                <span>Pendentes:</span>
                <span className="font-semibold text-yellow-600">{pendingCompanies}</span>
              </div>
              <div className="flex justify-between">
                <span>Rejeitadas:</span>
                <span className="font-semibold text-red-600">{rejectedCompanies}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5" />
            Atividade Recente
          </CardTitle>
        </CardHeader>
        <CardContent>
          {recentActivity.length > 0 ? (
            <div className="space-y-3">
              {recentActivity.map((activity, index) => (
                <div key={index} className="flex items-center justify-between py-2 border-b last:border-b-0">
                  <div className="flex items-center gap-3">
                    {activity.type === 'post' ? (
                      <MessageCircle className="w-4 h-4 text-muted-foreground" />
                    ) : (
                      <Building className="w-4 h-4 text-muted-foreground" />
                    )}
                    <span className="text-sm">{activity.title}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge 
                      variant={
                        activity.status === 'approved' ? 'default' : 
                        activity.status === 'pending' ? 'secondary' : 
                        'destructive'
                      }
                      className="text-xs"
                    >
                      {activity.status === 'approved' ? 'Aprovado' : 
                       activity.status === 'pending' ? 'Pendente' : 
                       'Rejeitado'}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      {new Date(activity.time).toLocaleDateString('pt-BR')}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-muted-foreground py-8">
              Nenhuma atividade recente
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}