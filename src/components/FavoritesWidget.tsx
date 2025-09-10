import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Heart, MapPin, House, Briefcase, Navigation } from '@phosphor-icons/react'
import { useLocationHistory } from '@/hooks/useLocationHistory'
import { DirectionsButton } from '@/components/DirectionsButton'
import { FavoriteLocation } from '@/types/location'

interface FavoritesWidgetProps {
  maxItems?: number
  onLocationSelect?: (location: { lat: number; lng: number; name: string; address: string }) => void
  showDirections?: boolean
  className?: string
}

export function FavoritesWidget({ 
  maxItems = 4, 
  onLocationSelect, 
  showDirections = true,
  className 
}: FavoritesWidgetProps) {
  const { favoriteLocations } = useLocationHistory()

  const displayedFavorites = favoriteLocations.slice(0, maxItems)

  const getCategoryIcon = (category: FavoriteLocation['category']) => {
    switch (category) {
      case 'home': return <House className="w-4 h-4" />
      case 'work': return <Briefcase className="w-4 h-4" />
      case 'frequent': return <Navigation className="w-4 h-4" />
      default: return <MapPin className="w-4 h-4" />
    }
  }

  const getCategoryColor = (category: FavoriteLocation['category']) => {
    switch (category) {
      case 'home': return 'text-blue-600'
      case 'work': return 'text-purple-600'
      case 'frequent': return 'text-green-600'
      default: return 'text-orange-600'
    }
  }

  const getCategoryLabel = (category: FavoriteLocation['category']) => {
    switch (category) {
      case 'home': return 'Casa'
      case 'work': return 'Trabalho'
      case 'frequent': return 'Frequente'
      default: return 'Outro'
    }
  }

  if (displayedFavorites.length === 0) {
    return (
      <Card className={className}>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Heart className="w-5 h-5" />
            Favoritos
          </CardTitle>
          <CardDescription>
            Seus locais favoritos aparecerão aqui
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          <div className="text-center space-y-2 py-4">
            <Heart className="w-8 h-8 text-muted-foreground mx-auto" />
            <p className="text-sm text-muted-foreground">
              Nenhum favorito ainda
            </p>
            <p className="text-xs text-muted-foreground">
              Use o botão ❤️ nas empresas ou locais para salvar como favoritos
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
          Favoritos
        </CardTitle>
        <CardDescription>
          Acesso rápido aos seus locais favoritos
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-3">
        {displayedFavorites.map((favorite) => (
          <div 
            key={favorite.id}
            className="flex items-center justify-between p-3 bg-gradient-to-r from-red-50 to-pink-50 border border-red-100 rounded-lg hover:from-red-100 hover:to-pink-100 transition-colors"
          >
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <div className={getCategoryColor(favorite.category)}>
                  {getCategoryIcon(favorite.category)}
                </div>
                <h4 className="font-medium text-sm truncate">{favorite.name}</h4>
                <Badge variant="outline" className="text-xs">
                  {getCategoryLabel(favorite.category)}
                </Badge>
              </div>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <MapPin className="w-3 h-3" />
                <span className="truncate">{favorite.address}</span>
              </div>
              {(favorite.tags && favorite.tags.length > 0) && (
                <div className="flex gap-1 mt-1">
                  {favorite.tags.slice(0, 2).map((tag) => (
                    <Badge key={tag} variant="secondary" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                  {favorite.tags.length > 2 && (
                    <Badge variant="outline" className="text-xs">
                      +{favorite.tags.length - 2}
                    </Badge>
                  )}
                </div>
              )}
              <div className="text-xs text-muted-foreground mt-1">
                Usado {favorite.usageCount} vezes
              </div>
            </div>
            
            <div className="flex gap-1 ml-2">
              {onLocationSelect && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onLocationSelect(favorite)}
                >
                  <Navigation className="w-4 h-4" />
                </Button>
              )}
              
              {showDirections && (
                <DirectionsButton
                  destination={{
                    lat: favorite.lat,
                    lng: favorite.lng,
                    name: favorite.name,
                    address: favorite.address
                  }}
                />
              )}
            </div>
          </div>
        ))}
        
        {favoriteLocations.length > maxItems && (
          <div className="text-center pt-2">
            <p className="text-xs text-muted-foreground">
              +{favoriteLocations.length - maxItems} favoritos
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}