import { useState, useEffect, useRef } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { MapPin, Search, Navigation } from '@phosphor-icons/react'
import { toast } from 'sonner'

interface MapLocationPickerProps {
  onLocationSelect: (location: {
    lat: number
    lng: number
    address?: string
    formatted_address?: string
  }) => void
  initialLocation?: {
    lat: number
    lng: number
  }
  initialAddress?: string
  className?: string
  height?: string
}

// Guaíra, SP coordinates as default
const GUAIRA_CENTER = { lat: -20.3186, lng: -48.3103 }

export function MapLocationPicker({
  onLocationSelect,
  initialLocation = GUAIRA_CENTER,
  initialAddress = '',
  className = '',
  height = '400px'
}: MapLocationPickerProps) {
  const mapRef = useRef<HTMLDivElement>(null)
  const [map, setMap] = useState<any>(null)
  const [marker, setMarker] = useState<any>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [currentLocation, setCurrentLocation] = useState(initialLocation)
  const [currentAddress, setCurrentAddress] = useState(initialAddress)
  const [isLoading, setIsLoading] = useState(false)

  // Initialize Google Maps
  useEffect(() => {
    const initMap = () => {
      if (!mapRef.current || !(window as any).google) return

      const mapInstance = new (window as any).google.maps.Map(mapRef.current, {
        center: initialLocation,
        zoom: 15,
        mapTypeControl: false,
        streetViewControl: false,
        fullscreenControl: false,
        zoomControl: true,
        styles: [
          {
            featureType: 'poi',
            elementType: 'labels',
            stylers: [{ visibility: 'off' }]
          }
        ]
      })

      setMap(mapInstance)

      // Create initial marker
      const initialMarker = new (window as any).google.maps.Marker({
        position: initialLocation,
        map: mapInstance,
        draggable: true,
        title: 'Localização selecionada'
      })

      setMarker(initialMarker)

      // Handle marker drag
      initialMarker.addListener('dragend', () => {
        const position = initialMarker.getPosition()
        if (position) {
          const lat = position.lat()
          const lng = position.lng()
          setCurrentLocation({ lat, lng })
          reverseGeocode({ lat, lng })
          onLocationSelect({ lat, lng })
        }
      })

      // Handle map click
      mapInstance.addListener('click', (e: any) => {
        if (e.latLng) {
          const lat = e.latLng.lat()
          const lng = e.latLng.lng()
          
          initialMarker.setPosition({ lat, lng })
          setCurrentLocation({ lat, lng })
          reverseGeocode({ lat, lng })
          onLocationSelect({ lat, lng })
        }
      })
    }

    // Load Google Maps script if not already loaded
    if (!(window as any).google) {
      const script = document.createElement('script')
      script.src = `https://maps.googleapis.com/maps/api/js?key=YOUR_GOOGLE_MAPS_API_KEY&libraries=places`
      script.async = true
      script.defer = true
      script.onload = initMap
      
      // For demo purposes, we'll create a mock implementation
      // In production, you would use a real Google Maps API key
      createMockMap()
      
      document.head.appendChild(script)
    } else {
      initMap()
    }
  }, [])

  // Mock map implementation for demo
  const createMockMap = () => {
    if (!mapRef.current) return

    const mockMapElement = document.createElement('div')
    mockMapElement.className = 'w-full h-full bg-green-100 rounded-lg flex items-center justify-center relative cursor-crosshair'
    mockMapElement.innerHTML = `
      <div class="text-center">
        <div class="w-12 h-12 bg-primary rounded-full flex items-center justify-center mx-auto mb-2">
          <svg class="w-6 h-6 text-primary-foreground" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clip-rule="evenodd"/>
          </svg>
        </div>
        <p class="text-sm font-medium mb-1">Mapa Interativo - Guaíra, SP</p>
        <p class="text-xs text-muted-foreground">Clique para selecionar localização</p>
      </div>
    `

    // Add click handler for mock map
    mockMapElement.addEventListener('click', (e) => {
      const rect = mockMapElement.getBoundingClientRect()
      const x = e.clientX - rect.left
      const y = e.clientY - rect.top
      
      // Convert click position to approximate coordinates
      const lat = GUAIRA_CENTER.lat + (y - rect.height / 2) * 0.001
      const lng = GUAIRA_CENTER.lng + (x - rect.width / 2) * 0.001
      
      setCurrentLocation({ lat, lng })
      onLocationSelect({ lat, lng, address: `Localização selecionada em Guaíra, SP` })
      
      toast.success('Localização selecionada no mapa')
      
      // Update marker position visually
      updateMockMarker(mockMapElement, x, y)
    })

    mapRef.current.appendChild(mockMapElement)
  }

  const updateMockMarker = (mapElement: HTMLElement, x: number, y: number) => {
    // Remove existing marker
    const existingMarker = mapElement.querySelector('.mock-marker')
    if (existingMarker) {
      existingMarker.remove()
    }

    // Add new marker
    const marker = document.createElement('div')
    marker.className = 'mock-marker absolute w-6 h-6 text-red-500 pointer-events-none'
    marker.style.left = `${x - 12}px`
    marker.style.top = `${y - 24}px`
    marker.innerHTML = `
      <svg fill="currentColor" viewBox="0 0 20 20" class="w-6 h-6">
        <path fill-rule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clip-rule="evenodd"/>
      </svg>
    `
    
    mapElement.appendChild(marker)
  }

  const reverseGeocode = async (location: { lat: number; lng: number }) => {
    try {
      setIsLoading(true)
      
      // Mock reverse geocoding for demo
      const mockAddress = `Rua da Localização, ${Math.floor(Math.random() * 1000)}, Guaíra - SP`
      setCurrentAddress(mockAddress)
      
      onLocationSelect({
        ...location,
        address: mockAddress,
        formatted_address: mockAddress
      })
    } catch (error) {
      console.error('Error in reverse geocoding:', error)
      toast.error('Erro ao obter endereço da localização')
    } finally {
      setIsLoading(false)
    }
  }

  const searchLocation = async () => {
    if (!searchQuery.trim()) return

    try {
      setIsLoading(true)
      
      // Mock search for demo - in production would use Google Places API
      const mockResults = [
        { lat: -20.3186, lng: -48.3103, address: 'Centro, Guaíra - SP' },
        { lat: -20.3200, lng: -48.3120, address: 'Jardim Europa, Guaíra - SP' },
        { lat: -20.3150, lng: -48.3080, address: 'Jardim América, Guaíra - SP' }
      ]
      
      const randomResult = mockResults[Math.floor(Math.random() * mockResults.length)]
      
      setCurrentLocation(randomResult)
      setCurrentAddress(randomResult.address)
      onLocationSelect(randomResult)
      
      // Update map center (in mock implementation)
      if (mapRef.current) {
        const mapElement = mapRef.current.firstChild as HTMLElement
        if (mapElement) {
          // Center the mock marker
          updateMockMarker(mapElement, mapElement.offsetWidth / 2, mapElement.offsetHeight / 2)
        }
      }
      
      toast.success('Localização encontrada!')
    } catch (error) {
      console.error('Error searching location:', error)
      toast.error('Erro ao buscar localização')
    } finally {
      setIsLoading(false)
    }
  }

  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      toast.error('Geolocalização não suportada pelo navegador')
      return
    }

    setIsLoading(true)
    
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude
        const lng = position.coords.longitude
        
        setCurrentLocation({ lat, lng })
        reverseGeocode({ lat, lng })
        
        // Update map center and marker
        if (map && marker) {
          const newPos = { lat, lng }
          map.setCenter(newPos)
          marker.setPosition(newPos)
        }
        
        toast.success('Localização atual obtida!')
        setIsLoading(false)
      },
      (error) => {
        console.error('Error getting current location:', error)
        toast.error('Erro ao obter localização atual')
        setIsLoading(false)
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000
      }
    )
  }

  return (
    <Card className={className}>
      <CardContent className="p-4 space-y-4">
        {/* Search Bar */}
        <div className="flex gap-2">
          <div className="flex-1">
            <Label htmlFor="location-search" className="sr-only">
              Buscar localização
            </Label>
            <Input
              id="location-search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar endereço em Guaíra..."
              onKeyPress={(e) => e.key === 'Enter' && searchLocation()}
            />
          </div>
          <Button 
            type="button"
            variant="outline" 
            onClick={searchLocation}
            disabled={isLoading}
          >
            <Search className="w-4 h-4" />
          </Button>
          <Button 
            type="button"
            variant="outline" 
            onClick={getCurrentLocation}
            disabled={isLoading}
            title="Usar minha localização atual"
          >
            <Navigation className="w-4 h-4" />
          </Button>
        </div>

        {/* Map Container */}
        <div 
          ref={mapRef}
          style={{ height }}
          className="w-full rounded-lg border bg-muted"
        />

        {/* Selected Location Info */}
        {currentAddress && (
          <div className="flex items-start gap-2 p-3 bg-muted/50 rounded-lg">
            <MapPin className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium">Localização selecionada:</p>
              <p className="text-sm text-muted-foreground break-words">{currentAddress}</p>
              <p className="text-xs text-muted-foreground mt-1">
                Coordenadas: {currentLocation.lat.toFixed(6)}, {currentLocation.lng.toFixed(6)}
              </p>
            </div>
          </div>
        )}

        {/* Instructions */}
        <div className="text-xs text-muted-foreground space-y-1">
          <p>• Clique no mapa para selecionar uma localização</p>
          <p>• Use a busca para encontrar endereços específicos</p>
          <p>• Arraste o marcador para ajustar a posição</p>
        </div>
      </CardContent>
    </Card>
  )
}