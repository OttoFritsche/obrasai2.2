

export const DemoSection = () => {
  return <div id="demo" className="bg-construction-dark py-20">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold mb-4 text-construction-light">Veja a IA em Ação</h2>
          <p className="text-lg text-construction-light/80 max-w-2xl mx-auto">
            Nossa plataforma proporciona visualizações claras e insights acionáveis para otimizar seus projetos de construção.
          </p>
        </div>
        
        <div className="max-w-5xl mx-auto relative">
          <div className="bg-gradient-to-r from-construction-accent/20 to-construction-dark p-1 rounded-lg shadow-xl">
            <img alt="ObrasAI Dashboard" className="w-full h-auto rounded-lg" src="/lovable-uploads/4d142594-a29e-4e94-bd77-48cf91ebcfac.png" />
          </div>
          <div className="absolute -bottom-4 left-1/2 transform -translate-x-1/2 bg-construction-accent text-white px-6 py-3 rounded-full shadow-lg">
            <span className="font-bold">Dashboard inteligente com métricas em tempo real</span>
          </div>
        </div>
      </div>
    </div>;
};
