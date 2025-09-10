import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Heart, MapPin, Phone, WhatsappLogo, Building } from '@phosphor-icons/react'
import { useBusinessFavorites } from '@/hooks/useBusinessFavorites'
import { DirectionsButton } from '@/components/DirectionsButton'
import { useKV } from '@github/spark/hooks'

interface Category {
  id: string
  name: string
  color: string
}

interface FavoritesWidgetProps {
  maxItems?: number
  onBusinessSelect?: (business: { lat: number; lng: number; name: string; address: string }) => void
  showDirections?: boolean
  className?: string
}

export function FavoritesWidget({ 
  maxItems = 4, 
  onBusinessSelect, 
  showDirections = true,
  className 
}: FavoritesWidgetProps) {
  const { favorites, getFavoritesByCategory } = useBusinessFavorites()
  const [categories] = useKV<Category[]>('categories', [])

  const favoritesByCategory = getFavoritesByCategory()
  const displayedCategories = Object.keys(favoritesByCategory).slice(0, maxItems)

  const getCategoryName = (categoryId: string) => {
    const category = categories.find(c => c.id === categoryId)
    return category?.name || categoryId
  }

  const getCategoryColor = (categoryId: string) => {
    const category = categories.find(c => c.id === categoryId)
    return category?.color || '#6B7280'
  }

  if (favorites.length === 0) {
    return (
      <Card className={className}>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Heart className="w-5 h-5" />
            Empresas Favoritas
          </CardTitle>
          <CardDescription>
            Suas empresas favoritas aparecerão aqui
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          <div className="text-center space-y-2 py-4">
            <Building className="w-8 h-8 text-muted-foreground mx-auto" />
            <p className="text-sm text-muted-foreground">
              Nenhuma empresa favoritada ainda
            </p>
            <p className="text-xs text-muted-foreground">
              Use o botão ❤️ nas empresas para salvar como favoritas
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Heart className="w-5 h-5 text-red-500" />
          Empresas Favoritas
        </CardTitle>
        <CardDescription>
          Acesso rápido às suas empresas favoritas por categoria
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {displayedCategories.map((categoryId) => {
          const categoryBusinesses = favoritesByCategory[categoryId]
          const categoryName = getCategoryName(categoryId)
          const categoryColor = getCategoryColor(categoryId)
          
          return (
            <div key={categoryId} className="space-y-2">
              <div className="flex items-center gap-2">
                <div 
                  className="w-3 h-3 rounded-full" 
                  style={{ backgroundColor: categoryColor }}
                />
                <h4 className="font-medium text-sm">{categoryName}</h4>
                <Badge variant="outline" className="text-xs">
                  {categoryBusinesses.length}
                </Badge>
              </div>
              
              <div className="space-y-2 ml-5">
                {categoryBusinesses.slice(0, 2).map((business) => (
                  <div 
                    key={business.id}
                    className="flex items-center justify-between p-2 bg-gradient-to-r from-red-50 to-pink-50 border border-red-100 rounded-lg hover:from-red-100 hover:to-pink-100 transition-colors"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <Building className="w-3 h-3 text-muted-foreground" />
                        <span className="font-medium text-sm truncate">{business.name}</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <MapPin className="w-3 h-3" />
                        <span className="truncate">{business.neighborhood}</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Phone className="w-3 h-3" />
                        <span className="truncate">{business.phone}</span>
                      </div>
                    </div>
                    
                    <div className="flex gap-1 ml-2">
                      {business.whatsapp && (
                        <Button
                          variant="ghost"
                          size="sm"
                          asChild
                        >
                          <a
                            href={`https://wa.me/55${business.whatsapp.replace(/\D/g, '')}`}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <WhatsappLogo className="w-4 h-4 text-green-600" />
                          </a>
                        </Button>
                      )}
                      
                      {showDirections && business.coordinates && (
                        <DirectionsButton
                          destination={{
                            lat: business.coordinates.lat,
                            lng: business.coordinates.lng,
                            name: business.name,
                            address: business.address
                          }}
                        />
                      )}
                    </div>
                  </div>
                ))}
                
                {categoryBusinesses.length > 2 && (
                  <div className="text-center">
                    <p className="text-xs text-muted-foreground">
                      +{categoryBusinesses.length - 2} empresas
                    </p>
                  </div>
                )}
              </div>
            </div>
          )
        })}
        
        {Object.keys(favoritesByCategory).length > maxItems && (
          <div className="text-center pt-2 border-t">
            <p className="text-xs text-muted-foreground">
              +{Object.keys(favoritesByCategory).length - maxItems} categorias
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}