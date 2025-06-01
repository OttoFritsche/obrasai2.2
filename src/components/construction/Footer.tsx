
export const Footer = () => {
  return (
    <footer className="bg-construction-dark text-construction-light/80 py-12">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-xl font-bold mb-4 text-construction-light">ObrasAI</h3>
            <p className="text-construction-light/70">
              Transformando a gestão de construções com inteligência artificial avançada.
            </p>
          </div>
          <div>
            <h4 className="text-lg font-semibold mb-4 text-construction-light">Recursos</h4>
            <ul className="space-y-2">
              <li><a href="#" className="hover:text-construction-accent">Plataforma</a></li>
              <li><a href="#" className="hover:text-construction-accent">Planos</a></li>
              <li><a href="#" className="hover:text-construction-accent">Segurança</a></li>
              <li><a href="#" className="hover:text-construction-accent">Suporte</a></li>
            </ul>
          </div>
          <div>
            <h4 className="text-lg font-semibold mb-4 text-construction-light">Empresa</h4>
            <ul className="space-y-2">
              <li><a href="#" className="hover:text-construction-accent">Sobre Nós</a></li>
              <li><a href="#" className="hover:text-construction-accent">Blog</a></li>
              <li><a href="#" className="hover:text-construction-accent">Carreiras</a></li>
              <li><a href="#" className="hover:text-construction-accent">Contato</a></li>
            </ul>
          </div>
          <div>
            <h4 className="text-lg font-semibold mb-4 text-construction-light">Legal</h4>
            <ul className="space-y-2">
              <li><a href="#" className="hover:text-construction-accent">Termos de Serviço</a></li>
              <li><a href="#" className="hover:text-construction-accent">Política de Privacidade</a></li>
              <li><a href="#" className="hover:text-construction-accent">Cookies</a></li>
            </ul>
          </div>
        </div>
        <div className="border-t border-construction-light/20 mt-12 pt-8 text-center">
          <p>&copy; {new Date().getFullYear()} ObrasAI. Todos os direitos reservados.</p>
        </div>
      </div>
    </footer>
  );
};
