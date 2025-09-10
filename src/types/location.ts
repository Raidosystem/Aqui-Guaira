export interface Location {
  lat: number
  lng: number
  name: string
  address: string
  category?: string
  id?: string
}

export interface SavedLocation extends Location {
  id: string
  savedAt: string
  lastUsed?: string
  usageCount: number
  tags?: string[]
  notes?: string
}

export interface RecentDestination extends Location {
  id: string
  visitedAt: string
  visitCount: number
  routeMode?: 'driving' | 'walking'
  travelTime?: string
  distance?: string
}

export interface FavoriteLocation extends SavedLocation {
  isFavorite: true
  category: 'home' | 'work' | 'frequent' | 'other'
  customIcon?: string
  color?: string
}

export interface LocationHistory {
  recent: RecentDestination[]
  favorites: FavoriteLocation[]
  saved: SavedLocation[]
}

export interface RoutePreferences {
  defaultMode: 'driving' | 'walking'
  avoidTolls: boolean
  avoidHighways: boolean
  preferFastestRoute: boolean
}