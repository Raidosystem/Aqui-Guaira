import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  MapPin, 
  Heart, 
  Star, 
  Clock, 
  Search, 
  Plus, 
  Trash, 
  Edit, 
  House,
  Briefcase,
  Navigation,
  Tag,
  Car,
  Walking,
  X
} from '@phosphor-icons/react'
import { useLocationHistory } from '@/hooks/useLocationHistory'
import { DirectionsButton } from '@/components/DirectionsButton'
import { Location, FavoriteLocation, SavedLocation, RecentDestination } from '@/types/location'
import { toast } from 'sonner'

interface LocationManagerProps {
  onLocationSelect?: (location: Location) => void
  showDirections?: boolean
  className?: string
}

export function LocationManager({ onLocationSelect, showDirections = true, className }: LocationManagerProps) {
  const {
    recentDestinations,
    favoriteLocations,
    savedLocations,
    addToFavorites,
    removeFromFavorites,
    saveLocation,
    removeSavedLocation,
    updateLocationNotes,
    updateLocationTags,
    clearRecentDestinations,
    searchSavedLocations
  } = useLocationHistory()

  const [searchQuery, setSearchQuery] = useState('')
  const [selectedLocation, setSelectedLocation] = useState<SavedLocation | FavoriteLocation | null>(null)
  const [editingNotes, setEditingNotes] = useState('')
  const [editingTags, setEditingTags] = useState<string[]>([])
  const [newTag, setNewTag] = useState('')
  const [favoriteCategory, setFavoriteCategory] = useState<FavoriteLocation['category']>('other')

  const searchResults = searchQuery ? searchSavedLocations(searchQuery) : []

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

  const handleLocationClick = (location: Location) => {
    if (onLocationSelect) {
      onLocationSelect(location)
    }
  }

  const handleEditLocation = (location: SavedLocation | FavoriteLocation) => {
    setSelectedLocation(location)
    setEditingNotes(location.notes || '')
    setEditingTags(location.tags || [])
  }

  const handleSaveEdit = () => {
    if (!selectedLocation) return

    updateLocationNotes(selectedLocation.id, editingNotes)
    updateLocationTags(selectedLocation.id, editingTags)
    setSelectedLocation(null)
    toast.success('Local atualizado com sucesso!')
  }

  const handleAddTag = () => {
    if (newTag.trim() && !editingTags.includes(newTag.trim())) {
      setEditingTags([...editingTags, newTag.trim()])
      setNewTag('')
    }
  }

  const handleRemoveTag = (tagToRemove: string) => {
    setEditingTags(editingTags.filter(tag => tag !== tagToRemove))
  }

  const handleAddToFavorites = (location: SavedLocation | RecentDestination) => {
    addToFavorites(location, favoriteCategory)
    toast.success('Adicionado aos favoritos!')
  }

  const handleRemoveFromFavorites = (locationId: string) => {
    removeFromFavorites(locationId)
    toast.success('Removido dos favoritos!')
  }

  const handleDeleteSaved = (locationId: string) => {
    removeSavedLocation(locationId)
    toast.success('Local removido!')
  }

  return (
    <div className={className}>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="w-5 h-5" />
            Locais Salvos
          </CardTitle>
          <CardDescription>
            Gerencie seus favoritos, locais salvos e destinos recentes
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Search */}
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Buscar locais salvos..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>

          {/* Search Results */}
          {searchQuery && (
            <div className="space-y-2">
              <h4 className="font-medium text-sm">Resultados da busca:</h4>
              {searchResults.length > 0 ? (
                <div className="space-y-2">
                  {searchResults.map((location) => (
                    <LocationCard
                      key={location.id}
                      location={location}
                      onLocationClick={handleLocationClick}
                      onEdit={handleEditLocation}
                      onDelete={handleDeleteSaved}
                      onToggleFavorite={
                        'isFavorite' in location && location.isFavorite
                          ? () => handleRemoveFromFavorites(location.id)
                          : () => handleAddToFavorites(location)
                      }
                      isFavorite={'isFavorite' in location && location.isFavorite}
                      showDirections={showDirections}
                    />
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">Nenhum local encontrado</p>
              )}
              <Separator />
            </div>
          )}

          <Tabs defaultValue="favorites" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="favorites" className="gap-2">
                <Heart className="w-4 h-4" />
                Favoritos
              </TabsTrigger>
              <TabsTrigger value="recent" className="gap-2">
                <Clock className="w-4 h-4" />
                Recentes
              </TabsTrigger>
              <TabsTrigger value="saved" className="gap-2">
                <Star className="w-4 h-4" />
                Salvos
              </TabsTrigger>
            </TabsList>

            <TabsContent value="favorites" className="space-y-4">
              {favoriteLocations.length > 0 ? (
                <div className="space-y-2">
                  {favoriteLocations.map((location) => (
                    <Card key={location.id} className="border-l-4 border-l-red-500">
                      <CardContent className="pt-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <div className={getCategoryColor(location.category)}>
                                {getCategoryIcon(location.category)}
                              </div>
                              <h4 className="font-medium truncate">{location.name}</h4>
                              <Badge variant="outline" className="text-xs">
                                {getCategoryLabel(location.category)}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground truncate mb-2">
                              {location.address}
                            </p>
                            {location.tags && location.tags.length > 0 && (
                              <div className="flex gap-1 mb-2">
                                {location.tags.map((tag) => (
                                  <Badge key={tag} variant="secondary" className="text-xs">
                                    {tag}
                                  </Badge>
                                ))}
                              </div>
                            )}
                            {location.notes && (
                              <p className="text-xs text-muted-foreground mb-2">
                                {location.notes}
                              </p>
                            )}
                            <p className="text-xs text-muted-foreground">
                              Usado {location.usageCount} vezes
                            </p>
                          </div>
                          <div className="flex gap-1 ml-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleLocationClick(location)}
                            >
                              <MapPin className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEditLocation(location)}
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleRemoveFromFavorites(location.id)}
                            >
                              <Heart className="w-4 h-4 text-red-500 fill-red-500" />
                            </Button>
                          </div>
                        </div>
                        {showDirections && (
                          <div className="mt-3 pt-3 border-t">
                            <DirectionsButton
                              destination={{
                                lat: location.lat,
                                lng: location.lng,
                                name: location.name,
                                address: location.address
                              }}
                            />
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-center space-y-2">
                      <Heart className="w-8 h-8 text-muted-foreground mx-auto" />
                      <p className="text-sm text-muted-foreground">
                        Nenhum local favorito ainda
                      </p>
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="recent" className="space-y-4">
              {recentDestinations.length > 0 ? (
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <h4 className="font-medium text-sm">Destinos recentes</h4>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={clearRecentDestinations}
                    >
                      Limpar histórico
                    </Button>
                  </div>
                  {recentDestinations.map((destination) => (
                    <Card key={destination.id}>
                      <CardContent className="pt-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <Clock className="w-4 h-4 text-muted-foreground" />
                              <h4 className="font-medium truncate">{destination.name}</h4>
                              {destination.routeMode && (
                                <Badge variant="outline" className="text-xs">
                                  {destination.routeMode === 'driving' ? (
                                    <Car className="w-3 h-3 mr-1" />
                                  ) : (
                                    <Walking className="w-3 h-3 mr-1" />
                                  )}
                                  {destination.routeMode === 'driving' ? 'Carro' : 'Caminhada'}
                                </Badge>
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground truncate mb-2">
                              {destination.address}
                            </p>
                            <div className="flex gap-4 text-xs text-muted-foreground">
                              <span>Visitado {destination.visitCount}x</span>
                              {destination.travelTime && (
                                <span>Tempo: {destination.travelTime}</span>
                              )}
                              {destination.distance && (
                                <span>Distância: {destination.distance}</span>
                              )}
                            </div>
                          </div>
                          <div className="flex gap-1 ml-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleLocationClick(destination)}
                            >
                              <MapPin className="w-4 h-4" />
                            </Button>
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button variant="ghost" size="sm">
                                  <Heart className="w-4 h-4" />
                                </Button>
                              </DialogTrigger>
                              <DialogContent className="max-w-md">
                                <DialogHeader>
                                  <DialogTitle>Adicionar aos favoritos</DialogTitle>
                                </DialogHeader>
                                <div className="space-y-4">
                                  <div>
                                    <Label htmlFor="category">Categoria</Label>
                                    <Select value={favoriteCategory} onValueChange={(value) => setFavoriteCategory(value as FavoriteLocation['category'])}>
                                      <SelectTrigger>
                                        <SelectValue />
                                      </SelectTrigger>
                                      <SelectContent>
                                        <SelectItem value="home">Casa</SelectItem>
                                        <SelectItem value="work">Trabalho</SelectItem>
                                        <SelectItem value="frequent">Frequente</SelectItem>
                                        <SelectItem value="other">Outro</SelectItem>
                                      </SelectContent>
                                    </Select>
                                  </div>
                                  <Button
                                    onClick={() => handleAddToFavorites(destination)}
                                    className="w-full"
                                  >
                                    Adicionar aos favoritos
                                  </Button>
                                </div>
                              </DialogContent>
                            </Dialog>
                          </div>
                        </div>
                        {showDirections && (
                          <div className="mt-3 pt-3 border-t">
                            <DirectionsButton
                              destination={{
                                lat: destination.lat,
                                lng: destination.lng,
                                name: destination.name,
                                address: destination.address
                              }}
                            />
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-center space-y-2">
                      <Clock className="w-8 h-8 text-muted-foreground mx-auto" />
                      <p className="text-sm text-muted-foreground">
                        Nenhum destino recente
                      </p>
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="saved" className="space-y-4">
              {savedLocations.length > 0 ? (
                <div className="space-y-2">
                  {savedLocations.map((location) => (
                    <LocationCard
                      key={location.id}
                      location={location}
                      onLocationClick={handleLocationClick}
                      onEdit={handleEditLocation}
                      onDelete={handleDeleteSaved}
                      onToggleFavorite={() => handleAddToFavorites(location)}
                      isFavorite={false}
                      showDirections={showDirections}
                    />
                  ))}
                </div>
              ) : (
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-center space-y-2">
                      <Star className="w-8 h-8 text-muted-foreground mx-auto" />
                      <p className="text-sm text-muted-foreground">
                        Nenhum local salvo ainda
                      </p>
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Edit Location Dialog */}
      <Dialog open={!!selectedLocation} onOpenChange={() => setSelectedLocation(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Editar Local</DialogTitle>
          </DialogHeader>
          
          {selectedLocation && (
            <div className="space-y-4">
              <div>
                <h4 className="font-medium">{selectedLocation.name}</h4>
                <p className="text-sm text-muted-foreground">{selectedLocation.address}</p>
              </div>

              <div>
                <Label htmlFor="notes">Notas</Label>
                <Textarea
                  id="notes"
                  value={editingNotes}
                  onChange={(e) => setEditingNotes(e.target.value)}
                  placeholder="Adicione suas notas sobre este local..."
                  className="mt-1"
                />
              </div>

              <div>
                <Label>Tags</Label>
                <div className="mt-1 space-y-2">
                  <div className="flex gap-1 flex-wrap">
                    {editingTags.map((tag) => (
                      <Badge key={tag} variant="secondary" className="gap-1">
                        {tag}
                        <button onClick={() => handleRemoveTag(tag)}>
                          <X className="w-3 h-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <Input
                      value={newTag}
                      onChange={(e) => setNewTag(e.target.value)}
                      placeholder="Nova tag..."
                      onKeyPress={(e) => e.key === 'Enter' && handleAddTag()}
                      className="flex-1"
                    />
                    <Button onClick={handleAddTag} size="sm">
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>

              <div className="flex gap-2">
                <Button onClick={handleSaveEdit} className="flex-1">
                  Salvar
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => setSelectedLocation(null)}
                  className="flex-1"
                >
                  Cancelar
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

interface LocationCardProps {
  location: SavedLocation
  onLocationClick: (location: Location) => void
  onEdit: (location: SavedLocation) => void
  onDelete: (locationId: string) => void
  onToggleFavorite: () => void
  isFavorite: boolean
  showDirections: boolean
}

function LocationCard({ 
  location, 
  onLocationClick, 
  onEdit, 
  onDelete, 
  onToggleFavorite, 
  isFavorite,
  showDirections 
}: LocationCardProps) {
  return (
    <Card>
      <CardContent className="pt-4">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <MapPin className="w-4 h-4 text-muted-foreground" />
              <h4 className="font-medium truncate">{location.name}</h4>
            </div>
            <p className="text-sm text-muted-foreground truncate mb-2">
              {location.address}
            </p>
            {location.tags && location.tags.length > 0 && (
              <div className="flex gap-1 mb-2">
                {location.tags.map((tag) => (
                  <Badge key={tag} variant="secondary" className="text-xs">
                    {tag}
                  </Badge>
                ))}
              </div>
            )}
            {location.notes && (
              <p className="text-xs text-muted-foreground mb-2">
                {location.notes}
              </p>
            )}
            <p className="text-xs text-muted-foreground">
              Usado {location.usageCount} vezes
            </p>
          </div>
          <div className="flex gap-1 ml-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onLocationClick(location)}
            >
              <MapPin className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onEdit(location)}
            >
              <Edit className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={onToggleFavorite}
            >
              <Heart className={`w-4 h-4 ${isFavorite ? 'text-red-500 fill-red-500' : ''}`} />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onDelete(location.id)}
            >
              <Trash className="w-4 h-4" />
            </Button>
          </div>
        </div>
        {showDirections && (
          <div className="mt-3 pt-3 border-t">
            <DirectionsButton
              destination={{
                lat: location.lat,
                lng: location.lng,
                name: location.name,
                address: location.address
              }}
            />
          </div>
        )}
      </CardContent>
    </Card>
  )
}