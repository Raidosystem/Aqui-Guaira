import { useState, useRef } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Progress } from '@/components/ui/progress'
import { toast } from 'sonner'
import { Upload, X, Camera, Image as ImageIcon } from '@phosphor-icons/react'

interface LogoUploaderProps {
  currentLogo?: string
  onLogoChange: (logoUrl: string) => void
  maxFileSize?: number
}

export function LogoUploader({ 
  currentLogo, 
  onLogoChange, 
  maxFileSize = 5 * 1024 * 1024 // 5MB 
}: LogoUploaderProps) {
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [previewUrl, setPreviewUrl] = useState<string>('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  const validateFile = (file: File): boolean => {
    if (!file.type.startsWith('image/')) {
      toast.error('Por favor, selecione apenas arquivos de imagem')
      return false
    }
    
    if (file.size > maxFileSize) {
      toast.error(`Arquivo muito grande. Máximo: ${Math.round(maxFileSize / 1024 / 1024)}MB`)
      return false
    }
    
    return true
  }

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file || !validateFile(file)) return

    setIsUploading(true)
    setUploadProgress(0)

    try {
      // Create preview
      const objectUrl = URL.createObjectURL(file)
      setPreviewUrl(objectUrl)

      // Simulate upload progress
      for (let i = 0; i <= 100; i += 10) {
        await new Promise(resolve => setTimeout(resolve, 100))
        setUploadProgress(i)
      }

      // Simulate upload completion
      const uploadedUrl = `https://images.unsplash.com/photo-${Date.now()}?w=400&h=400&fit=crop&auto=format`
      onLogoChange(uploadedUrl)
      
      // Clean up object URL
      URL.revokeObjectURL(objectUrl)
      setPreviewUrl('')
      
      toast.success('Logo enviado com sucesso!')
    } catch (error) {
      console.error('Error uploading logo:', error)
      toast.error('Erro ao enviar logo')
    } finally {
      setIsUploading(false)
      setUploadProgress(0)
    }
  }

  const removeLogo = () => {
    onLogoChange('')
    setPreviewUrl('')
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const displayImage = previewUrl || currentLogo

  return (
    <div className="space-y-4">
      {/* Current Logo Display */}
      {displayImage && (
        <div className="flex items-center gap-4">
          <div className="w-24 h-24 rounded-lg overflow-hidden bg-muted border">
            <img 
              src={displayImage} 
              alt="Logo da empresa" 
              className="w-full h-full object-cover"
            />
          </div>
          <div className="flex-1">
            <p className="font-medium">Logo atual</p>
            <p className="text-sm text-muted-foreground">
              {isUploading ? 'Enviando...' : 'Clique no botão abaixo para alterar'}
            </p>
            {!isUploading && (
              <Button
                variant="outline"
                size="sm"
                onClick={removeLogo}
                className="mt-2 gap-2"
              >
                <X className="w-4 h-4" />
                Remover
              </Button>
            )}
          </div>
        </div>
      )}

      {/* Upload Progress */}
      {isUploading && (
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Enviando logo...</span>
            <span>{uploadProgress}%</span>
          </div>
          <Progress value={uploadProgress} />
        </div>
      )}

      {/* Upload Area */}
      {!isUploading && (
        <div>
          <Label htmlFor="logo-upload" className="cursor-pointer">
            <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center hover:border-muted-foreground/50 transition-colors">
              <div className="flex flex-col items-center gap-2">
                <Camera className="w-8 h-8 text-muted-foreground" />
                <div>
                  <p className="font-medium">
                    {displayImage ? 'Alterar logo' : 'Adicionar logo'}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Clique para selecionar uma imagem
                  </p>
                </div>
                <div className="flex gap-2 text-xs text-muted-foreground">
                  <span>Máximo {Math.round(maxFileSize / 1024 / 1024)}MB</span>
                  <span>•</span>
                  <span>JPG, PNG, WebP</span>
                </div>
              </div>
            </div>
          </Label>
          <Input
            ref={fileInputRef}
            id="logo-upload"
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFileSelect}
            disabled={isUploading}
          />
        </div>
      )}

      {/* Tips */}
      {!displayImage && (
        <div className="bg-muted/50 rounded-lg p-4">
          <h4 className="font-medium text-sm mb-2">💡 Dicas para um bom logo:</h4>
          <ul className="text-sm text-muted-foreground space-y-1">
            <li>• Use uma imagem quadrada (mesma largura e altura)</li>
            <li>• Resolução mínima: 200x200 pixels</li>
            <li>• Prefira fundos transparentes ou neutros</li>
            <li>• Evite textos muito pequenos</li>
          </ul>
        </div>
      )}
    </div>
  )
}