import { useEffect, useRef } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { MapPin } from '@phosphor-icons/react'
import { DirectionsButton } from '@/components/DirectionsButton'

interface MapDisplayProps {
  location: {
    lat: number
    lng: number
  }
  title?: string
  address?: string
  className?: string
  height?: string
  showDirections?: boolean
}

export function MapDisplay({
  location,
  title = 'Localização',
  address,
  className = '',
  height = '200px',
  showDirections = false
}: MapDisplayProps) {
  const mapRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const createMockMap = () => {
      if (!mapRef.current) return

      const mockMapElement = document.createElement('div')
      mockMapElement.className = 'w-full h-full bg-green-50 rounded-lg flex items-center justify-center relative overflow-hidden'
      
      // Create a simple grid pattern to simulate map tiles
      const gridOverlay = document.createElement('div')
      gridOverlay.className = 'absolute inset-0 opacity-20'
      gridOverlay.style.backgroundImage = `
        linear-gradient(to right, #00000010 1px, transparent 1px),
        linear-gradient(to bottom, #00000010 1px, transparent 1px)
      `
      gridOverlay.style.backgroundSize = '20px 20px'
      
      mockMapElement.appendChild(gridOverlay)

      // Add some mock "roads"
      const road1 = document.createElement('div')
      road1.className = 'absolute bg-gray-300 h-1'
      road1.style.width = '60%'
      road1.style.top = '40%'
      road1.style.left = '20%'
      road1.style.transform = 'rotate(-10deg)'
      
      const road2 = document.createElement('div')
      road2.className = 'absolute bg-gray-300 w-1'
      road2.style.height = '70%'
      road2.style.top = '15%'
      road2.style.left = '60%'
      road2.style.transform = 'rotate(5deg)'
      
      mockMapElement.appendChild(road1)
      mockMapElement.appendChild(road2)

      // Center marker
      const marker = document.createElement('div')
      marker.className = 'absolute w-6 h-6 text-red-500 z-10'
      marker.style.left = '50%'
      marker.style.top = '50%'
      marker.style.transform = 'translate(-50%, -100%)'
      marker.innerHTML = `
        <svg fill="currentColor" viewBox="0 0 20 20" class="w-6 h-6 drop-shadow-lg">
          <path fill-rule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clip-rule="evenodd"/>
        </svg>
      `
      
      mockMapElement.appendChild(marker)

      // Add some mock buildings/landmarks
      const building1 = document.createElement('div')
      building1.className = 'absolute w-3 h-3 bg-gray-400 rounded-sm'
      building1.style.left = '30%'
      building1.style.top = '35%'
      
      const building2 = document.createElement('div')
      building2.className = 'absolute w-2 h-2 bg-gray-400 rounded-sm'
      building2.style.left = '70%'
      building2.style.top = '25%'
      
      const building3 = document.createElement('div')
      building3.className = 'absolute w-4 h-2 bg-gray-400 rounded-sm'
      building3.style.left = '25%'
      building3.style.top = '60%'
      
      mockMapElement.appendChild(building1)
      mockMapElement.appendChild(building2)
      mockMapElement.appendChild(building3)

      // Add a title overlay
      const titleOverlay = document.createElement('div')
      titleOverlay.className = 'absolute top-2 left-2 bg-white/90 backdrop-blur-sm px-2 py-1 rounded text-xs font-medium text-gray-700 shadow-sm'
      titleOverlay.textContent = title
      
      mockMapElement.appendChild(titleOverlay)

      mapRef.current.appendChild(mockMapElement)
    }

    createMockMap()

    // Cleanup
    return () => {
      if (mapRef.current) {
        mapRef.current.innerHTML = ''
      }
    }
  }, [location, title])

  return (
    <Card className={className}>
      <CardContent className="p-0">
        <div 
          ref={mapRef}
          style={{ height }}
          className="w-full rounded-lg overflow-hidden"
        />
        {address && (
          <div className="p-3 border-t">
            <div className="flex items-start gap-2">
              <MapPin className="w-4 h-4 text-muted-foreground mt-0.5 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm text-muted-foreground break-words">{address}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {location.lat.toFixed(6)}, {location.lng.toFixed(6)}
                </p>
              </div>
            </div>
            {showDirections && (
              <div className="mt-3">
                <DirectionsButton
                  destination={{
                    lat: location.lat,
                    lng: location.lng,
                    name: title,
                    address: address
                  }}
                />
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}