import { useState, useRef, useCallback } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Slider } from '@/components/ui/slider'
import { toast } from 'sonner'
import { 
  Upload, 
  X, 
  Image as ImageIcon, 
  Camera, 
  Crop, 
  RotateCw, 
  Move, 
  ZoomIn, 
  ZoomOut,
  Download,
  Eye,
  Trash2,
  Star,
  StarFill,
  ArrowsClockwise,
  ArrowLeft,
  ArrowRight
} from '@phosphor-icons/react'

interface PhotoFile {
  id: string
  file: File
  preview: string
  uploaded?: boolean
  url?: string
  isFeatured?: boolean
  caption?: string
  tags?: string[]
  size: number
  dimensions?: { width: number; height: number }
}

interface PhotoManagerProps {
  photos: string[]
  onPhotosChange: (photos: string[]) => void
  maxPhotos?: number
  maxFileSize?: number
  allowedTypes?: string[]
  showFeatured?: boolean
  showCaptions?: boolean
  showTags?: boolean
}

export function PhotoManager({
  photos = [],
  onPhotosChange,
  maxPhotos = 10,
  maxFileSize = 10 * 1024 * 1024, // 10MB
  allowedTypes = ['image/jpeg', 'image/png', 'image/webp'],
  showFeatured = true,
  showCaptions = true,
  showTags = false
}: PhotoManagerProps) {
  const [localPhotos, setLocalPhotos] = useState<PhotoFile[]>([])
  const [uploadProgress, setUploadProgress] = useState<{ [key: string]: number }>({})
  const [selectedPhoto, setSelectedPhoto] = useState<PhotoFile | null>(null)
  const [editingPhoto, setEditingPhoto] = useState<PhotoFile | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [viewerOpen, setViewerOpen] = useState(false)
  const [currentViewIndex, setCurrentViewIndex] = useState(0)
  
  const fileInputRef = useRef<HTMLInputElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  // Photo editing state
  const [editState, setEditState] = useState({
    rotation: 0,
    zoom: 1,
    brightness: 100,
    contrast: 100,
    saturation: 100,
    x: 0,
    y: 0
  })

  const validateFile = (file: File): boolean => {
    if (!allowedTypes.includes(file.type)) {
      toast.error(`Tipo de arquivo não suportado: ${file.type}`)
      return false
    }
    
    if (file.size > maxFileSize) {
      toast.error(`Arquivo muito grande: ${(file.size / 1024 / 1024).toFixed(1)}MB (máximo: ${maxFileSize / 1024 / 1024}MB)`)
      return false
    }
    
    return true
  }

  const handleFileSelect = async (files: FileList) => {
    const validFiles = Array.from(files).filter(validateFile)
    
    if (localPhotos.length + validFiles.length > maxPhotos) {
      toast.error(`Máximo de ${maxPhotos} fotos permitidas`)
      return
    }

    const newPhotos: PhotoFile[] = await Promise.all(
      validFiles.map(async (file) => {
        const id = `photo_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
        const preview = URL.createObjectURL(file)
        
        // Get image dimensions
        const dimensions = await getImageDimensions(file)
        
        return {
          id,
          file,
          preview,
          size: file.size,
          dimensions,
          caption: '',
          tags: [],
          isFeatured: false
        }
      })
    )

    setLocalPhotos(prev => [...prev, ...newPhotos])
    
    // Simulate upload
    newPhotos.forEach(photo => {
      simulateUpload(photo)
    })
  }

  const getImageDimensions = (file: File): Promise<{ width: number; height: number }> => {
    return new Promise((resolve) => {
      const img = new Image()
      img.onload = () => {
        resolve({ width: img.width, height: img.height })
        URL.revokeObjectURL(img.src)
      }
      img.src = URL.createObjectURL(file)
    })
  }

  const simulateUpload = async (photo: PhotoFile) => {
    setUploadProgress(prev => ({ ...prev, [photo.id]: 0 }))
    
    // Simulate upload progress
    for (let i = 0; i <= 100; i += 10) {
      await new Promise(resolve => setTimeout(resolve, 100))
      setUploadProgress(prev => ({ ...prev, [photo.id]: i }))
    }
    
    // Mark as uploaded and generate URL
    setLocalPhotos(prev => prev.map(p => 
      p.id === photo.id 
        ? { ...p, uploaded: true, url: `https://images.unsplash.com/photo-${Date.now()}?w=800&h=600&fit=crop` }
        : p
    ))
    
    setUploadProgress(prev => {
      const { [photo.id]: _, ...rest } = prev
      return rest
    })
    
    toast.success('Foto enviada com sucesso!')
  }

  const removePhoto = (photoId: string) => {
    setLocalPhotos(prev => {
      const updated = prev.filter(p => p.id !== photoId)
      updateParentPhotos(updated)
      return updated
    })
    
    // Revoke object URL to prevent memory leaks
    const photo = localPhotos.find(p => p.id === photoId)
    if (photo) {
      URL.revokeObjectURL(photo.preview)
    }
  }

  const toggleFeatured = (photoId: string) => {
    setLocalPhotos(prev => {
      const updated = prev.map(p => ({
        ...p,
        isFeatured: p.id === photoId ? !p.isFeatured : (p.isFeatured && p.id === photoId ? false : p.isFeatured)
      }))
      updateParentPhotos(updated)
      return updated
    })
  }

  const updatePhotoCaption = (photoId: string, caption: string) => {
    setLocalPhotos(prev => {
      const updated = prev.map(p => p.id === photoId ? { ...p, caption } : p)
      updateParentPhotos(updated)
      return updated
    })
  }

  const updateParentPhotos = (updatedPhotos: PhotoFile[]) => {
    const uploadedUrls = updatedPhotos
      .filter(p => p.uploaded && p.url)
      .map(p => p.url!)
    onPhotosChange(uploadedUrls)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = () => {
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    
    const files = e.dataTransfer.files
    if (files.length > 0) {
      handleFileSelect(files)
    }
  }

  const reorderPhotos = (startIndex: number, endIndex: number) => {
    setLocalPhotos(prev => {
      const result = Array.from(prev)
      const [removed] = result.splice(startIndex, 1)
      result.splice(endIndex, 0, removed)
      updateParentPhotos(result)
      return result
    })
  }

  const openEditor = (photo: PhotoFile) => {
    setEditingPhoto(photo)
    setEditState({
      rotation: 0,
      zoom: 1,
      brightness: 100,
      contrast: 100,
      saturation: 100,
      x: 0,
      y: 0
    })
  }

  const applyEdit = () => {
    if (!editingPhoto || !canvasRef.current) return
    
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    
    // Apply edits and generate new image
    // This is a simplified version - in production, you'd use a more sophisticated image editing library
    const editedDataUrl = canvas.toDataURL('image/jpeg', 0.9)
    
    // Update the photo with edited version
    setLocalPhotos(prev => prev.map(p => 
      p.id === editingPhoto.id 
        ? { ...p, preview: editedDataUrl }
        : p
    ))
    
    setEditingPhoto(null)
    toast.success('Edição aplicada!')
  }

  const openViewer = (index: number) => {
    setCurrentViewIndex(index)
    setViewerOpen(true)
  }

  const navigateViewer = (direction: 'prev' | 'next') => {
    const totalPhotos = localPhotos.length
    if (direction === 'prev') {
      setCurrentViewIndex(prev => prev > 0 ? prev - 1 : totalPhotos - 1)
    } else {
      setCurrentViewIndex(prev => prev < totalPhotos - 1 ? prev + 1 : 0)
    }
  }

  return (
    <div className="space-y-6">
      {/* Upload Area */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Camera className="w-5 h-5" />
            Gerenciar Fotos
          </CardTitle>
          <CardDescription>
            Adicione até {maxPhotos} fotos para mostrar seu negócio
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div
            className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
              isDragging 
                ? 'border-primary bg-primary/5' 
                : 'border-muted-foreground/25 hover:border-muted-foreground/50'
            }`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <Upload className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-medium mb-2">Adicionar fotos</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Arraste arquivos aqui ou clique para selecionar
            </p>
            <div className="flex flex-col sm:flex-row gap-2 justify-center">
              <Button
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
                className="gap-2"
              >
                <ImageIcon className="w-4 h-4" />
                Escolher arquivos
              </Button>
              <Input
                ref={fileInputRef}
                type="file"
                accept={allowedTypes.join(',')}
                multiple
                className="hidden"
                onChange={(e) => e.target.files && handleFileSelect(e.target.files)}
              />
            </div>
            <div className="mt-4 flex flex-wrap gap-2 justify-center">
              <Badge variant="secondary" className="text-xs">
                Máximo: {maxPhotos} fotos
              </Badge>
              <Badge variant="secondary" className="text-xs">
                Até {Math.round(maxFileSize / 1024 / 1024)}MB cada
              </Badge>
              <Badge variant="secondary" className="text-xs">
                JPG, PNG, WebP
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Photo Grid */}
      {localPhotos.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Fotos Adicionadas ({localPhotos.length}/{maxPhotos})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {localPhotos.map((photo, index) => (
                <div key={photo.id} className="relative group">
                  <div className="aspect-square rounded-lg overflow-hidden bg-muted">
                    <img
                      src={photo.preview}
                      alt={`Foto ${index + 1}`}
                      className="w-full h-full object-cover cursor-pointer"
                      onClick={() => openViewer(index)}
                    />
                    
                    {/* Upload Progress Overlay */}
                    {uploadProgress[photo.id] !== undefined && (
                      <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                        <div className="text-white text-center">
                          <Progress 
                            value={uploadProgress[photo.id]} 
                            className="w-20 mb-2"
                          />
                          <p className="text-xs">{uploadProgress[photo.id]}%</p>
                        </div>
                      </div>
                    )}
                    
                    {/* Photo Info */}
                    <div className="absolute top-2 left-2 flex gap-1">
                      {photo.uploaded && (
                        <Badge variant="default" className="text-xs px-2 py-1">
                          ✓
                        </Badge>
                      )}
                      {photo.isFeatured && showFeatured && (
                        <Badge variant="secondary" className="text-xs px-2 py-1">
                          <StarFill className="w-3 h-3" />
                        </Badge>
                      )}
                    </div>
                    
                    {/* Action Buttons */}
                    <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="flex gap-1">
                        <Button
                          size="sm"
                          variant="secondary"
                          className="w-8 h-8 p-0"
                          onClick={(e) => {
                            e.stopPropagation()
                            openViewer(index)
                          }}
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="secondary"
                          className="w-8 h-8 p-0"
                          onClick={(e) => {
                            e.stopPropagation()
                            openEditor(photo)
                          }}
                        >
                          <Crop className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          className="w-8 h-8 p-0"
                          onClick={(e) => {
                            e.stopPropagation()
                            removePhoto(photo.id)
                          }}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                    
                    {/* Bottom Actions */}
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="flex justify-between items-center">
                        {showFeatured && (
                          <Button
                            size="sm"
                            variant="ghost"
                            className="p-1 h-auto text-white hover:text-yellow-400"
                            onClick={(e) => {
                              e.stopPropagation()
                              toggleFeatured(photo.id)
                            }}
                          >
                            {photo.isFeatured ? (
                              <StarFill className="w-4 h-4" />
                            ) : (
                              <Star className="w-4 h-4" />
                            )}
                          </Button>
                        )}
                        
                        <div className="text-white text-xs">
                          {(photo.size / 1024 / 1024).toFixed(1)}MB
                          {photo.dimensions && (
                            <span className="ml-1">
                              {photo.dimensions.width}x{photo.dimensions.height}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Caption Input */}
                  {showCaptions && (
                    <div className="mt-2">
                      <Input
                        placeholder="Adicione uma descrição..."
                        value={photo.caption || ''}
                        onChange={(e) => updatePhotoCaption(photo.id, e.target.value)}
                        className="text-xs"
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Photo Viewer Modal */}
      <Dialog open={viewerOpen} onOpenChange={setViewerOpen}>
        <DialogContent className="max-w-4xl w-full">
          <DialogHeader className="sr-only">
            <DialogTitle>Visualizar Foto</DialogTitle>
          </DialogHeader>
          
          {localPhotos[currentViewIndex] && (
            <div className="space-y-4">
              <div className="relative">
                <img
                  src={localPhotos[currentViewIndex].preview}
                  alt={`Foto ${currentViewIndex + 1}`}
                  className="w-full max-h-[70vh] object-contain rounded-lg"
                />
                
                {/* Navigation */}
                {localPhotos.length > 1 && (
                  <>
                    <Button
                      size="sm"
                      variant="secondary"
                      className="absolute left-2 top-1/2 -translate-y-1/2"
                      onClick={() => navigateViewer('prev')}
                    >
                      <ArrowLeft className="w-4 h-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="secondary"
                      className="absolute right-2 top-1/2 -translate-y-1/2"
                      onClick={() => navigateViewer('next')}
                    >
                      <ArrowRight className="w-4 h-4" />
                    </Button>
                  </>
                )}
              </div>
              
              <div className="flex justify-between items-center">
                <div>
                  <p className="font-medium">
                    Foto {currentViewIndex + 1} de {localPhotos.length}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {(localPhotos[currentViewIndex].size / 1024 / 1024).toFixed(1)}MB
                    {localPhotos[currentViewIndex].dimensions && (
                      <span className="ml-2">
                        {localPhotos[currentViewIndex].dimensions!.width}x{localPhotos[currentViewIndex].dimensions!.height}
                      </span>
                    )}
                  </p>
                </div>
                
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => openEditor(localPhotos[currentViewIndex])}
                  >
                    <Crop className="w-4 h-4 mr-2" />
                    Editar
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      const link = document.createElement('a')
                      link.href = localPhotos[currentViewIndex].preview
                      link.download = `foto_${currentViewIndex + 1}.jpg`
                      link.click()
                    }}
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Baixar
                  </Button>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Photo Editor Modal */}
      <Dialog open={!!editingPhoto} onOpenChange={() => setEditingPhoto(null)}>
        <DialogContent className="max-w-4xl w-full">
          <DialogHeader>
            <DialogTitle>Editar Foto</DialogTitle>
            <DialogDescription>
              Ajuste sua foto antes de adicionar à galeria
            </DialogDescription>
          </DialogHeader>
          
          {editingPhoto && (
            <Tabs defaultValue="adjust" className="space-y-4">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="adjust">Ajustes</TabsTrigger>
                <TabsTrigger value="transform">Transformar</TabsTrigger>
                <TabsTrigger value="crop">Recortar</TabsTrigger>
              </TabsList>
              
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Preview */}
                <div className="lg:col-span-2">
                  <div className="border rounded-lg p-4 bg-muted/30">
                    <img
                      src={editingPhoto.preview}
                      alt="Preview"
                      className="w-full max-h-[400px] object-contain rounded"
                      style={{
                        transform: `rotate(${editState.rotation}deg) scale(${editState.zoom}) translate(${editState.x}px, ${editState.y}px)`,
                        filter: `brightness(${editState.brightness}%) contrast(${editState.contrast}%) saturate(${editState.saturation}%)`
                      }}
                    />
                  </div>
                  <canvas ref={canvasRef} className="hidden" />
                </div>
                
                {/* Controls */}
                <div className="space-y-4">
                  <TabsContent value="adjust" className="space-y-4 mt-0">
                    <div className="space-y-2">
                      <Label>Brilho: {editState.brightness}%</Label>
                      <Slider
                        value={[editState.brightness]}
                        onValueChange={([value]) => setEditState(prev => ({ ...prev, brightness: value }))}
                        min={50}
                        max={150}
                        step={1}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label>Contraste: {editState.contrast}%</Label>
                      <Slider
                        value={[editState.contrast]}
                        onValueChange={([value]) => setEditState(prev => ({ ...prev, contrast: value }))}
                        min={50}
                        max={150}
                        step={1}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label>Saturação: {editState.saturation}%</Label>
                      <Slider
                        value={[editState.saturation]}
                        onValueChange={([value]) => setEditState(prev => ({ ...prev, saturation: value }))}
                        min={0}
                        max={200}
                        step={1}
                      />
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="transform" className="space-y-4 mt-0">
                    <div className="space-y-2">
                      <Label>Rotação: {editState.rotation}°</Label>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setEditState(prev => ({ ...prev, rotation: prev.rotation - 90 }))}
                        >
                          <RotateCw className="w-4 h-4 rotate-180" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setEditState(prev => ({ ...prev, rotation: prev.rotation + 90 }))}
                        >
                          <RotateCw className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label>Zoom: {Math.round(editState.zoom * 100)}%</Label>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setEditState(prev => ({ ...prev, zoom: Math.max(0.5, prev.zoom - 0.1) }))}
                        >
                          <ZoomOut className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setEditState(prev => ({ ...prev, zoom: Math.min(3, prev.zoom + 0.1) }))}
                        >
                          <ZoomIn className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="crop" className="space-y-4 mt-0">
                    <p className="text-sm text-muted-foreground">
                      Funcionalidade de recorte será implementada em versão futura
                    </p>
                  </TabsContent>
                  
                  {/* Action Buttons */}
                  <div className="flex gap-2 pt-4 border-t">
                    <Button
                      variant="outline"
                      onClick={() => setEditState({
                        rotation: 0,
                        zoom: 1,
                        brightness: 100,
                        contrast: 100,
                        saturation: 100,
                        x: 0,
                        y: 0
                      })}
                      className="gap-2"
                    >
                      <ArrowsClockwise className="w-4 h-4" />
                      Resetar
                    </Button>
                    <Button onClick={applyEdit} className="flex-1">
                      Aplicar
                    </Button>
                  </div>
                </div>
              </div>
            </Tabs>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}