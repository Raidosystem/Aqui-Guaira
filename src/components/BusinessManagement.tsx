import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { useKV } from '@github/spark/hooks'
import { toast } from 'sonner'
import { Building, Phone, MapPin, Clock, Globe, Image, Save, Eye, AlertCircle, Upload, X, Check, Calendar } from '@phosphor-icons/react'

interface BusinessUpdate {
  id: string
  name: string
  phone: string
  whatsapp: string
  email: string
  address: string
  cep: string
  description: string
  website?: string
  instagram?: string
  facebook?: string
  hours: {
    monday?: string
    tuesday?: string
    wednesday?: string
    thursday?: string
    friday?: string
    saturday?: string
    sunday?: string
  }
  categories: string[]
  images: string[]
  logo?: string
}

export function BusinessManagement() {
  const [user, setUser] = useState<any>(null)
  const [companies] = useKV<any[]>('companies', [])
  const [categories] = useKV<any[]>('categories', [])
  const [myBusinesses, setMyBusinesses] = useState<any[]>([])
  const [selectedBusiness, setSelectedBusiness] = useState<any>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState<BusinessUpdate | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [newImages, setNewImages] = useState<File[]>([])
  const [newLogo, setNewLogo] = useState<File | null>(null)

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

  useEffect(() => {
    if (selectedBusiness && isEditing) {
      setFormData({
        id: selectedBusiness.id,
        name: selectedBusiness.name || '',
        phone: selectedBusiness.phone || '',
        whatsapp: selectedBusiness.whatsapp || '',
        email: selectedBusiness.email || '',
        address: selectedBusiness.address || '',
        cep: selectedBusiness.cep || '',
        description: selectedBusiness.description || '',
        website: selectedBusiness.website || '',
        instagram: selectedBusiness.instagram || '',
        facebook: selectedBusiness.facebook || '',
        hours: selectedBusiness.hours || {},
        categories: selectedBusiness.categories || [],
        images: selectedBusiness.images || [],
        logo: selectedBusiness.logo
      })
    }
  }, [selectedBusiness, isEditing])

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>, type: 'gallery' | 'logo') => {
    const files = event.target.files
    if (!files) return

    if (type === 'logo') {
      const file = files[0]
      if (file && file.type.startsWith('image/')) {
        if (file.size > 5 * 1024 * 1024) {
          toast.error('Logo deve ter no máximo 5MB')
          return
        }
        setNewLogo(file)
      }
    } else {
      const validFiles = Array.from(files).filter(file => {
        if (!file.type.startsWith('image/')) {
          toast.error(`${file.name} não é uma imagem válida`)
          return false
        }
        if (file.size > 10 * 1024 * 1024) {
          toast.error(`${file.name} deve ter no máximo 10MB`)
          return false
        }
        return true
      })

      if (newImages.length + validFiles.length > 10) {
        toast.error('Máximo de 10 imagens permitidas')
        return
      }

      setNewImages(prev => [...prev, ...validFiles])
    }
  }

  const removeNewImage = (index: number) => {
    setNewImages(prev => prev.filter((_, i) => i !== index))
  }

  const removeExistingImage = (imageUrl: string) => {
    if (!formData) return
    setFormData({
      ...formData,
      images: formData.images.filter(img => img !== imageUrl)
    })
  }

  const updateBusinessHours = (day: string, hours: string) => {
    if (!formData) return
    setFormData({
      ...formData,
      hours: {
        ...formData.hours,
        [day]: hours
      }
    })
  }

  const toggleCategory = (categoryId: string) => {
    if (!formData) return
    const newCategories = formData.categories.includes(categoryId)
      ? formData.categories.filter(id => id !== categoryId)
      : [...formData.categories, categoryId]
    
    setFormData({
      ...formData,
      categories: newCategories
    })
  }

  const handleSave = async () => {
    if (!formData || !selectedBusiness) return

    setIsLoading(true)
    try {
      // Simulate image upload
      const uploadedImages = newImages.map((_, index) => 
        `https://images.unsplash.com/photo-${Date.now() + index}?w=400&h=300&fit=crop`
      )
      
      const uploadedLogo = newLogo 
        ? `https://images.unsplash.com/photo-${Date.now()}?w=200&h=200&fit=crop`
        : formData.logo

      const updatedBusiness = {
        ...selectedBusiness,
        ...formData,
        logo: uploadedLogo,
        images: [...formData.images, ...uploadedImages],
        status: 'pending_approval', // Reset to pending when updated
        updatedAt: new Date().toISOString()
      }

      // Update companies array
      const currentCompanies = await spark.kv.get<any[]>('companies') || []
      const updatedCompanies = currentCompanies.map(company =>
        company.id === selectedBusiness.id ? updatedBusiness : company
      )
      
      await spark.kv.set('companies', updatedCompanies)

      // Reset form state
      setIsEditing(false)
      setNewImages([])
      setNewLogo(null)
      setSelectedBusiness(updatedBusiness)

      toast.success('Informações atualizadas! Aguarde aprovação do administrador.')
    } catch (error) {
      console.error('Error updating business:', error)
      toast.error('Erro ao atualizar informações')
    } finally {
      setIsLoading(false)
    }
  }

  const handleCancel = () => {
    setIsEditing(false)
    setFormData(null)
    setNewImages([])
    setNewLogo(null)
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <Badge variant="default" className="bg-green-100 text-green-800 border-green-200"><Check className="w-3 h-3 mr-1" />Aprovado</Badge>
      case 'pending_approval':
        return <Badge variant="secondary"><Clock className="w-3 h-3 mr-1" />Pendente</Badge>
      case 'rejected':
        return <Badge variant="destructive"><X className="w-3 h-3 mr-1" />Rejeitado</Badge>
      default:
        return <Badge variant="outline">Status desconhecido</Badge>
    }
  }

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="flex items-center justify-center py-12">
            <div className="text-center">
              <AlertCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">Você precisa estar logado para gerenciar suas empresas</p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (myBusinesses.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="flex items-center justify-center py-12">
            <div className="text-center">
              <Building className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Nenhuma empresa cadastrada</h3>
              <p className="text-muted-foreground mb-4">Você ainda não possui empresas cadastradas no portal</p>
              <Button onClick={() => window.location.reload()}>
                <Building className="w-4 h-4 mr-2" />
                Cadastrar Nova Empresa
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Gerenciar Empresas</h1>
        <p className="text-muted-foreground">Atualize as informações e fotos das suas empresas cadastradas</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Business List Sidebar */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Suas Empresas</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {myBusinesses.map((business) => (
                <Button
                  key={business.id}
                  variant={selectedBusiness?.id === business.id ? "default" : "ghost"}
                  className="w-full justify-start h-auto p-4"
                  onClick={() => {
                    setSelectedBusiness(business)
                    setIsEditing(false)
                    setFormData(null)
                  }}
                >
                  <div className="text-left">
                    <div className="font-medium truncate">{business.name}</div>
                    <div className="text-xs mt-1">{getStatusBadge(business.status)}</div>
                  </div>
                </Button>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Business Details */}
        <div className="lg:col-span-3">
          {selectedBusiness && (
            <div className="space-y-6">
              {/* Header */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <Building className="w-5 h-5" />
                        {selectedBusiness.name}
                      </CardTitle>
                      <CardDescription className="flex items-center gap-2 mt-2">
                        Status: {getStatusBadge(selectedBusiness.status)}
                        {selectedBusiness.updatedAt && (
                          <span className="text-xs text-muted-foreground ml-2">
                            <Calendar className="w-3 h-3 inline mr-1" />
                            Atualizado em {new Date(selectedBusiness.updatedAt).toLocaleDateString('pt-BR')}
                          </span>
                        )}
                      </CardDescription>
                    </div>
                    <div className="flex gap-2">
                      {!isEditing ? (
                        <Button onClick={() => setIsEditing(true)}>
                          <Save className="w-4 h-4 mr-2" />
                          Editar
                        </Button>
                      ) : (
                        <>
                          <Button variant="outline" onClick={handleCancel}>
                            Cancelar
                          </Button>
                          <Button onClick={handleSave} disabled={isLoading}>
                            <Save className="w-4 h-4 mr-2" />
                            {isLoading ? 'Salvando...' : 'Salvar'}
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                </CardHeader>
              </Card>

              {/* Content Tabs */}
              <Tabs defaultValue="info" className="space-y-6">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="info">Informações</TabsTrigger>
                  <TabsTrigger value="contact">Contato</TabsTrigger>
                  <TabsTrigger value="hours">Horários</TabsTrigger>
                  <TabsTrigger value="media">Mídia</TabsTrigger>
                </TabsList>

                {/* Basic Information */}
                <TabsContent value="info">
                  <Card>
                    <CardHeader>
                      <CardTitle>Informações Básicas</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {isEditing && formData ? (
                        <>
                          <div className="space-y-2">
                            <Label htmlFor="name">Nome da Empresa</Label>
                            <Input
                              id="name"
                              value={formData.name}
                              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            />
                          </div>
                          
                          <div className="space-y-2">
                            <Label htmlFor="description">Descrição</Label>
                            <Textarea
                              id="description"
                              rows={4}
                              value={formData.description}
                              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                              placeholder="Descreva sua empresa, produtos e serviços..."
                            />
                          </div>

                          <div className="space-y-2">
                            <Label>Categorias</Label>
                            <div className="flex flex-wrap gap-2">
                              {categories.map((category) => (
                                <Badge
                                  key={category.id}
                                  variant={formData.categories.includes(category.id) ? "default" : "outline"}
                                  className="cursor-pointer"
                                  onClick={() => toggleCategory(category.id)}
                                >
                                  {category.icon} {category.name}
                                </Badge>
                              ))}
                            </div>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label htmlFor="address">Endereço</Label>
                              <Input
                                id="address"
                                value={formData.address}
                                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="cep">CEP</Label>
                              <Input
                                id="cep"
                                value={formData.cep}
                                onChange={(e) => setFormData({ ...formData, cep: e.target.value })}
                                placeholder="00000-000"
                              />
                            </div>
                          </div>
                        </>
                      ) : (
                        <div className="space-y-4">
                          <div>
                            <h4 className="font-medium text-sm text-muted-foreground mb-1">Nome</h4>
                            <p>{selectedBusiness.name}</p>
                          </div>
                          <div>
                            <h4 className="font-medium text-sm text-muted-foreground mb-1">Descrição</h4>
                            <p>{selectedBusiness.description || 'Nenhuma descrição cadastrada'}</p>
                          </div>
                          <div>
                            <h4 className="font-medium text-sm text-muted-foreground mb-1">Categorias</h4>
                            <div className="flex flex-wrap gap-2">
                              {selectedBusiness.categories?.map((categoryId: string) => {
                                const category = categories.find(c => c.id === categoryId)
                                return category ? (
                                  <Badge key={categoryId} variant="secondary">
                                    {category.icon} {category.name}
                                  </Badge>
                                ) : null
                              })}
                            </div>
                          </div>
                          <div>
                            <h4 className="font-medium text-sm text-muted-foreground mb-1">Endereço</h4>
                            <p className="flex items-center gap-1">
                              <MapPin className="w-4 h-4" />
                              {selectedBusiness.address} - {selectedBusiness.cep}
                            </p>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Contact Information */}
                <TabsContent value="contact">
                  <Card>
                    <CardHeader>
                      <CardTitle>Informações de Contato</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {isEditing && formData ? (
                        <>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label htmlFor="phone">Telefone</Label>
                              <Input
                                id="phone"
                                value={formData.phone}
                                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                placeholder="(17) 99999-9999"
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="whatsapp">WhatsApp</Label>
                              <Input
                                id="whatsapp"
                                value={formData.whatsapp}
                                onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })}
                                placeholder="(17) 99999-9999"
                              />
                            </div>
                          </div>
                          
                          <div className="space-y-2">
                            <Label htmlFor="email">E-mail</Label>
                            <Input
                              id="email"
                              type="email"
                              value={formData.email}
                              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            />
                          </div>

                          <Separator />

                          <div className="space-y-4">
                            <Label>Redes Sociais e Website</Label>
                            <div className="space-y-3">
                              <div className="space-y-2">
                                <Label htmlFor="website">Website</Label>
                                <Input
                                  id="website"
                                  value={formData.website || ''}
                                  onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                                  placeholder="https://www.exemplo.com"
                                />
                              </div>
                              <div className="space-y-2">
                                <Label htmlFor="instagram">Instagram</Label>
                                <Input
                                  id="instagram"
                                  value={formData.instagram || ''}
                                  onChange={(e) => setFormData({ ...formData, instagram: e.target.value })}
                                  placeholder="@empresa"
                                />
                              </div>
                              <div className="space-y-2">
                                <Label htmlFor="facebook">Facebook</Label>
                                <Input
                                  id="facebook"
                                  value={formData.facebook || ''}
                                  onChange={(e) => setFormData({ ...formData, facebook: e.target.value })}
                                  placeholder="facebook.com/empresa"
                                />
                              </div>
                            </div>
                          </div>
                        </>
                      ) : (
                        <div className="space-y-4">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <h4 className="font-medium text-sm text-muted-foreground mb-1">Telefone</h4>
                              <p className="flex items-center gap-1">
                                <Phone className="w-4 h-4" />
                                {selectedBusiness.phone || 'Não informado'}
                              </p>
                            </div>
                            <div>
                              <h4 className="font-medium text-sm text-muted-foreground mb-1">WhatsApp</h4>
                              <p className="flex items-center gap-1">
                                <Phone className="w-4 h-4" />
                                {selectedBusiness.whatsapp || 'Não informado'}
                              </p>
                            </div>
                          </div>
                          <div>
                            <h4 className="font-medium text-sm text-muted-foreground mb-1">E-mail</h4>
                            <p>{selectedBusiness.email || 'Não informado'}</p>
                          </div>
                          {(selectedBusiness.website || selectedBusiness.instagram || selectedBusiness.facebook) && (
                            <>
                              <Separator />
                              <div>
                                <h4 className="font-medium text-sm text-muted-foreground mb-2">Links</h4>
                                <div className="space-y-2">
                                  {selectedBusiness.website && (
                                    <p className="flex items-center gap-1">
                                      <Globe className="w-4 h-4" />
                                      <a href={selectedBusiness.website} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                                        Website
                                      </a>
                                    </p>
                                  )}
                                  {selectedBusiness.instagram && (
                                    <p className="flex items-center gap-1">
                                      <Globe className="w-4 h-4" />
                                      <span>{selectedBusiness.instagram}</span>
                                    </p>
                                  )}
                                  {selectedBusiness.facebook && (
                                    <p className="flex items-center gap-1">
                                      <Globe className="w-4 h-4" />
                                      <span>{selectedBusiness.facebook}</span>
                                    </p>
                                  )}
                                </div>
                              </div>
                            </>
                          )}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Business Hours */}
                <TabsContent value="hours">
                  <Card>
                    <CardHeader>
                      <CardTitle>Horário de Funcionamento</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {isEditing && formData ? (
                        <div className="space-y-4">
                          {['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'].map((day) => {
                            const dayLabels: Record<string, string> = {
                              monday: 'Segunda-feira',
                              tuesday: 'Terça-feira',
                              wednesday: 'Quarta-feira',
                              thursday: 'Quinta-feira',
                              friday: 'Sexta-feira',
                              saturday: 'Sábado',
                              sunday: 'Domingo'
                            }
                            
                            return (
                              <div key={day} className="flex items-center gap-4">
                                <div className="w-24 text-sm font-medium">{dayLabels[day]}</div>
                                <Input
                                  value={formData.hours[day as keyof typeof formData.hours] || ''}
                                  onChange={(e) => updateBusinessHours(day, e.target.value)}
                                  placeholder="Ex: 08:00-18:00 ou Fechado"
                                  className="max-w-xs"
                                />
                              </div>
                            )
                          })}
                        </div>
                      ) : (
                        <div className="space-y-3">
                          {Object.entries({
                            monday: 'Segunda-feira',
                            tuesday: 'Terça-feira',
                            wednesday: 'Quarta-feira',
                            thursday: 'Quinta-feira',
                            friday: 'Sexta-feira',
                            saturday: 'Sábado',
                            sunday: 'Domingo'
                          }).map(([day, label]) => (
                            <div key={day} className="flex items-center justify-between">
                              <span className="font-medium">{label}</span>
                              <span className="text-muted-foreground">
                                {selectedBusiness.hours?.[day] || 'Não informado'}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Media Management */}
                <TabsContent value="media">
                  <div className="space-y-6">
                    {/* Logo */}
                    <Card>
                      <CardHeader>
                        <CardTitle>Logo da Empresa</CardTitle>
                        <CardDescription>Imagem quadrada recomendada (200x200px mínimo)</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="flex items-center gap-4">
                          {(selectedBusiness.logo || newLogo) && (
                            <div className="w-20 h-20 bg-muted rounded-lg overflow-hidden">
                              {newLogo ? (
                                <img 
                                  src={URL.createObjectURL(newLogo)} 
                                  alt="Novo logo" 
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <img 
                                  src={selectedBusiness.logo} 
                                  alt="Logo atual" 
                                  className="w-full h-full object-cover"
                                />
                              )}
                            </div>
                          )}
                          
                          {isEditing && (
                            <div className="flex-1">
                              <Label htmlFor="logo-upload" className="cursor-pointer">
                                <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center hover:border-muted-foreground/50 transition-colors">
                                  <Upload className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                                  <p className="text-sm text-muted-foreground">
                                    Clique para escolher novo logo
                                  </p>
                                  <p className="text-xs text-muted-foreground mt-1">
                                    Máximo 5MB - JPG, PNG
                                  </p>
                                </div>
                              </Label>
                              <Input
                                id="logo-upload"
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={(e) => handleImageUpload(e, 'logo')}
                              />
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>

                    {/* Gallery */}
                    <Card>
                      <CardHeader>
                        <CardTitle>Galeria de Fotos</CardTitle>
                        <CardDescription>Até 10 imagens para mostrar seus produtos e ambiente</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          {/* Existing Images */}
                          {isEditing && formData && formData.images.length > 0 && (
                            <div>
                              <h4 className="font-medium mb-3">Imagens atuais</h4>
                              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                {formData.images.map((imageUrl, index) => (
                                  <div key={index} className="relative group">
                                    <img 
                                      src={imageUrl} 
                                      alt={`Imagem ${index + 1}`}
                                      className="w-full h-24 object-cover rounded-lg"
                                    />
                                    <Button
                                      size="sm"
                                      variant="destructive"
                                      className="absolute top-1 right-1 w-6 h-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                                      onClick={() => removeExistingImage(imageUrl)}
                                    >
                                      <X className="w-3 h-3" />
                                    </Button>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* New Images Preview */}
                          {newImages.length > 0 && (
                            <div>
                              <h4 className="font-medium mb-3">Novas imagens</h4>
                              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                {newImages.map((file, index) => (
                                  <div key={index} className="relative group">
                                    <img 
                                      src={URL.createObjectURL(file)} 
                                      alt={`Nova imagem ${index + 1}`}
                                      className="w-full h-24 object-cover rounded-lg"
                                    />
                                    <Button
                                      size="sm"
                                      variant="destructive"
                                      className="absolute top-1 right-1 w-6 h-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                                      onClick={() => removeNewImage(index)}
                                    >
                                      <X className="w-3 h-3" />
                                    </Button>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Current Images Display (View Mode) */}
                          {!isEditing && selectedBusiness.images && selectedBusiness.images.length > 0 && (
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                              {selectedBusiness.images.map((imageUrl: string, index: number) => (
                                <img 
                                  key={index}
                                  src={imageUrl} 
                                  alt={`Imagem ${index + 1}`}
                                  className="w-full h-24 object-cover rounded-lg"
                                />
                              ))}
                            </div>
                          )}

                          {/* Upload Area */}
                          {isEditing && (
                            <div>
                              <Label htmlFor="gallery-upload" className="cursor-pointer">
                                <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center hover:border-muted-foreground/50 transition-colors">
                                  <Image className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                                  <p className="text-lg font-medium mb-2">Adicionar fotos à galeria</p>
                                  <p className="text-sm text-muted-foreground mb-1">
                                    Clique para escolher ou arraste arquivos aqui
                                  </p>
                                  <p className="text-xs text-muted-foreground">
                                    Máximo 10MB por imagem - JPG, PNG
                                  </p>
                                </div>
                              </Label>
                              <Input
                                id="gallery-upload"
                                type="file"
                                accept="image/*"
                                multiple
                                className="hidden"
                                onChange={(e) => handleImageUpload(e, 'gallery')}
                              />
                            </div>
                          )}

                          {!isEditing && (!selectedBusiness.images || selectedBusiness.images.length === 0) && (
                            <div className="text-center py-8 text-muted-foreground">
                              <Image className="w-12 h-12 mx-auto mb-4" />
                              <p>Nenhuma imagem cadastrada</p>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>
              </Tabs>

              {/* Status Info */}
              {selectedBusiness.status === 'pending_approval' && (
                <Card className="border-yellow-200 bg-yellow-50">
                  <CardContent className="flex items-center gap-3 pt-6">
                    <AlertCircle className="w-5 h-5 text-yellow-600" />
                    <div>
                      <p className="font-medium text-yellow-800">Aguardando aprovação</p>
                      <p className="text-sm text-yellow-700">
                        Suas alterações estão sendo analisadas pelo administrador e aparecerão no portal após aprovação.
                      </p>
                    </div>
                  </CardContent>
                </Card>
              )}

              {selectedBusiness.status === 'rejected' && (
                <Card className="border-red-200 bg-red-50">
                  <CardContent className="flex items-center gap-3 pt-6">
                    <X className="w-5 h-5 text-red-600" />
                    <div>
                      <p className="font-medium text-red-800">Cadastro rejeitado</p>
                      <p className="text-sm text-red-700">
                        Seu cadastro foi rejeitado. Verifique as informações e tente novamente.
                      </p>
                      {selectedBusiness.rejectionReason && (
                        <p className="text-sm text-red-700 mt-1">
                          <strong>Motivo:</strong> {selectedBusiness.rejectionReason}
                        </p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}