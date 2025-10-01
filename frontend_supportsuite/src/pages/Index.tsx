// Update this page (the content is just a fallback if you fail to update the page)

const Index = () => {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="text-center animate-slide-in-up">
        <div className="mb-8">
          <div className="bg-gradient-primary bg-clip-text text-transparent">
            <h1 className="text-6xl font-bold mb-4">TelcoNova</h1>
          </div>
          <h2 className="text-2xl font-semibold text-foreground mb-2">Support Suite</h2>
          <p className="text-xl text-muted-foreground">Sistema de Gestión de Asignaciones de Técnicos</p>
        </div>
        
        <div className="space-y-4">
          <p className="text-muted-foreground">
            Gestión inteligente de órdenes de servicio y asignación de técnicos
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <div className="w-2 h-2 bg-success rounded-full"></div>
              <span>Sistema de autenticación seguro</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <div className="w-2 h-2 bg-accent rounded-full"></div>
              <span>Asignación inteligente de técnicos</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <div className="w-2 h-2 bg-primary-light rounded-full"></div>
              <span>Gestión de cargas de trabajo</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
