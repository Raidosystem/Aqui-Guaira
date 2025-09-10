import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { MapPin, Clock, Navigation } from '@phosphor-icons/react'
import { useKV } from '@github/spark/hooks'

interface RecentDestination {
  id: string
  name: string
  address: string
  visitedAt: string
  coordinates?: { lat: number; lng: number }
  category?: string
}

interface RecentDestinationsWidgetProps {
  maxItems?: number
  onLocationSelect?: (location: RecentDestination) => void
}

export function RecentDestinationsWidget({ 
  maxItems = 5, 
  onLocationSelect 
}: RecentDestinationsWidgetProps) {
  const [recentDestinations, setRecentDestinations] = useKV<RecentDestination[]>('recent_destinations', [])

  // Initialize with some sample destinations if empty
  if (recentDestinations.length === 0) {
    const sampleDestinations: RecentDestination[] = [
      {
        id: '1',
        name: 'Farmácia Central',
        address: 'Av. Principal, 123 - Centro',
        visitedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
        coordinates: { lat: -20.3189, lng: -48.3128 },
        category: 'Farmácia'
      },
      {
        id: '2',
        name: 'Supermercado Família',
        address: 'Rua do Comércio, 654 - Centro',
        visitedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
        coordinates: { lat: -20.3188, lng: -48.3125 },
        category: 'Supermercado'
      },
      {
        id: '3',
        name: 'Salão Beleza Pura',
        address: 'Av. das Palmeiras, 321 - Centro',
        visitedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days ago
        coordinates: { lat: -20.3192, lng: -48.3132 },
        category: 'Salão'
      }
    ]
    setRecentDestinations(sampleDestinations)
  }

  const displayedDestinations = recentDestinations.slice(0, maxItems)

  const formatTimeAgo = (dateString: string) => {
    const now = new Date()
    const visited = new Date(dateString)
    const diffInHours = Math.floor((now.getTime() - visited.getTime()) / (1000 * 60 * 60))
    
    if (diffInHours < 1) return 'Agora mesmo'
    if (diffInHours < 24) return `${diffInHours}h atrás`
    
    const diffInDays = Math.floor(diffInHours / 24)
    if (diffInDays === 1) return 'Ontem'
    if (diffInDays < 7) return `${diffInDays} dias atrás`
    
    return visited.toLocaleDateString('pt-BR')
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Clock className="w-5 h-5 text-primary" />
          Locais Recentes
        </CardTitle>
        <CardDescription>
          Seus destinos visitados recentemente
        </CardDescription>
      </CardHeader>
      <CardContent>
        {displayedDestinations.length === 0 ? (
          <div className="text-center py-6 text-muted-foreground">
            <MapPin className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">Nenhum local visitado recentemente</p>
          </div>
        ) : (
          <div className="space-y-3">
            {displayedDestinations.map((destination) => (
              <div 
                key={destination.id}
                className="flex items-center justify-between p-3 rounded-lg border bg-muted/30 hover:bg-muted/50 transition-colors cursor-pointer"
                onClick={() => onLocationSelect?.(destination)}
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-medium text-sm truncate">{destination.name}</h4>
                    {destination.category && (
                      <Badge variant="secondary" className="text-xs">
                        {destination.category}
                      </Badge>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground truncate mb-1">
                    {destination.address}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {formatTimeAgo(destination.visitedAt)}
                  </p>
                </div>
                <Button 
                  variant="ghost" 
                  size="sm"
                  className="ml-2 shrink-0"
                  onClick={(e) => {
                    e.stopPropagation()
                    onLocationSelect?.(destination)
                  }}
                >
                  <Navigation className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}