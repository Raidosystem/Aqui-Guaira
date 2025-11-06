import { useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { ImagePlus, PlusCircle, Send, Loader2, X } from "lucide-react";

interface Post {
  id: string;
  nome: string;
  bairro: string;
  conteudo: string;
  imagens: string[];
  status: "pendente" | "aprovado";
  createdAt: string;
}

const Mural = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const [nome, setNome] = useState("");
  const [bairro, setBairro] = useState("");
  const [conteudo, setConteudo] = useState("");
  const [imagens, setImagens] = useState<string[]>([]);
  const [dragActive, setDragActive] = useState(false);

  const resetForm = () => {
    setNome("");
    setBairro("");
    setConteudo("");
    setImagens([]);
  };

  const handleImages = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    const urls = Array.from(files).map((file) => URL.createObjectURL(file));
    setImagens((prev) => [...prev, ...urls]);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragActive(false);
    const files = e.dataTransfer.files;
    if (!files) return;
    const urls = Array.from(files).map((file) => URL.createObjectURL(file));
    setImagens((prev) => [...prev, ...urls]);
  };

  const removeImage = (url: string) => {
    setImagens((prev) => prev.filter((i) => i !== url));
  };

  const submitPost = () => {
    if (!nome.trim() || !bairro.trim() || !conteudo.trim()) return;
    setLoading(true);
    setTimeout(() => {
      const newPost: Post = {
        id: crypto.randomUUID(),
        nome: nome.trim(),
        bairro: bairro.trim(),
        conteudo: conteudo.trim(),
        imagens,
        status: "pendente",
        createdAt: new Date().toISOString(),
      };
      setPosts((prev) => [newPost, ...prev]);
      setLoading(false);
      resetForm();
      setOpen(false);
    }, 700); // Simula envio
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
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>Criar nova postagem</DialogTitle>
                <DialogDescription>Preencha os campos e envie para moderação.</DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <Input placeholder="Seu nome" value={nome} onChange={(e) => setNome(e.target.value)} />
                <Input placeholder="Bairro" value={bairro} onChange={(e) => setBairro(e.target.value)} />
                <Textarea placeholder="Conteúdo / descrição" rows={5} value={conteudo} onChange={(e) => setConteudo(e.target.value)} />

                <div className="space-y-2">
                  <label className="text-sm font-medium">Imagens</label>
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
                        Arraste imagens ou clique para selecionar (JPG/PNG)
                      </p>
                    </div>
                  </div>
                  {imagens.length > 0 && (
                    <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 mt-4">
                      {imagens.map((src) => (
                        <div key={src} className="group relative rounded-lg overflow-hidden border shadow-sm">
                          <img src={src} alt="preview" className="h-28 w-full object-cover group-hover:scale-105 transition-transform duration-300" />
                          <button
                            type="button"
                            onClick={() => removeImage(src)}
                            className="absolute top-1 right-1 bg-background/70 backdrop-blur-sm rounded-full p-1 shadow hover:bg-destructive/90 hover:text-destructive-foreground transition-colors"
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
              <DialogFooter>
                <Button variant="ghost" onClick={() => setOpen(false)}>Cancelar</Button>
                <Button variant="animated" onClick={submitPost} disabled={loading || !nome || !bairro || !conteudo} className="gap-2">
                  {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                  Enviar para moderação
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {/* Lista de posts */}
        <div className="space-y-6">
          {posts.length === 0 && (
            <Card className="glass-card border-2">
              <CardHeader>
                <CardTitle className="text-lg">Nenhuma postagem ainda</CardTitle>
                <CardDescription>Seja o primeiro a compartilhar algo sobre seu bairro!</CardDescription>
              </CardHeader>
            </Card>
          )}

          {posts.map((post) => (
            <Card key={post.id} className="glass-card overflow-hidden border-2">
              <CardHeader className="pb-4">
                <div className="flex flex-col gap-1">
                  <CardTitle className="text-xl flex items-center gap-3">
                    <span>{post.nome}</span>
                    <Badge variant={post.status === "pendente" ? "secondary" : "default"} className="uppercase tracking-wide text-xs">
                      {post.status}
                    </Badge>
                  </CardTitle>
                  <CardDescription className="text-sm">Bairro: {post.bairro} • {new Date(post.createdAt).toLocaleDateString("pt-BR")}</CardDescription>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm leading-relaxed whitespace-pre-line text-muted-foreground">{post.conteudo}</p>
                {post.imagens.length > 0 && (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                    {post.imagens.map((src) => (
                      <div key={src} className="group relative rounded-lg overflow-hidden border">
                        <img src={src} alt={post.nome} className="h-32 w-full object-cover group-hover:scale-105 transition-transform duration-300" />
                        <div className="absolute inset-0 bg-gradient-to-t from-background/60 to-transparent pointer-events-none" />
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Mural;
