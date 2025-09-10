import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { MessageCircle, Heart, Calendar, MapPin, Plus, Image as ImageIcon, Video } from '@phosphor-icons/react'
import { useKV } from '@github/spark/hooks'

interface Post {
  id: string
  author: string
  authorAvatar?: string
  neighborhood: string
  content: string
  images: string[]
  videos: string[]
  createdAt: string
  likes: number
  status: 'approved' | 'pending' | 'rejected'
  isIssue: boolean
}

interface CommunityFeedProps {
  isPreview?: boolean
}

export function CommunityFeed({ isPreview = false }: CommunityFeedProps) {
  const [posts] = useKV<Post[]>('community-posts', [])
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)

  const approvedPosts = posts.filter(post => post.status === 'approved' && !post.isIssue)
  const displayPosts = isPreview ? approvedPosts.slice(0, 6) : approvedPosts

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date)
  }

  return (
    <section className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-3xl font-bold mb-2">
            {isPreview ? 'Últimas do Mural' : 'Mural da População'}
          </h2>
          <p className="text-muted-foreground">
            {isPreview 
              ? 'Veja o que está acontecendo na nossa comunidade'
              : 'Compartilhe e acompanhe o que acontece em Guaíra'
            }
          </p>
        </div>

        {!isPreview && (
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="w-4 h-4" />
                Nova postagem
              </Button>
            </DialogTrigger>
            <CreatePostDialog onClose={() => setIsCreateDialogOpen(false)} />
          </Dialog>
        )}
      </div>

      {displayPosts.length === 0 ? (
        <Card className="text-center py-12">
          <CardContent>
            <MessageCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Nenhuma postagem ainda</h3>
            <p className="text-muted-foreground mb-4">
              Seja o primeiro a compartilhar algo com a comunidade
            </p>
            {!isPreview && (
              <Button onClick={() => setIsCreateDialogOpen(true)}>
                Criar primeira postagem
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {displayPosts.map(post => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>
      )}

      {isPreview && approvedPosts.length > 6 && (
        <div className="text-center mt-8">
          <Button variant="outline" size="lg">
            Ver todas as postagens
          </Button>
        </div>
      )}
    </section>
  )
}

interface PostCardProps {
  post: Post
}

function PostCard({ post }: PostCardProps) {
  const [likes, setLikes] = useKV(`post-likes-${post.id}`, post.likes)
  const [hasLiked, setHasLiked] = useKV(`user-liked-${post.id}`, false)

  const handleLike = () => {
    if (hasLiked) {
      setLikes((current: number) => current - 1)
      setHasLiked(false)
    } else {
      setLikes((current: number) => current + 1)
      setHasLiked(true)
    }
  }

  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-3">
        <div className="flex items-start gap-3">
          <Avatar className="w-10 h-10">
            <AvatarImage src={post.authorAvatar} />
            <AvatarFallback>
              {post.author.split(' ').map(n => n[0]).join('').toUpperCase()}
            </AvatarFallback>
          </Avatar>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-sm truncate">{post.author}</h3>
              <Badge variant="outline" className="text-xs">
                {post.neighborhood}
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              {formatDate(post.createdAt)}
            </p>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        <p className="text-sm mb-4 leading-relaxed">{post.content}</p>

        {/* Media */}
        {(post.images.length > 0 || post.videos.length > 0) && (
          <div className="mb-4">
            {post.images.length > 0 && (
              <div className="grid grid-cols-2 gap-2">
                {post.images.slice(0, 4).map((image, index) => (
                  <div
                    key={index}
                    className="aspect-square bg-muted rounded-lg overflow-hidden relative"
                  >
                    <img
                      src={image}
                      alt=""
                      className="w-full h-full object-cover"
                    />
                    {index === 3 && post.images.length > 4 && (
                      <div className="absolute inset-0 bg-black/50 flex items-center justify-center text-white font-semibold">
                        +{post.images.length - 4}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {post.videos.length > 0 && (
              <div className="mt-2">
                <div className="aspect-video bg-muted rounded-lg overflow-hidden">
                  <video
                    src={post.videos[0]}
                    controls
                    className="w-full h-full"
                  />
                </div>
              </div>
            )}
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center gap-4 pt-3 border-t">
          <Button
            variant="ghost"
            size="sm"
            className={`gap-2 ${hasLiked ? 'text-red-500' : ''}`}
            onClick={handleLike}
          >
            <Heart className={`w-4 h-4 ${hasLiked ? 'fill-current' : ''}`} />
            {likes}
          </Button>
          
          <Button variant="ghost" size="sm" className="gap-2">
            <MessageCircle className="w-4 h-4" />
            Comentar
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

function CreatePostDialog({ onClose }: { onClose: () => void }) {
  const [posts, setPosts] = useKV<Post[]>('community-posts', [])
  const [content, setContent] = useState('')
  const [author, setAuthor] = useState('')
  const [neighborhood, setNeighborhood] = useState('')
  const [selectedImages, setSelectedImages] = useState<string[]>([])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!content.trim() || !author.trim() || !neighborhood.trim()) return

    const newPost: Post = {
      id: Date.now().toString(),
      author: author.trim(),
      neighborhood: neighborhood.trim(),
      content: content.trim(),
      images: selectedImages,
      videos: [],
      createdAt: new Date().toISOString(),
      likes: 0,
      status: 'pending',
      isIssue: false
    }

    setPosts((current: Post[]) => [newPost, ...current])
    
    setContent('')
    setAuthor('')
    setNeighborhood('')
    setSelectedImages([])
    onClose()
  }

  return (
    <DialogContent className="max-w-lg">
      <DialogHeader>
        <DialogTitle>Nova postagem</DialogTitle>
        <DialogDescription>
          Compartilhe algo com a comunidade de Guaíra. Todas as postagens passam por moderação.
        </DialogDescription>
      </DialogHeader>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="author">Seu nome</Label>
            <Input
              id="author"
              value={author}
              onChange={(e) => setAuthor(e.target.value)}
              placeholder="Como quer ser identificado"
              required
            />
          </div>
          
          <div>
            <Label htmlFor="neighborhood">Bairro</Label>
            <Input
              id="neighborhood"
              value={neighborhood}
              onChange={(e) => setNeighborhood(e.target.value)}
              placeholder="Seu bairro"
              required
            />
          </div>
        </div>

        <div>
          <Label htmlFor="content">Conteúdo</Label>
          <Textarea
            id="content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="O que você quer compartilhar?"
            rows={4}
            required
          />
        </div>

        <div>
          <Label>Fotos (opcional)</Label>
          <div className="border-2 border-dashed border-muted rounded-lg p-6 text-center">
            <ImageIcon className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">
              Clique para adicionar fotos
            </p>
          </div>
        </div>

        <div className="bg-muted/50 p-4 rounded-lg">
          <p className="text-sm text-muted-foreground">
            ⚠️ Sua postagem será analisada antes de ser publicada. Evite conteúdo ofensivo ou inadequado.
          </p>
        </div>

        <div className="flex gap-2 justify-end">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit">
            Enviar para moderação
          </Button>
        </div>
      </form>
    </DialogContent>
  )
}