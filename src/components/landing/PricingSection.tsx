import { motion } from "framer-motion";
import { Check, Star, Zap, Building, Crown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

interface PricingCardProps {
  plan: {
    name: string;
    price: number;
    originalPrice?: number;
    description: string;
    features: string[];
    highlighted?: boolean;
    popular?: boolean;
    icon: React.ElementType;
    color: string;
  };
  index: number;
}

const PricingCard = ({ plan, index }: PricingCardProps) => {
  const [isHovered, setIsHovered] = useState(false);
  const navigate = useNavigate();
  const Icon = plan.icon;
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1, duration: 0.5 }}
      viewport={{ once: true }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`relative ${plan.highlighted ? 'z-10' : ''}`}
    >
      {/* Popular badge */}
      {plan.popular && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="absolute -top-5 left-1/2 transform -translate-x-1/2"
        >
          <Badge className="bg-gradient-to-r from-construction-accent to-orange-500 text-white border-0 px-4 py-1">
            <Star className="w-4 h-4 mr-1" />
            MAIS POPULAR
          </Badge>
        </motion.div>
      )}
      
      <div className={`
        relative h-full bg-slate-800/50 backdrop-blur-sm rounded-2xl p-8
        border-2 transition-all duration-300
        ${plan.highlighted 
          ? 'border-construction-accent shadow-2xl shadow-construction-accent/20 scale-105' 
          : 'border-gray-700/50 hover:border-gray-600/50'
        }
      `}>
        {/* Glow effect for highlighted plan */}
        {plan.highlighted && (
          <div className="absolute inset-0 bg-gradient-to-r from-construction-accent/20 to-orange-500/20 rounded-2xl blur-xl -z-10" />
        )}
        
        {/* Plan icon and name */}
        <div className="flex items-center gap-4 mb-4">
          <motion.div
            animate={{ scale: isHovered ? 1.1 : 1 }}
            transition={{ duration: 0.3 }}
            className={`p-3 rounded-lg bg-gradient-to-br ${plan.color}`}
          >
            <Icon className="w-6 h-6 text-white" />
          </motion.div>
          <h3 className="text-2xl font-bold text-white">{plan.name}</h3>
        </div>
        
        {/* Description */}
        <p className="text-gray-400 mb-6">{plan.description}</p>
        
        {/* Pricing */}
        <div className="mb-8">
          {plan.originalPrice && (
            <div className="text-gray-500 line-through text-lg">
              R$ {plan.originalPrice.toLocaleString('pt-BR')}/mês
            </div>
          )}
          <div className="flex items-baseline gap-1">
            <span className="text-4xl font-bold text-white">
              R$ {plan.price.toLocaleString('pt-BR')}
            </span>
            <span className="text-gray-400">/mês</span>
          </div>
          {plan.originalPrice && (
            <Badge variant="secondary" className="mt-2">
              Economize {Math.round(((plan.originalPrice - plan.price) / plan.originalPrice) * 100)}%
            </Badge>
          )}
        </div>
        
        {/* Features */}
        <ul className="space-y-3 mb-8">
          {plan.features.map((feature, idx) => (
            <motion.li
              key={idx}
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 + idx * 0.05 }}
              viewport={{ once: true }}
              className="flex items-start gap-3"
            >
              <Check className="w-5 h-5 text-construction-accent mt-0.5 flex-shrink-0" />
              <span className="text-gray-300 text-sm">{feature}</span>
            </motion.li>
          ))}
        </ul>
        
        {/* CTA Button */}
        <Button
          onClick={() => navigate('/register')}
          className={`w-full py-6 text-lg font-semibold transition-all duration-300 ${
            plan.highlighted
              ? 'bg-gradient-to-r from-construction-accent to-orange-500 hover:from-construction-accent/90 hover:to-orange-500/90 text-white shadow-lg hover:shadow-construction-accent/50'
              : 'bg-slate-700 hover:bg-slate-600 text-white'
          }`}
        >
          {plan.highlighted ? 'Começar Agora' : 'Selecionar Plano'}
        </Button>
      </div>
    </motion.div>
  );
};

export const PricingSection = () => {
  const plans = [
    {
      name: "Essencial",
      price: 497,
      description: "Perfeito para pequenas construtoras",
      icon: Zap,
      color: "from-blue-500 to-cyan-600",
      features: [
        "Até 3 obras simultâneas",
        "5 usuários inclusos",
        "Dashboard básico com IA",
        "Previsões de custos",
        "Suporte por email",
        "Relatórios mensais",
        "Integração com 1 sistema"
      ]
    },
    {
      name: "Profissional",
      price: 997,
      originalPrice: 1497,
      description: "Ideal para construtoras em crescimento",
      icon: Building,
      color: "from-construction-accent to-orange-500",
      highlighted: true,
      popular: true,
      features: [
        "Até 10 obras simultâneas",
        "15 usuários inclusos",
        "Dashboard avançado com IA",
        "Previsões em tempo real",
        "Suporte prioritário 24/7",
        "Relatórios personalizados",
        "Integração ilimitada",
        "API de acesso",
        "Treinamento incluído"
      ]
    },
    {
      name: "Enterprise",
      price: 2997,
      description: "Para grandes construtoras",
      icon: Crown,
      color: "from-purple-500 to-pink-600",
      features: [
        "Obras ilimitadas",
        "Usuários ilimitados",
        "IA personalizada",
        "Previsões avançadas",
        "Suporte dedicado",
        "Relatórios white-label",
        "Integração customizada",
        "API completa",
        "Consultoria mensal",
        "SLA garantido"
      ]
    }
  ];
  
  return (
    <section className="py-24 bg-gradient-to-b from-slate-900 to-slate-800 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0">
        <div className="absolute top-40 right-20 w-96 h-96 bg-construction-accent/5 rounded-full blur-3xl" />
        <div className="absolute bottom-40 left-20 w-96 h-96 bg-orange-500/5 rounded-full blur-3xl" />
      </div>
      
      <div className="container mx-auto px-4 relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <Badge className="bg-green-500/20 text-green-400 border-green-500/30 px-4 py-2 mb-4">
            <Zap className="w-4 h-4 mr-2" />
            30 dias de teste grátis • Sem cartão de crédito
          </Badge>
          
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Planos que <span className="text-construction-accent">crescem</span> com você
          </h2>
          
          <p className="text-xl text-gray-400 max-w-3xl mx-auto">
            Escolha o plano ideal para sua construtora. Todos incluem nossa IA revolucionária 
            e podem ser ajustados conforme sua necessidade.
          </p>
        </motion.div>
        
        {/* Pricing cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {plans.map((plan, index) => (
            <PricingCard key={index} plan={plan} index={index} />
          ))}
        </div>
        
        {/* Additional info */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ delay: 0.8, duration: 0.6 }}
          viewport={{ once: true }}
          className="mt-16 text-center"
        >
          <p className="text-gray-400 mb-8">
            Todos os planos incluem: Certificado SSL • Backup diário • Conformidade LGPD • Atualizações automáticas
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button
              variant="outline"
              size="lg"
              className="border-gray-600 text-white hover:bg-white/10"
            >
              Comparar Planos Detalhadamente
            </Button>
            
            <span className="text-gray-500">ou</span>
            
            <Button
              variant="link"
              className="text-construction-accent hover:text-construction-accent/80"
            >
              Falar com Especialista →
            </Button>
          </div>
        </motion.div>
      </div>
    </section>
  );
}; 