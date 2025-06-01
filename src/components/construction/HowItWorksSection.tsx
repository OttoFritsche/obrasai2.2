
export const HowItWorksSection = () => {
  return (
    <div className="py-20 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold mb-4 text-construction-dark">Como Funciona</h2>
          <p className="text-lg text-construction-dark/80 max-w-2xl mx-auto">
            Nosso processo simplificado transforma dados complexos em insights acionáveis em apenas três etapas.
          </p>
        </div>
        
        <div className="flex flex-col md:flex-row justify-between max-w-5xl mx-auto">
          {[
            {
              step: 1,
              title: "Integre seus Dados",
              description: "Conecte planilhas, ERPs, cronogramas e documentos do projeto em nossa plataforma segura.",
              icon: (
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-8 h-8"><path d="M12.5 16.8c0-1.8 1.3-3.3 3.1-3.6 1-.2 2.2-.2 3.2-.5 1.6-.5 2.4-1.6 2.4-3.2V8c0-1.8-1.4-3.3-3.2-3.4-1.3-.1-2.7-.1-4-.1s-2.7 0-4 .1C8.4 4.7 7 6.2 7 8v1.5c0 1.6.8 2.7 2.4 3.2 1 .2 2.2.3 3.2.5 1.8.3 3.1 1.8 3.1 3.6v1.5c0 1.4-.8 2.7-2.4 3.2-1 .2-2.2.2-3.2.2s-2.2 0-3.2-.2c-1.6-.5-2.4-1.8-2.4-3.2V17"/><path d="M12 4v17"/></svg>
              )
            },
            {
              step: 2,
              title: "IA Analisa & Prevê",
              description: "Nossos algoritmos processam e analisam seus dados para identificar padrões e fazer previsões.",
              icon: (
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-8 h-8"><path d="M12 2H2v10h10V2Z"/><path d="M22 12h-8v8h8v-8Z"/><path d="M14 2h8v8h-8V2Z"/><circle cx="6" cy="16" r="4"/></svg>
              )
            },
            {
              step: 3,
              title: "Receba Insights Acionáveis",
              description: "Visualize recomendações práticas e tome decisões embasadas para o sucesso do seu projeto.",
              icon: (
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-8 h-8"><path d="M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2Z"/><path d="M13 5v2"/><path d="M13 17v2"/><path d="M13 11v2"/></svg>
              )
            }
          ].map((item, i) => (
            <div key={i} className="flex flex-col items-center mb-8 md:mb-0 relative">
              {i < 2 && (
                <div className="hidden md:block absolute top-10 left-[60%] w-32 h-0.5 bg-construction-accent/50">
                  <div className="absolute right-0 top-1/2 -translate-y-1/2 rotate-45 w-2 h-2 border-t-2 border-r-2 border-construction-accent/50"></div>
                </div>
              )}
              <div className="flex items-center justify-center w-20 h-20 rounded-full bg-construction-dark text-construction-accent mb-4">
                {item.icon}
              </div>
              <div className="text-center max-w-xs">
                <h3 className="text-xl font-bold text-construction-dark mb-2">
                  {item.step}. {item.title}
                </h3>
                <p className="text-construction-dark/80">{item.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
