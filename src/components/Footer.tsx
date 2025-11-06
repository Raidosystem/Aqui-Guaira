const Footer = () => {
  return (
  <footer className="bg-accent/30 border-t border-border mt-16 relative">
      <div className="absolute inset-0 pointer-events-none opacity-40 bg-[radial-gradient(circle_at_20%_20%,hsl(var(--primary)/0.25),transparent_70%)]" />
      <div className="container mx-auto px-4 py-12 relative">
        <div className="grid md:grid-cols-3 gap-8">
          {/* About */}
          <div className="space-y-3">
            <h3 className="font-bold text-lg bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">Aqui Guaíra</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Portal comunitário não oficial da cidade de Guaíra (SP) reunindo dados, locais e iniciativas da comunidade.
            </p>
            <p className="text-xs text-muted-foreground">Não é o site oficial da Prefeitura.</p>
          </div>

          {/* Useful Links */}
          <div className="space-y-3">
            <h3 className="font-semibold text-sm tracking-wide text-foreground/80 uppercase">Links Úteis</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                  Prefeitura de Guaíra
                </a>
              </li>
              <li>
                <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                  Câmara Municipal
                </a>
              </li>
              <li>
                <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                  Emergências: 190/193
                </a>
              </li>
            </ul>
          </div>

          {/* Portal */}
          <div className="space-y-3">
            <h3 className="font-semibold text-sm tracking-wide text-foreground/80 uppercase">Portal</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                  Termos de Uso
                </a>
              </li>
              <li>
                <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                  Política de Privacidade
                </a>
              </li>
              <li>
                <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                  Contato
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-border mt-10 pt-6 text-center text-xs text-muted-foreground flex flex-col items-center gap-2">
          <p className="max-w-lg leading-relaxed">
            © {new Date().getFullYear()} Aqui Guaíra • Dados: IBGE • Turismo: Portal Municipal • Projeto colaborativo.
          </p>
          <p className="opacity-70">Construído com React + Vite + Tailwind.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
