import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { NavigationArrow, MapPin, Car, Walking, Clock, AlertTriangle, Heart, Star } from '@phosphor-icons/react'
import { useLocationHistory } from '@/hooks/useLocationHistory'
import { toast } from 'sonner'

interface DirectionsButtonProps {
  destination: {
    lat: number
    lng: number
    name: string
    address: string
  }
}

interface UserLocation {
  lat: number
  lng: number
}

interface RouteInfo {
  distance: string
  duration: string
  mode: 'driving' | 'walking'
}

export function DirectionsButton({ destination }: DirectionsButtonProps) {
  const [userLocation, setUserLocation] = useState<UserLocation | null>(null)
  const [isGettingLocation, setIsGettingLocation] = useState(false)
  const [locationError, setLocationError] = useState<string | null>(null)
  const [isOpen, setIsOpen] = useState(false)
  
  const { addToRecent, saveLocation, addToFavorites } = useLocationHistory()

  const getUserLocation = async () => {
    setIsGettingLocation(true)
    setLocationError(null)

    try {
      if (!navigator.geolocation) {
        throw new Error('Geolocalização não é suportada pelo seu navegador')
      }

      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(
          resolve,
          reject,
          {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 300000 // 5 minutes cache
          }
        )
      })

      setUserLocation({
        lat: position.coords.latitude,
        lng: position.coords.longitude
      })
    } catch (error: any) {
      console.error('Error getting location:', error)
      let errorMessage = 'Erro ao obter localização'
      
      if (error.code === error.PERMISSION_DENIED) {
        errorMessage = 'Permissão de localização negada. Habilite a localização nas configurações do navegador.'
      } else if (error.code === error.POSITION_UNAVAILABLE) {
        errorMessage = 'Localização indisponível. Verifique se o GPS está ativado.'
      } else if (error.code === error.TIMEOUT) {
        errorMessage = 'Tempo limite excedido ao obter localização. Tente novamente.'
      }
      
      setLocationError(errorMessage)
    } finally {
      setIsGettingLocation(false)
    }
  }

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

  const getRouteEstimates = (): RouteInfo[] => {
    if (!userLocation) return []

    const distance = calculateDistance(
      userLocation.lat, 
      userLocation.lng, 
      destination.lat, 
      destination.lng
    )

    const routes: RouteInfo[] = []

    // Driving estimate (average 40 km/h in city)
    const drivingMinutes = Math.round((distance / 40) * 60)
    routes.push({
      distance: distance < 1 ? `${Math.round(distance * 1000)}m` : `${distance.toFixed(1)}km`,
      duration: drivingMinutes < 60 ? `${drivingMinutes} min` : `${Math.floor(drivingMinutes / 60)}h ${drivingMinutes % 60}min`,
      mode: 'driving'
    })

    // Walking estimate (average 5 km/h)
    const walkingMinutes = Math.round((distance / 5) * 60)
    if (distance <= 5) { // Only show walking for distances up to 5km
      routes.push({
        distance: distance < 1 ? `${Math.round(distance * 1000)}m` : `${distance.toFixed(1)}km`,
        duration: walkingMinutes < 60 ? `${walkingMinutes} min` : `${Math.floor(walkingMinutes / 60)}h ${walkingMinutes % 60}min`,
        mode: 'walking'
      })
    }

    return routes
  }

  const openInMaps = (mode: 'driving' | 'walking' = 'driving') => {
    if (!userLocation) return

    const origin = `${userLocation.lat},${userLocation.lng}`
    const dest = `${destination.lat},${destination.lng}`
    
    // Add to recent destinations with route info
    const routes = getRouteEstimates()
    const routeInfo = routes.find(r => r.mode === mode)
    if (routeInfo) {
      addToRecent(destination, {
        mode,
        time: routeInfo.duration,
        distance: routeInfo.distance
      })
    }
    
    // Check if it's a mobile device
    const isMobile = /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
    
    if (isMobile) {
      // Try to open in native maps app
      const googleMapsUrl = `https://www.google.com/maps/dir/?api=1&origin=${origin}&destination=${dest}&travelmode=${mode === 'walking' ? 'walking' : 'driving'}`
      window.open(googleMapsUrl, '_blank')
    } else {
      // Open in web browser
      const googleMapsUrl = `https://www.google.com/maps/dir/${origin}/${dest}/@${destination.lat},${destination.lng},15z/data=!3m1!4b1!4m2!4m1!3e${mode === 'walking' ? '2' : '0'}`
      window.open(googleMapsUrl, '_blank')
    }
  }

  const openInWaze = () => {
    if (!userLocation) return
    
    // Add to recent destinations
    addToRecent(destination, {
      mode: 'driving',
      time: 'N/A',
      distance: 'N/A'
    })
    
    const wazeUrl = `https://www.waze.com/ul?ll=${destination.lat}%2C${destination.lng}&navigate=yes&zoom=17`
    window.open(wazeUrl, '_blank')
  }

  const handleOpenDialog = () => {
    setIsOpen(true)
    if (!userLocation && !locationError) {
      getUserLocation()
    }
  }

  const handleSaveLocation = () => {
    saveLocation(destination, [], 'Salvo via direções')
    toast.success('Local salvo com sucesso!')
  }

  const handleAddToFavorites = () => {
    addToFavorites(destination, 'other')
    toast.success('Adicionado aos favoritos!')
  }

  const routes = getRouteEstimates()

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button 
          variant="outline" 
          className="gap-2"
          onClick={handleOpenDialog}
        >
          <NavigationArrow className="w-4 h-4" />
          Rotas
        </Button>
      </DialogTrigger>

      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <NavigationArrow className="w-5 h-5" />
            Como chegar
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                Destino
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="font-medium">{destination.name}</p>
              <p className="text-sm text-muted-foreground">{destination.address}</p>
            </CardContent>
          </Card>

          {isGettingLocation && (
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-2 text-sm">
                  <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                  Obtendo sua localização...
                </div>
              </CardContent>
            </Card>
          )}

          {locationError && (
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                {locationError}
                <Button 
                  variant="link" 
                  className="p-0 h-auto ml-2 text-sm"
                  onClick={getUserLocation}
                >
                  Tentar novamente
                </Button>
              </AlertDescription>
            </Alert>
          )}

          {userLocation && routes.length > 0 && (
            <div className="space-y-3">
              <h4 className="font-medium text-sm">Estimativas de tempo:</h4>
              
              {routes.map((route, index) => (
                <Card key={index} className="cursor-pointer hover:bg-muted/50" onClick={() => openInMaps(route.mode)}>
                  <CardContent className="pt-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        {route.mode === 'driving' ? (
                          <Car className="w-5 h-5 text-blue-600" />
                        ) : (
                          <Walking className="w-5 h-5 text-green-600" />
                        )}
                        <div>
                          <div className="flex items-center gap-2">
                            <Badge variant={route.mode === 'driving' ? 'default' : 'secondary'}>
                              {route.mode === 'driving' ? 'Carro' : 'Caminhada'}
                            </Badge>
                            <div className="flex items-center gap-1 text-sm text-muted-foreground">
                              <Clock className="w-3 h-3" />
                              {route.duration}
                            </div>
                          </div>
                          <p className="text-sm text-muted-foreground mt-1">{route.distance}</p>
                        </div>
                      </div>
                      <NavigationArrow className="w-4 h-4 text-muted-foreground" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {userLocation && (
            <div className="space-y-4">
              <div className="space-y-2 pt-4 border-t">
                <h4 className="font-medium text-sm">Abrir em:</h4>
                <div className="grid grid-cols-2 gap-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => openInMaps('driving')}
                    className="gap-2"
                  >
                    <div className="w-4 h-4 bg-red-500 rounded-sm flex items-center justify-center">
                      <span className="text-white text-xs font-bold">M</span>
                    </div>
                    Google Maps
                  </Button>
                  
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={openInWaze}
                    className="gap-2"
                  >
                    <div className="w-4 h-4 bg-blue-500 rounded-sm flex items-center justify-center">
                      <span className="text-white text-xs font-bold">W</span>
                    </div>
                    Waze
                  </Button>
                </div>
              </div>

              <div className="space-y-2 pt-4 border-t">
                <h4 className="font-medium text-sm">Salvar local:</h4>
                <div className="grid grid-cols-2 gap-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={handleSaveLocation}
                    className="gap-2"
                  >
                    <Star className="w-4 h-4" />
                    Salvar
                  </Button>
                  
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={handleAddToFavorites}
                    className="gap-2"
                  >
                    <Heart className="w-4 h-4" />
                    Favoritar
                  </Button>
                </div>
              </div>
            </div>
          )}

          {!userLocation && !isGettingLocation && !locationError && (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center space-y-3">
                  <MapPin className="w-8 h-8 text-muted-foreground mx-auto" />
                  <div>
                    <p className="font-medium">Permitir localização</p>
                    <p className="text-sm text-muted-foreground">
                      Para calcular rotas, precisamos acessar sua localização
                    </p>
                  </div>
                  <Button onClick={getUserLocation} className="gap-2">
                    <NavigationArrow className="w-4 h-4" />
                    Obter localização
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}