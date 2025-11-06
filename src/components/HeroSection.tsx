const HeroSection = () => {
  return (
    <section className="relative bg-gradient-to-br from-accent via-accent/80 to-primary/10 py-20 md:py-32 overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 left-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl animate-float"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-primary/5 rounded-full blur-3xl animate-float" style={{ animationDelay: "1s" }}></div>
      </div>
      
      <div className="container mx-auto px-4 text-center relative z-10">
        <h2 className="text-5xl md:text-7xl font-bold bg-gradient-to-r from-foreground via-foreground to-primary bg-clip-text text-transparent mb-6 animate-scale-in">
          Bem-vindo ao Aqui Guaíra
        </h2>
        <p className="text-xl md:text-2xl text-muted-foreground animate-fade-in" style={{ animationDelay: "0.2s" }}>
          Conectando nossa comunidade
        </p>
      </div>
    </section>
  );
};

export default HeroSection;
