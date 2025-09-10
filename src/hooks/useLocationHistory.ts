import { useKV } from '@github/spark/hooks'
import { useCallback } from 'react'
import { 
  SavedLocation, 
  RecentDestination, 
  FavoriteLocation, 
  Location,
  LocationHistory,
  RoutePreferences 
} from '@/types/location'

export function useLocationHistory() {
  const [recentDestinations, setRecentDestinations] = useKV<RecentDestination[]>('recent-destinations', [])
  const [favoriteLocations, setFavoriteLocations] = useKV<FavoriteLocation[]>('favorite-locations', [])
  const [savedLocations, setSavedLocations] = useKV<SavedLocation[]>('saved-locations', [])
  const [routePreferences, setRoutePreferences] = useKV<RoutePreferences>('route-preferences', {
    defaultMode: 'driving',
    avoidTolls: false,
    avoidHighways: false,
    preferFastestRoute: true
  })

  const addToRecent = useCallback((location: Location, routeInfo?: { mode: 'driving' | 'walking', time: string, distance: string }) => {
    setRecentDestinations((current) => {
      const now = new Date().toISOString()
      const existing = current.find(item => 
        Math.abs(item.lat - location.lat) < 0.0001 && 
        Math.abs(item.lng - location.lng) < 0.0001
      )

      if (existing) {
        // Update existing entry
        return current.map(item => 
          item.id === existing.id 
            ? {
                ...item,
                visitedAt: now,
                visitCount: item.visitCount + 1,
                routeMode: routeInfo?.mode || item.routeMode,
                travelTime: routeInfo?.time || item.travelTime,
                distance: routeInfo?.distance || item.distance,
                name: location.name, // Update name in case it changed
                address: location.address // Update address in case it changed
              }
            : item
        )
      } else {
        // Add new entry
        const newEntry: RecentDestination = {
          ...location,
          id: `recent_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          visitedAt: now,
          visitCount: 1,
          routeMode: routeInfo?.mode,
          travelTime: routeInfo?.time,
          distance: routeInfo?.distance
        }

        // Keep only last 20 recent destinations
        const updated = [newEntry, ...current].slice(0, 20)
        return updated
      }
    })
  }, [setRecentDestinations])

  const addToFavorites = useCallback((location: Location | SavedLocation, category: FavoriteLocation['category'] = 'other') => {
    setFavoriteLocations((current) => {
      const now = new Date().toISOString()
      const existing = current.find(item => 
        Math.abs(item.lat - location.lat) < 0.0001 && 
        Math.abs(item.lng - location.lng) < 0.0001
      )

      if (existing) {
        return current // Already in favorites
      }

      const newFavorite: FavoriteLocation = {
        ...location,
        id: `favorite_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        savedAt: 'savedAt' in location ? location.savedAt : now,
        lastUsed: now,
        usageCount: 'usageCount' in location ? location.usageCount : 0,
        isFavorite: true,
        category,
        tags: 'tags' in location ? location.tags : [],
        notes: 'notes' in location ? location.notes : ''
      }

      return [newFavorite, ...current]
    })
  }, [setFavoriteLocations])

  const removeFromFavorites = useCallback((locationId: string) => {
    setFavoriteLocations((current) => current.filter(item => item.id !== locationId))
  }, [setFavoriteLocations])

  const saveLocation = useCallback((location: Location, tags?: string[], notes?: string) => {
    setSavedLocations((current) => {
      const now = new Date().toISOString()
      const existing = current.find(item => 
        Math.abs(item.lat - location.lat) < 0.0001 && 
        Math.abs(item.lng - location.lng) < 0.0001
      )

      if (existing) {
        // Update existing saved location
        return current.map(item => 
          item.id === existing.id 
            ? {
                ...item,
                lastUsed: now,
                usageCount: item.usageCount + 1,
                tags: tags || item.tags,
                notes: notes || item.notes,
                name: location.name, // Update name
                address: location.address // Update address
              }
            : item
        )
      }

      const newSaved: SavedLocation = {
        ...location,
        id: `saved_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        savedAt: now,
        lastUsed: now,
        usageCount: 1,
        tags: tags || [],
        notes: notes || ''
      }

      return [newSaved, ...current]
    })
  }, [setSavedLocations])

  const removeSavedLocation = useCallback((locationId: string) => {
    setSavedLocations((current) => current.filter(item => item.id !== locationId))
  }, [setSavedLocations])

  const updateLocationNotes = useCallback((locationId: string, notes: string) => {
    setSavedLocations((current) => 
      current.map(item => 
        item.id === locationId ? { ...item, notes } : item
      )
    )
    setFavoriteLocations((current) => 
      current.map(item => 
        item.id === locationId ? { ...item, notes } : item
      )
    )
  }, [setSavedLocations, setFavoriteLocations])

  const updateLocationTags = useCallback((locationId: string, tags: string[]) => {
    setSavedLocations((current) => 
      current.map(item => 
        item.id === locationId ? { ...item, tags } : item
      )
    )
    setFavoriteLocations((current) => 
      current.map(item => 
        item.id === locationId ? { ...item, tags } : item
      )
    )
  }, [setSavedLocations, setFavoriteLocations])

  const clearRecentDestinations = useCallback(() => {
    setRecentDestinations([])
  }, [setRecentDestinations])

  const getLocationHistory = useCallback((): LocationHistory => ({
    recent: recentDestinations,
    favorites: favoriteLocations,
    saved: savedLocations
  }), [recentDestinations, favoriteLocations, savedLocations])

  const searchSavedLocations = useCallback((query: string) => {
    const lowercaseQuery = query.toLowerCase()
    const allLocations = [...favoriteLocations, ...savedLocations]
    
    return allLocations.filter(location => 
      location.name.toLowerCase().includes(lowercaseQuery) ||
      location.address.toLowerCase().includes(lowercaseQuery) ||
      location.tags?.some(tag => tag.toLowerCase().includes(lowercaseQuery)) ||
      location.notes?.toLowerCase().includes(lowercaseQuery)
    )
  }, [favoriteLocations, savedLocations])

  return {
    // Data
    recentDestinations,
    favoriteLocations,
    savedLocations,
    routePreferences,
    
    // Actions
    addToRecent,
    addToFavorites,
    removeFromFavorites,
    saveLocation,
    removeSavedLocation,
    updateLocationNotes,
    updateLocationTags,
    clearRecentDestinations,
    setRoutePreferences,
    
    // Utilities
    getLocationHistory,
    searchSavedLocations
  }
}