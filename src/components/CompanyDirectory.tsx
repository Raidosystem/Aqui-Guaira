import { useState, useMemo, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Building, Phone, MapPin, Clock, ExternalLink, Search, WhatsappLogo, Navigation, Heart } from '@phosphor-icons/react'
import { useKV } from '@github/spark/hooks'
import { MapDisplay } from '@/components/MapDisplay'
import { DirectionsButton } from '@/components/DirectionsButton'
import { useBusinessFavorites } from '@/hooks/useBusinessFavorites'

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
  coordinates?: { lat: number; lng: number }
}

interface Category {
  id: string
  name: string
  color: string
}

interface CompanyDirectoryProps {
  onNavigate?: (tab: string) => void
  initialCategory?: string
}

export function CompanyDirectory({ onNavigate, initialCategory }: CompanyDirectoryProps = {}) {
  const [companies] = useKV<Company[]>('companies', [])
  const [categories] = useKV<Category[]>('categories', [])
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>(initialCategory || 'all')
  const [selectedNeighborhood, setSelectedNeighborhood] = useState<string>('all')
  const [sortBy, setSortBy] = useState<'name' | 'distance'>('name')
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null)
  const [isGettingLocation, setIsGettingLocation] = useState(false)

  const { addToFavorites, isFavorite } = useBusinessFavorites()

  // Get user location for distance sorting
  useEffect(() => {
    const getUserLocation = async () => {
      if (!navigator.geolocation) return
      
      setIsGettingLocation(true)
      try {
        const position = await new Promise<GeolocationPosition>((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(
            resolve,
            reject,
            { enableHighAccuracy: true, timeout: 10000, maximumAge: 300000 }
          )
        })
        setUserLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude
        })
      } catch (error) {
        console.error('Error getting location:', error)
      } finally {
        setIsGettingLocation(false)
      }
    }

    if (sortBy === 'distance' && !userLocation) {
      getUserLocation()
    }
  }, [sortBy, userLocation])

  const calculateDistance = (lat1: number, lng1: number, lat2: number, lng2: number): number => {
    const R = 6371 // Earth's radius in kilometers
    const dLat = (lat2 - lat1) * Math.PI / 180
    const dLng = (lng2 - lng1) * Math.PI / 180
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLng/2) * Math.sin(dLng/2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
    return R * c
  }

  const approvedCompanies = companies.filter(company => company.status === 'approved')

  const neighborhoods = useMemo(() => {
    const unique = [...new Set(approvedCompanies.map(c => c.neighborhood))]
    return unique.sort()
  }, [approvedCompanies])

  const filteredCompanies = useMemo(() => {
    let filtered = approvedCompanies.filter(company => {
      const matchesSearch = company.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           company.description.toLowerCase().includes(searchTerm.toLowerCase())
      
      const matchesCategory = selectedCategory === 'all' || 
                             company.categories.includes(selectedCategory)
      
      const matchesNeighborhood = selectedNeighborhood === 'all' || 
                                 company.neighborhood === selectedNeighborhood

      return matchesSearch && matchesCategory && matchesNeighborhood
    })

    // Sort by distance or name
    if (sortBy === 'distance' && userLocation) {
      filtered = filtered.sort((a, b) => {
        if (!a.coordinates || !b.coordinates) return 0
        const distanceA = calculateDistance(userLocation.lat, userLocation.lng, a.coordinates.lat, a.coordinates.lng)
        const distanceB = calculateDistance(userLocation.lat, userLocation.lng, b.coordinates.lat, b.coordinates.lng)
        return distanceA - distanceB
      })
    } else {
      filtered = filtered.sort((a, b) => a.name.localeCompare(b.name))
    }

    return filtered
  }, [approvedCompanies, searchTerm, selectedCategory, selectedNeighborhood, sortBy, userLocation])

  const handleAddToFavorites = (company: Company) => {
    addToFavorites({
      id: company.id,
      name: company.name,
      address: company.address,
      neighborhood: company.neighborhood,
      phone: company.phone,
      whatsapp: company.whatsapp,
      categories: company.categories,
      coordinates: company.coordinates
    })
  }

  const getCategoryColor = (categoryId: string) => {
    const category = categories.find(c => c.id === categoryId)
    return category?.color || 'bg-gray-100'
  }

  const getCategoryName = (categoryId: string) => {
    const category = categories.find(c => c.id === categoryId)
    return category?.name || categoryId
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Diretório de Empresas</h1>
        <p className="text-muted-foreground">
          Encontre comércios e serviços locais em Guaíra
        </p>
      </div>

      {/* Filters */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="text-lg">Filtros de Busca</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por nome ou serviço..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger>
                <SelectValue placeholder="Categoria" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas as categorias</SelectItem>
                {categories.map(category => (
                  <SelectItem key={category.id} value={category.id}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={selectedNeighborhood} onValueChange={setSelectedNeighborhood}>
              <SelectTrigger>
                <SelectValue placeholder="Bairro" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os bairros</SelectItem>
                {neighborhoods.map(neighborhood => (
                  <SelectItem key={neighborhood} value={neighborhood}>
                    {neighborhood}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={sortBy} onValueChange={(value) => setSortBy(value as 'name' | 'distance')}>
              <SelectTrigger>
                <SelectValue placeholder="Ordenar por" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="name">Nome</SelectItem>
                <SelectItem value="distance">
                  <div className="flex items-center gap-2">
                    <Navigation className="w-4 h-4" />
                    Distância
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {isGettingLocation && sortBy === 'distance' && (
            <div className="mt-4 p-3 bg-blue-50 rounded-lg flex items-center gap-2 text-sm text-blue-700">
              <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
              Obtendo sua localização para ordenar por distância...
            </div>
          )}

          {sortBy === 'distance' && !userLocation && !isGettingLocation && (
            <div className="mt-4 p-3 bg-yellow-50 rounded-lg text-sm text-yellow-700">
              Para ordenar por distância, permita o acesso à sua localização ou ative os serviços de localização.
            </div>
          )}
        </CardContent>
      </Card>

      {/* Results */}
      <div className="mb-4 flex items-center justify-between">
        <p className="text-muted-foreground">
          {filteredCompanies.length} empresa{filteredCompanies.length !== 1 ? 's' : ''} encontrada{filteredCompanies.length !== 1 ? 's' : ''}
        </p>
        
        <Button 
          variant="outline" 
          onClick={() => onNavigate?.('cadastro-empresa')}
        >
          Cadastrar minha empresa
        </Button>
      </div>

      {/* Company Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCompanies.map(company => {
          const distance = userLocation && company.coordinates 
            ? calculateDistance(userLocation.lat, userLocation.lng, company.coordinates.lat, company.coordinates.lng)
            : undefined

          return (
            <CompanyCard 
              key={company.id} 
              company={company} 
              getCategoryColor={getCategoryColor} 
              getCategoryName={getCategoryName}
              userLocation={userLocation}
              distance={distance}
              isFavorite={isFavorite(company.id)}
              onAddToFavorites={() => handleAddToFavorites(company)}
            />
          )
        })}
      </div>

      {filteredCompanies.length === 0 && (
        <Card className="text-center py-12">
          <CardContent>
            <Building className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Nenhuma empresa encontrada</h3>
            <p className="text-muted-foreground mb-4">
              Tente ajustar os filtros ou cadastre sua empresa
            </p>
            <Button onClick={() => onNavigate?.('cadastro-empresa')}>Cadastrar empresa</Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

interface CompanyCardProps {
  company: Company
  getCategoryColor: (categoryId: string) => string
  getCategoryName: (categoryId: string) => string
  userLocation?: { lat: number; lng: number } | null
  distance?: number
  isFavorite: boolean
  onAddToFavorites: () => void
}

function CompanyCard({ 
  company, 
  getCategoryColor, 
  getCategoryName, 
  userLocation, 
  distance, 
  isFavorite, 
  onAddToFavorites 
}: CompanyCardProps) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Card className="cursor-pointer hover:shadow-lg transition-shadow">
          <CardHeader className="pb-3">
            <div className="flex items-start gap-3">
              {company.logoUrl ? (
                <img 
                  src={company.logoUrl} 
                  alt={`Logo ${company.name}`}
                  className="w-12 h-12 rounded-lg object-cover"
                />
              ) : (
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                  <Building className="w-6 h-6 text-primary" />
                </div>
              )}
              
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <CardTitle className="text-lg truncate">{company.name}</CardTitle>
                    <CardDescription className="flex items-center gap-2">
                      <MapPin className="w-3 h-3" />
                      {company.neighborhood}
                      {distance !== undefined && (
                        <>
                          <span>•</span>
                          <Navigation className="w-3 h-3" />
                          <span>{distance < 1 ? `${Math.round(distance * 1000)}m` : `${distance.toFixed(1)}km`}</span>
                        </>
                      )}
                    </CardDescription>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation()
                      onAddToFavorites()
                    }}
                    className="ml-2"
                  >
                    <Heart 
                      className={`w-4 h-4 ${isFavorite ? 'text-red-500 fill-red-500' : 'text-muted-foreground'}`} 
                    />
                  </Button>
                </div>
              </div>
            </div>
          </CardHeader>

          <CardContent className="pt-0">
            <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
              {company.description}
            </p>

            <div className="flex flex-wrap gap-1 mb-3">
              {company.categories.slice(0, 2).map(categoryId => (
                <Badge key={categoryId} variant="secondary" className="text-xs">
                  {getCategoryName(categoryId)}
                </Badge>
              ))}
              {company.categories.length > 2 && (
                <Badge variant="outline" className="text-xs">
                  +{company.categories.length - 2}
                </Badge>
              )}
            </div>

            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Phone className="w-3 h-3" />
              {company.phone}
            </div>

            {/* Quick directions for companies with coordinates */}
            {company.coordinates && (
              <div className="mt-2 pt-2 border-t">
                <DirectionsButton
                  destination={{
                    lat: company.coordinates.lat,
                    lng: company.coordinates.lng,
                    name: company.name,
                    address: company.address
                  }}
                />
              </div>
            )}
          </CardContent>
        </Card>
      </DialogTrigger>

      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-start gap-3 mb-4">
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
            
            <div>
              <DialogTitle className="text-xl">{company.name}</DialogTitle>
              <DialogDescription className="flex items-center gap-1">
                <MapPin className="w-4 h-4" />
                {company.address}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4">
          <p className="text-sm">{company.description}</p>

          <div className="flex flex-wrap gap-1">
            {company.categories.map(categoryId => (
              <Badge key={categoryId} variant="secondary">
                {getCategoryName(categoryId)}
              </Badge>
            ))}
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Phone className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm">{company.phone}</span>
            </div>
            
            {company.whatsapp && (
              <div className="flex items-center gap-2">
                <WhatsappLogo className="w-4 h-4 text-green-600" />
                <span className="text-sm">{company.whatsapp}</span>
              </div>
            )}
            
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm">{company.hours}</span>
            </div>
          </div>

          <div className="flex gap-2 pt-4">
            <Button className="flex-1 gap-2" asChild>
              <a href={`tel:${company.phone}`}>
                <Phone className="w-4 h-4" />
                Ligar
              </a>
            </Button>
            
            {company.whatsapp && (
              <Button variant="outline" className="flex-1 gap-2" asChild>
                <a href={`https://wa.me/55${company.whatsapp.replace(/\D/g, '')}`} target="_blank">
                  <WhatsappLogo className="w-4 h-4" />
                  WhatsApp
                </a>
              </Button>
            )}
          </div>

          {company.website && (
            <Button variant="outline" className="w-full gap-2" asChild>
              <a href={company.website} target="_blank">
                <ExternalLink className="w-4 h-4" />
                Visitar site
              </a>
            </Button>
          )}

          {/* Location Map */}
          {company.coordinates && (
            <div className="space-y-2">
              <h4 className="font-medium text-sm">Localização</h4>
              <MapDisplay
                location={company.coordinates}
                title={company.name}
                address={company.address}
                height="200px"
                showDirections={true}
              />
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}