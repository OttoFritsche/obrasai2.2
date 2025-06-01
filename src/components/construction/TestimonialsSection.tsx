
import { Carousel, CarouselContent, CarouselItem } from "@/components/ui/carousel";
import { TestimonialCard } from "@/components/construction/TestimonialCard";

export const TestimonialsSection = () => {
  return (
    <div className="py-20 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold mb-4 text-construction-dark">O Que Dizem Nossos Clientes</h2>
          <p className="text-lg text-construction-dark/80 max-w-2xl mx-auto">
            Profissionais de construção de todo o Brasil já estão transformando sua gestão com ObrasAI.
          </p>
        </div>
        
        <Carousel className="max-w-5xl mx-auto">
          <CarouselContent>
            <CarouselItem className="md:basis-1/2 lg:basis-1/3 p-2">
              <TestimonialCard 
                quote="A análise preditiva da ObrasAI nos ajudou a reduzir em 22% os custos imprevistos. Uma economia real em cada projeto."
                author="Eng. Carlos Silva"
                position="Diretor de Projetos, Construtora Silva"
              />
            </CarouselItem>
            <CarouselItem className="md:basis-1/2 lg:basis-1/3 p-2">
              <TestimonialCard 
                quote="Nossa produtividade aumentou significativamente com as previsões de recursos. Nunca mais sofremos com atrasos de material."
                author="Ana Ferreira"
                position="Engenheira Chefe, Construções Inovadoras"
              />
            </CarouselItem>
            <CarouselItem className="md:basis-1/2 lg:basis-1/3 p-2">
              <TestimonialCard 
                quote="A detecção precoce de riscos nos economizou mais de R$ 500 mil em um único projeto de grande porte."
                author="Roberto Martins"
                position="CEO, Martins Incorporações"
              />
            </CarouselItem>
            <CarouselItem className="md:basis-1/2 lg:basis-1/3 p-2">
              <TestimonialCard 
                quote="Simplesmente transformador. A visibilidade que temos agora sobre nossos projetos é algo que nunca imaginamos ser possível."
                author="Luísa Mendes"
                position="Gerente de Operações, Construtora Regional"
              />
            </CarouselItem>
          </CarouselContent>
        </Carousel>
      </div>
    </div>
  );
};
