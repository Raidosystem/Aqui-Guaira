import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { Building, MapPin, Phone, Mail, Upload, Check } from '@phosphor-icons/react'
import { useKV } from '@github/spark/hooks'
import { toast } from 'sonner'

export function BusinessRegistration() {
  const [companies, setCompanies] = useKV('companies', [])
  const [categories] = useKV('categories', [])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  
  const [formData, setFormData] = useState({
    name: '',
    document: '',
    responsible: '',
    phone: '',
    whatsapp: '',
    email: '',
    address: '',
    cep: '',
    neighborhood: '',
    description: '',
    website: '',
    instagram: '',
    facebook: '',
    selectedCategories: [] as string[]
  })

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleCategoryToggle = (categoryId: string) => {
    setFormData(prev => ({
      ...prev,
      selectedCategories: prev.selectedCategories.includes(categoryId)
        ? prev.selectedCategories.filter(id => id !== categoryId)
        : [...prev.selectedCategories, categoryId]
    }))
  }

  const handleCepChange = async (cep: string) => {
    setFormData(prev => ({ ...prev, cep }))
    
    // Auto-fill address when CEP is complete (8 digits)
    if (cep.replace(/\D/g, '').length === 8) {
      try {
        const response = await fetch(`https://viacep.com.br/ws/${cep.replace(/\D/g, '')}/json/`)
        const data = await response.json()
        
        if (!data.erro) {
          setFormData(prev => ({
            ...prev,
            address: `${data.logradouro}, ${data.bairro}`,
            neighborhood: data.bairro
          }))
        }
      } catch (error) {
        console.error('Error fetching CEP data:', error)
      }
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      // Validate required fields
      if (!formData.name || !formData.document || !formData.phone || !formData.email) {
        toast.error('Preencha todos os campos obrigatórios')
        return
      }

      if (formData.selectedCategories.length === 0) {
        toast.error('Selecione pelo menos uma categoria')
        return
      }

      // Create new company entry
      const newCompany = {
        id: Date.now().toString(),
        ...formData,
        status: 'pending',
        createdAt: new Date().toISOString(),
        logo: null,
        images: []
      }

      // Add to companies list
      setCompanies((currentCompanies: any[]) => [...currentCompanies, newCompany])

      setIsSubmitted(true)
      toast.success('Cadastro enviado com sucesso! Aguarde aprovação.')
      
      // Reset form
      setFormData({
        name: '',
        document: '',
        responsible: '',
        phone: '',
        whatsapp: '',
        email: '',
        address: '',
        cep: '',
        neighborhood: '',
        description: '',
        website: '',
        instagram: '',
        facebook: '',
        selectedCategories: []
      })

    } catch (error) {
      console.error('Error submitting business registration:', error)
      toast.error('Erro ao enviar cadastro. Tente novamente.')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isSubmitted) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <Card className="border-green-200 bg-green-50">
            <CardHeader className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Check className="w-8 h-8 text-green-600" />
              </div>
              <CardTitle className="text-green-800">Cadastro Enviado!</CardTitle>
              <CardDescription className="text-green-700">
                Sua empresa foi cadastrada e está aguardando aprovação. Você receberá uma notificação quando for aprovada.
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <Button onClick={() => setIsSubmitted(false)} variant="outline">
                Cadastrar Outra Empresa
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-4">Cadastre sua Empresa</h1>
          <p className="text-muted-foreground">
            Divulgue seu negócio gratuitamente no portal da cidade de Guaíra
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building className="w-5 h-5" />
                Informações Básicas
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nome da Empresa *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    placeholder="Ex: Padaria do João"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="document">CNPJ/CPF *</Label>
                  <Input
                    id="document"
                    value={formData.document}
                    onChange={(e) => handleInputChange('document', e.target.value)}
                    placeholder="00.000.000/0000-00"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="responsible">Responsável *</Label>
                <Input
                  id="responsible"
                  value={formData.responsible}
                  onChange={(e) => handleInputChange('responsible', e.target.value)}
                  placeholder="Nome do proprietário/responsável"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Descrição do Negócio</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder="Descreva seus produtos/serviços..."
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          {/* Contact Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Phone className="w-5 h-5" />
                Contato
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="phone">Telefone *</Label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    placeholder="(17) 3331-0000"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="whatsapp">WhatsApp</Label>
                  <Input
                    id="whatsapp"
                    value={formData.whatsapp}
                    onChange={(e) => handleInputChange('whatsapp', e.target.value)}
                    placeholder="(17) 99999-0000"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">E-mail *</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  placeholder="contato@empresa.com"
                  required
                />
              </div>
            </CardContent>
          </Card>

          {/* Location */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="w-5 h-5" />
                Localização
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="cep">CEP</Label>
                  <Input
                    id="cep"
                    value={formData.cep}
                    onChange={(e) => handleCepChange(e.target.value)}
                    placeholder="14790-000"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="neighborhood">Bairro</Label>
                  <Input
                    id="neighborhood"
                    value={formData.neighborhood}
                    onChange={(e) => handleInputChange('neighborhood', e.target.value)}
                    placeholder="Centro"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="address">Endereço Completo</Label>
                <Input
                  id="address"
                  value={formData.address}
                  onChange={(e) => handleInputChange('address', e.target.value)}
                  placeholder="Rua Principal, 123, Centro"
                />
              </div>
            </CardContent>
          </Card>

          {/* Categories */}
          <Card>
            <CardHeader>
              <CardTitle>Categorias *</CardTitle>
              <CardDescription>
                Selecione as categorias que melhor descrevem seu negócio
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {categories.map((category: any) => (
                  <div key={category.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={`category-${category.id}`}
                      checked={formData.selectedCategories.includes(category.id)}
                      onCheckedChange={() => handleCategoryToggle(category.id)}
                    />
                    <Label
                      htmlFor={`category-${category.id}`}
                      className="text-sm font-normal cursor-pointer"
                    >
                      {category.name}
                    </Label>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Social Media */}
          <Card>
            <CardHeader>
              <CardTitle>Redes Sociais (Opcional)</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="website">Site</Label>
                <Input
                  id="website"
                  value={formData.website}
                  onChange={(e) => handleInputChange('website', e.target.value)}
                  placeholder="https://www.minhaempresa.com"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="instagram">Instagram</Label>
                  <Input
                    id="instagram"
                    value={formData.instagram}
                    onChange={(e) => handleInputChange('instagram', e.target.value)}
                    placeholder="@minhaempresa"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="facebook">Facebook</Label>
                  <Input
                    id="facebook"
                    value={formData.facebook}
                    onChange={(e) => handleInputChange('facebook', e.target.value)}
                    placeholder="facebook.com/minhaempresa"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Terms */}
          <Card>
            <CardContent className="pt-6">
              <div className="bg-muted/50 p-4 rounded-lg space-y-2 text-sm">
                <p className="font-medium">Importante:</p>
                <ul className="space-y-1 text-muted-foreground">
                  <li>• Seu cadastro passará por moderação antes de ser publicado</li>
                  <li>• Informações falsas resultarão em exclusão do cadastro</li>
                  <li>• O serviço é gratuito e não garantimos posicionamento</li>
                  <li>• Você pode editar suas informações após aprovação</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* Submit */}
          <div className="text-center">
            <Button 
              type="submit" 
              size="lg" 
              disabled={isSubmitting}
              className="px-8"
            >
              {isSubmitting ? 'Enviando...' : 'Cadastrar Empresa'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}