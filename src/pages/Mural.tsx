import { useState, useEffect } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { ImagePlus, PlusCircle, Send, Loader2, X, User, UserX, LogIn } from "lucide-react";
import { toast } from "sonner";
import { LoginDialog } from "@/components/LoginDialog";
import { getUsuarioLogado, supabase, uploadImagens, type User as SupabaseUser } from "@/lib/supabase";

interface Post {
  id: string;
  user_id?: string;
  autor_anonimo: boolean;
  autor_nome: string;
  autor_bairro: string;
  autor_avatar?: string;
  conteudo: string;
  imagens: string[];
  status: "pendente" | "aprovado" | "rejeitado";
  curtidas: number;
  total_comentarios: number;
  created_at: string;
}

const Mural = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loadingPosts, setLoadingPosts] = useState(true);
  const [showLogin, setShowLogin] = useState(false);

  const user = getUsuarioLogado();

  // Campos do formulário
  const [postAnonimo, setPostAnonimo] = useState(false);
  const [nomeAnonimo, setNomeAnonimo] = useState("");
  const [bairro, setBairro] = useState("");
  const [conteudo, setConteudo] = useState("");
  const [imagemFiles, setImagemFiles] = useState<File[]>([]);
  const [imagemPreviews, setImagemPreviews] = useState<string[]>([]);
  const [dragActive, setDragActive] = useState(false);

  // Carregar posts ao montar
  useEffect(() => {
    carregarPosts();
  }, []);

  const carregarPosts = async () => {
    try {
      const { data, error } = await supabase
        .from('posts_aprovados')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      setPosts(data || []);
    } catch (error) {
      console.error('Erro ao carregar posts:', error);
      toast.error('Erro ao carregar o mural');
    } finally {
      setLoadingPosts(false);
    }
  };

  const resetForm = () => {
    setPostAnonimo(false);
    setNomeAnonimo("");
    setBairro("");
    setConteudo("");
    setImagemFiles([]);
    setImagemPreviews([]);
  };

  const handleImages = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    
    const newFiles = Array.from(files);
    setImagemFiles(prev => [...prev, ...newFiles]);
    
    const urls = newFiles.map((file) => URL.createObjectURL(file));
    setImagemPreviews((prev) => [...prev, ...urls]);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragActive(false);
    const files = e.dataTransfer.files;
    if (!files) return;
    
    const newFiles = Array.from(files);
    setImagemFiles(prev => [...prev, ...newFiles]);
    
    const urls = newFiles.map((file) => URL.createObjectURL(file));
    setImagemPreviews((prev) => [...prev, ...urls]);
  };

  const removeImage = (index: number) => {
    setImagemFiles(prev => prev.filter((_, i) => i !== index));
    setImagemPreviews(prev => prev.filter((_, i) => i !== index));
  };

  const submitPost = async () => {
    // Validações
    if (!conteudo.trim()) {
      toast.error('Digite o conteúdo do post');
      return;
    }
    if (!bairro.trim()) {
      toast.error('Digite o bairro');
      return;
    }

    // Se não logado e não anônimo, pedir login
    if (!user && !postAnonimo) {
      setShowLogin(true);
      return;
    }

    // Se anônimo, precisa de nome
    if (postAnonimo && !nomeAnonimo.trim()) {
      toast.error('Digite seu nome para postar anonimamente');
      return;
    }

    setLoading(true);
    try {
      // Upload das imagens
      let imagensUrls: string[] = [];
      if (imagemFiles.length > 0) {
        imagensUrls = await uploadImagens('posts-images', imagemFiles, 'posts');
      }

      // Criar post
      const postData: any = {
        conteudo: conteudo.trim(),
        autor_bairro: bairro.trim(),
        imagens: imagensUrls,
        status: 'pendente',
        curtidas: 0,
        comentarios: 0,
      };

      // Se anônimo
      if (postAnonimo || !user) {
        postData.autor_anonimo = true;
        postData.autor_nome = postAnonimo ? nomeAnonimo.trim() : 'Anônimo';
      } else {
        // Se logado
        postData.autor_anonimo = false;
        postData.user_id = user.id;
        postData.autor_nome = user.nome || user.email.split('@')[0];
      }

      const { error } = await supabase
        .from('posts')
        .insert([postData]);

      if (error) throw error;

      toast.success('Post enviado!', {
        description: 'Seu post está em moderação e será publicado em breve.'
      });

      resetForm();
      setOpen(false);
      carregarPosts();
    } catch (error: any) {
      console.error('Erro ao criar post:', error);
      toast.error('Erro ao criar post', {
        description: error.message
      });
    } finally {
      setLoading(false);
    }
  };

  const handleLoginSuccess = () => {
    // Após login, submeter automaticamente
    setTimeout(() => submitPost(), 500);
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="container mx-auto px-4 py-12 pb-32 space-y-10 flex-grow">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold gradient-text">Mural da Cidade</h2>
            <p className="text-muted-foreground max-w-xl text-sm mt-2">Compartilhe acontecimentos, observações e destaques do seu bairro. Cada postagem entra como pendente aguardando moderação.</p>
          </div>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button variant="animated" className="gap-2">
                <PlusCircle className="h-5 w-5" /> Nova Postagem
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  {user ? (
                    <>
                      <User className="h-5 w-5 text-primary" />
                      Criar nova postagem
                    </>
                  ) : (
                    <>
                      <UserX className="h-5 w-5 text-muted-foreground" />
                      Criar postagem
                    </>
                  )}
                </DialogTitle>
                <DialogDescription>
                  {user ? (
                    <>Postando como <strong>{user.nome || user.email}</strong>. Você pode escolher postar anonimamente abaixo.</>
                  ) : (
                    <>Você pode postar anonimamente ou fazer login para ter um perfil.</>
                  )}
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-5">
                {/* Opção de login/anônimo */}
                {!user && (
                  <Card className="bg-primary/5 border-primary/20">
                    <CardContent className="pt-4 pb-3">
                      <div className="flex items-center justify-between gap-4">
                        <div className="flex-1">
                          <p className="text-sm font-medium">Fazer login para postar com perfil</p>
                          <p className="text-xs text-muted-foreground mt-1">
                            Login rápido sem senha
                          </p>
                        </div>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => setShowLogin(true)}
                          className="gap-2 whitespace-nowrap"
                        >
                          <LogIn className="h-4 w-4" />
                          Login
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Toggle anônimo (só aparece se logado) */}
                {user && (
                  <Card className="bg-muted/30">
                    <CardContent className="pt-4 pb-3">
                      <div className="flex items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                          {postAnonimo ? (
                            <UserX className="h-5 w-5 text-muted-foreground" />
                          ) : (
                            <User className="h-5 w-5 text-primary" />
                          )}
                          <div>
                            <Label htmlFor="anonimo" className="text-sm font-medium cursor-pointer">
                              Postar anonimamente
                            </Label>
                            <p className="text-xs text-muted-foreground">
                              {postAnonimo ? 'Seu nome não será exibido' : 'Postar com seu perfil'}
                            </p>
                          </div>
                        </div>
                        <Switch
                          id="anonimo"
                          checked={postAnonimo}
                          onCheckedChange={setPostAnonimo}
                        />
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Campo nome (só se anônimo OU não logado) */}
                {(postAnonimo || !user) && (
                  <div className="space-y-2">
                    <Label htmlFor="nome">Nome para exibição</Label>
                    <Input
                      id="nome"
                      placeholder="Digite seu nome ou apelido"
                      value={nomeAnonimo}
                      onChange={(e) => setNomeAnonimo(e.target.value)}
                    />
                  </div>
                )}

                {/* Bairro */}
                <div className="space-y-2">
                  <Label htmlFor="bairro">Bairro *</Label>
                  <Input
                    id="bairro"
                    placeholder="Ex: Centro, Jardim América..."
                    value={bairro}
                    onChange={(e) => setBairro(e.target.value)}
                  />
                </div>

                {/* Conteúdo */}
                <div className="space-y-2">
                  <Label htmlFor="conteudo">Conteúdo *</Label>
                  <Textarea
                    id="conteudo"
                    placeholder="O que está acontecendo no seu bairro?"
                    rows={6}
                    value={conteudo}
                    onChange={(e) => setConteudo(e.target.value)}
                  />
                </div>

                {/* Upload de imagens */}
                <div className="space-y-2">
                  <Label>Imagens (opcional)</Label>
                  <div
                    className={
                      `rounded-xl border-2 border-dashed p-6 text-center cursor-pointer relative transition-all duration-300 ` +
                      `${dragActive ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/70 hover:bg-accent/30'}`
                    }
                    onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
                    onDragLeave={() => setDragActive(false)}
                    onDrop={handleDrop}
                    onClick={() => document.getElementById('file-input-mural')?.click()}
                  >
                    <input id="file-input-mural" className="hidden" type="file" multiple accept="image/*" onChange={handleImages} />
                    <div className="flex flex-col items-center gap-2">
                      <ImagePlus className="h-8 w-8 text-primary" />
                      <p className="text-xs text-muted-foreground">
                        Arraste imagens ou clique para selecionar
                      </p>
                    </div>
                  </div>
                  {imagemPreviews.length > 0 && (
                    <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 mt-4">
                      {imagemPreviews.map((src, index) => (
                        <div key={index} className="group relative rounded-lg overflow-hidden border shadow-sm">
                          <img src={src} alt="preview" className="h-28 w-full object-cover group-hover:scale-105 transition-transform duration-300" />
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              removeImage(index);
                            }}
                            className="absolute top-1 right-1 bg-background/80 backdrop-blur-sm rounded-full p-1 shadow hover:bg-destructive hover:text-destructive-foreground transition-colors"
                            aria-label="Remover imagem"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <DialogFooter className="gap-2">
                <Button variant="ghost" onClick={() => setOpen(false)}>Cancelar</Button>
                <Button 
                  onClick={submitPost} 
                  disabled={loading || !conteudo.trim() || !bairro.trim() || (postAnonimo && !nomeAnonimo.trim())} 
                  className="gap-2"
                >
                  {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                  Enviar para moderação
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {/* Lista de posts */}
        <div className="space-y-6">
          {loadingPosts ? (
            <Card className="glass-card border-2">
              <CardContent className="py-12 flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </CardContent>
            </Card>
          ) : posts.length === 0 ? (
            <Card className="glass-card border-2">
              <CardHeader>
                <CardTitle className="text-lg">Nenhuma postagem ainda</CardTitle>
                <CardDescription>Seja o primeiro a compartilhar algo sobre seu bairro!</CardDescription>
              </CardHeader>
            </Card>
          ) : (
            posts.map((post) => (
              <Card key={post.id} className="glass-card overflow-hidden border-2 hover:border-primary/40 transition-all">
                <CardHeader className="pb-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3">
                      {/* Avatar */}
                      <div className="flex-shrink-0">
                        {post.autor_anonimo || !post.autor_avatar ? (
                          <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
                            {post.autor_anonimo ? (
                              <UserX className="h-5 w-5 text-muted-foreground" />
                            ) : (
                              <User className="h-5 w-5 text-primary" />
                            )}
                          </div>
                        ) : (
                          <img 
                            src={post.autor_avatar} 
                            alt={post.autor_nome} 
                            className="h-10 w-10 rounded-full object-cover"
                          />
                        )}
                      </div>

                      {/* Info do autor */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <CardTitle className="text-base">
                            {post.autor_anonimo ? (
                              <span className="text-muted-foreground italic">{post.autor_nome}</span>
                            ) : (
                              post.autor_nome
                            )}
                          </CardTitle>
                          {post.autor_anonimo && (
                            <Badge variant="secondary" className="text-xs">Anônimo</Badge>
                          )}
                        </div>
                        <CardDescription className="text-xs mt-0.5">
                          {post.autor_bairro} • {new Date(post.created_at).toLocaleDateString("pt-BR", {
                            day: '2-digit',
                            month: 'short',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </CardDescription>
                      </div>
                    </div>

                    {/* Badge de status */}
                    <Badge 
                      variant={post.status === "pendente" ? "secondary" : "default"} 
                      className="uppercase tracking-wide text-xs flex-shrink-0"
                    >
                      {post.status}
                    </Badge>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  <p className="text-sm leading-relaxed whitespace-pre-line">{post.conteudo}</p>
                  
                  {/* Imagens */}
                  {post.imagens.length > 0 && (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                      {post.imagens.map((src, idx) => (
                        <div key={idx} className="group relative rounded-lg overflow-hidden border">
                          <img src={src} alt={`Imagem ${idx + 1}`} className="h-32 w-full object-cover group-hover:scale-105 transition-transform duration-300" />
                          <div className="absolute inset-0 bg-gradient-to-t from-background/60 to-transparent pointer-events-none" />
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Stats */}
                  <div className="flex items-center gap-4 text-xs text-muted-foreground pt-2 border-t">
                    <span>❤️ {post.curtidas} curtidas</span>
                    <span>💬 {post.total_comentarios} comentários</span>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </main>
      <Footer />

      {/* Dialog de Login */}
      <LoginDialog
        open={showLogin}
        onOpenChange={setShowLogin}
        onLoginSuccess={handleLoginSuccess}
      />
    </div>
  );
};

export default Mural;
