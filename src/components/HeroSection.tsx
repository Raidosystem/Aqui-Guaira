import { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ChevronLeft, ChevronRight, ExternalLink } from '@phosphor-icons/react'
import { useKV } from '@github/spark/hooks'

interface Banner {
  id: string
  title: string
  description: string
  imageUrl: string
  link: string
  isSponsored: boolean
}

export function HeroSection() {
  const [banners] = useKV<Banner[]>('hero-banners', [])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isPlaying, setIsPlaying] = useState(true)

  useEffect(() => {
    if (!isPlaying || banners.length <= 1) return

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % banners.length)
    }, 5000)

    return () => clearInterval(interval)
  }, [isPlaying, banners.length])

  if (banners.length === 0) {
    return (
      <section className="relative h-96 bg-gradient-to-r from-primary/20 to-secondary/20">
        <div className="container mx-auto px-4 h-full flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-4xl font-bold text-foreground mb-4">
              Bem-vindo ao Aqui Guaíra
            </h2>
            <p className="text-xl text-muted-foreground">
              Conectando nossa comunidade
            </p>
          </div>
        </div>
      </section>
    )
  }

  const currentBanner = banners[currentIndex]

  return (
    <section 
      className="relative h-96 overflow-hidden"
      onMouseEnter={() => setIsPlaying(false)}
      onMouseLeave={() => setIsPlaying(true)}
    >
      <div 
        className="absolute inset-0 bg-cover bg-center transition-all duration-500"
        style={{ 
          backgroundImage: `linear-gradient(rgba(0,0,0,0.4), rgba(0,0,0,0.4)), url(${currentBanner.imageUrl})` 
        }}
      />
      
      <div className="relative container mx-auto px-4 h-full flex items-center">
        <div className="text-white max-w-2xl">
          {currentBanner.isSponsored && (
            <Badge variant="secondary" className="mb-4">
              Patrocinado
            </Badge>
          )}
          <h2 className="text-4xl font-bold mb-4">{currentBanner.title}</h2>
          <p className="text-xl mb-6 opacity-90">{currentBanner.description}</p>
          <Button 
            size="lg" 
            className="gap-2"
            onClick={() => window.open(currentBanner.link, '_blank')}
          >
            Saiba mais
            <ExternalLink className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Navigation */}
      {banners.length > 1 && (
        <>
          <Button
            variant="ghost"
            size="sm"
            className="absolute left-4 top-1/2 -translate-y-1/2 text-white hover:bg-white/20"
            onClick={() => setCurrentIndex((prev) => (prev - 1 + banners.length) % banners.length)}
          >
            <ChevronLeft className="w-6 h-6" />
          </Button>

          <Button
            variant="ghost"
            size="sm"
            className="absolute right-4 top-1/2 -translate-y-1/2 text-white hover:bg-white/20"
            onClick={() => setCurrentIndex((prev) => (prev + 1) % banners.length)}
          >
            <ChevronRight className="w-6 h-6" />
          </Button>

          {/* Indicators */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
            {banners.map((_, index) => (
              <button
                key={index}
                className={`w-3 h-3 rounded-full transition-all ${
                  index === currentIndex ? 'bg-white' : 'bg-white/50'
                }`}
                onClick={() => setCurrentIndex(index)}
              />
            ))}
          </div>
        </>
      )}
    </section>
  )
}