import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Clock, MapPin, Navigation, Car, Walking } from '@phosphor-icons/react'
import { useLocationHistory } from '@/hooks/useLocationHistory'
import { DirectionsButton } from '@/components/DirectionsButton'

interface RecentDestinationsWidgetProps {
  maxItems?: number
  onLocationSelect?: (location: { lat: number; lng: number; name: string; address: string }) => void
  showDirections?: boolean
  className?: string
}

export function RecentDestinationsWidget({ 
  maxItems = 5, 
  onLocationSelect, 
  showDirections = true,
  className 
}: RecentDestinationsWidgetProps) {
  const { recentDestinations } = useLocationHistory()

  const displayedDestinations = recentDestinations.slice(0, maxItems)

  if (displayedDestinations.length === 0) {
    return null
  }

  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Clock className="w-5 h-5" />
          Destinos Recentes
        </CardTitle>
        <CardDescription>
          Acesso rápido aos seus últimos destinos
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-3">
        {displayedDestinations.map((destination) => (
          <div 
            key={destination.id}
            className="flex items-center justify-between p-3 bg-muted/50 rounded-lg hover:bg-muted/70 transition-colors"
          >
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h4 className="font-medium text-sm truncate">{destination.name}</h4>
                {destination.routeMode && (
                  <Badge variant="outline" className="text-xs">
                    {destination.routeMode === 'driving' ? (
                      <Car className="w-3 h-3 mr-1" />
                    ) : (
                      <Walking className="w-3 h-3 mr-1" />
                    )}
                    {destination.routeMode === 'driving' ? 'Carro' : 'Pé'}
                  </Badge>
                )}
              </div>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <MapPin className="w-3 h-3" />
                <span className="truncate">{destination.address}</span>
              </div>
              {(destination.travelTime || destination.distance) && (
                <div className="flex gap-3 mt-1 text-xs text-muted-foreground">
                  {destination.travelTime && destination.travelTime !== 'N/A' && (
                    <span>⏱️ {destination.travelTime}</span>
                  )}
                  {destination.distance && destination.distance !== 'N/A' && (
                    <span>📍 {destination.distance}</span>
                  )}
                </div>
              )}
            </div>
            
            <div className="flex gap-1 ml-2">
              {onLocationSelect && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onLocationSelect(destination)}
                >
                  <Navigation className="w-4 h-4" />
                </Button>
              )}
              
              {showDirections && (
                <DirectionsButton
                  destination={{
                    lat: destination.lat,
                    lng: destination.lng,
                    name: destination.name,
                    address: destination.address
                  }}
                />
              )}
            </div>
          </div>
        ))}
        
        {recentDestinations.length > maxItems && (
          <div className="text-center pt-2">
            <p className="text-xs text-muted-foreground">
              +{recentDestinations.length - maxItems} destinos mais antigos
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}