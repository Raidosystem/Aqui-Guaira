import { useKV } from '@github/spark/hooks'

export interface FavoriteBusiness {
  id: string
  name: string
  address: string
  neighborhood: string
  phone: string
  whatsapp?: string
  categories: string[]
  coordinates?: { lat: number; lng: number }
  addedAt: string
}

export function useBusinessFavorites() {
  const [favorites, setFavorites] = useKV<FavoriteBusiness[]>('business-favorites', [])

  const addToFavorites = (business: {
    id: string
    name: string
    address: string
    neighborhood: string
    phone: string
    whatsapp?: string
    categories: string[]
    coordinates?: { lat: number; lng: number }
  }) => {
    setFavorites(current => {
      // Avoid duplicates
      if (current.some(fav => fav.id === business.id)) {
        return current
      }
      
      const newFavorite: FavoriteBusiness = {
        ...business,
        addedAt: new Date().toISOString()
      }
      
      return [newFavorite, ...current]
    })
  }

  const removeFromFavorites = (businessId: string) => {
    setFavorites(current => current.filter(fav => fav.id !== businessId))
  }

  const isFavorite = (businessId: string) => {
    return favorites.some(fav => fav.id === businessId)
  }

  const getFavoritesByCategory = () => {
    return favorites.reduce((acc, business) => {
      business.categories.forEach(categoryId => {
        if (!acc[categoryId]) {
          acc[categoryId] = []
        }
        acc[categoryId].push(business)
      })
      return acc
    }, {} as Record<string, FavoriteBusiness[]>)
  }

  return {
    favorites,
    addToFavorites,
    removeFromFavorites,
    isFavorite,
    getFavoritesByCategory
  }
}