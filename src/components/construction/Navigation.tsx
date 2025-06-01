
import React, { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";
import { NavigationMenu, NavigationMenuContent, NavigationMenuItem, NavigationMenuLink, NavigationMenuList, NavigationMenuTrigger } from "@/components/ui/navigation-menu";
import { cn } from "@/lib/utils";
import { t } from "@/lib/i18n";
export const Navigation = () => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  useEffect(() => {
    const handleScroll = () => {
      const isScrolled = window.scrollY > 10;
      setScrolled(isScrolled);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);
  const navLinks = [{
    title: "Recursos",
    href: "#features"
  }, {
    title: "Como Funciona",
    href: "#how-it-works"
  }, {
    title: "Demonstração",
    href: "#demo"
  }, {
    title: "Preços",
    href: "#pricing"
  }];
  return <header className={cn("fixed top-0 left-0 right-0 z-50 transition-all duration-300 py-4", scrolled ? "bg-construction-dark/95 shadow-md" : "bg-transparent")}>
      <div className="container mx-auto px-4 flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center">
          <span className="text-2xl font-bold text-construction-light">
            Obras<span className="text-construction-accent">AI</span>
          </span>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden md:block">
          <ul className="flex space-x-8">
            {navLinks.map(link => <li key={link.title}>
                <a href={link.href} className="text-construction-light hover:text-construction-accent transition-colors">
                  {link.title}
                </a>
              </li>)}
          </ul>
        </nav>

        {/* Navigation Actions */}
        <div className="hidden md:flex items-center space-x-4">
          <Button variant="outline" size="sm" onClick={() => navigate("/login")} className="text-construction-light border-construction-light hover:bg-construction-light/10 text-base text-[#daa916] rounded-md">
            {t('auth.login')}
          </Button>
          <Button size="sm" className="bg-construction-accent hover:bg-construction-accent/90 text-white" onClick={() => navigate("/register")}>
            {t('auth.register')}
          </Button>
        </div>

        {/* Mobile Menu Button */}
        <button className="md:hidden text-construction-light" onClick={() => setMobileMenuOpen(!mobileMenuOpen)} aria-label="Menu">
          <Menu />
        </button>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && <div className="md:hidden bg-construction-dark px-4 py-6 shadow-xl">
          <nav className="flex flex-col space-y-4 mb-4">
            {navLinks.map(link => <a key={link.title} href={link.href} className="text-construction-light hover:text-construction-accent transition-colors" onClick={() => setMobileMenuOpen(false)}>
                {link.title}
              </a>)}
          </nav>
          <div className="flex flex-col space-y-3">
            <Button variant="outline" size="sm" className="text-construction-light border-construction-light hover:bg-construction-light/10 w-full" onClick={() => {
          navigate("/login");
          setMobileMenuOpen(false);
        }}>
              {t('auth.login')}
            </Button>
            <Button size="sm" className="bg-construction-accent hover:bg-construction-accent/90 text-white w-full" onClick={() => {
          navigate("/register");
          setMobileMenuOpen(false);
        }}>
              {t('auth.register')}
            </Button>
          </div>
        </div>}
    </header>;
};
