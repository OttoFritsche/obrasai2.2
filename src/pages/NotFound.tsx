import { motion } from "framer-motion";
import { AlertTriangle,ArrowLeft, Construction, Home } from "lucide-react";
import { useNavigate } from "react-router-dom";

import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { cn } from "@/lib/utils";

const NotFound = () => {
  const navigate = useNavigate();
  
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-background via-background to-muted/20 px-4">
      {/* Theme Toggle */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="absolute top-6 right-6"
      >
        <ThemeToggle />
      </motion.div>

      {/* Elementos decorativos */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          animate={{
            x: [0, 100, 0],
            y: [0, -50, 0],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "linear"
          }}
          className="absolute top-20 left-10 h-64 w-64 rounded-full bg-[#daa916]/10 blur-3xl"
        />
        <motion.div
          animate={{
            x: [0, -100, 0],
            y: [0, 50, 0],
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: "linear"
          }}
          className="absolute bottom-20 right-10 h-64 w-64 rounded-full bg-[#182b4d]/10 blur-3xl"
        />
      </div>

      <div className="text-center relative z-10 max-w-2xl">
        {/* Ícone animado */}
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ 
            type: "spring",
            stiffness: 260,
            damping: 20
          }}
          className="flex justify-center mb-8"
        >
          <div className="relative">
            <div className="h-32 w-32 rounded-3xl bg-gradient-to-br from-[#daa916] to-red-600 flex items-center justify-center shadow-2xl">
              <Construction className="h-16 w-16 text-white" />
            </div>
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
              className="absolute -inset-4 rounded-3xl border-4 border-dashed border-[#daa916]/30"
            />
          </div>
        </motion.div>

        {/* Número 404 com efeito */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="relative mb-6"
        >
          <h1 className="text-9xl font-bold bg-gradient-to-r from-[#daa916] to-red-600 bg-clip-text text-transparent">
            404
          </h1>
          <motion.div
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="absolute inset-0 flex items-center justify-center"
          >
            <AlertTriangle className="h-20 w-20 text-[#daa916]/20" />
          </motion.div>
        </motion.div>

        {/* Mensagens */}
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-3xl font-bold mb-4"
        >
          Ops! Esta página está em construção
        </motion.h2>
        
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="text-lg text-muted-foreground mb-8 max-w-md mx-auto"
        >
          Parece que você encontrou uma área que ainda não foi construída. 
          Nossos engenheiros digitais estão trabalhando nisso!
        </motion.p>

        {/* Botões de ação */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="flex flex-col sm:flex-row gap-4 justify-center"
        >
          <Button 
            onClick={() => navigate(-1)} 
            variant="outline"
            className={cn(
              "group relative overflow-hidden",
              "hover:border-[#daa916]/50"
            )}
          >
            <span className="relative z-10 flex items-center">
              <ArrowLeft className="mr-2 h-4 w-4 transition-transform group-hover:-translate-x-1" />
              Voltar
            </span>
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-[#daa916]/10 to-red-600/10"
              initial={{ x: "-100%" }}
              whileHover={{ x: 0 }}
              transition={{ duration: 0.3 }}
            />
          </Button>
          
          <Button 
            onClick={() => navigate("/")}
            className={cn(
              "group relative overflow-hidden",
                          "bg-gradient-to-r from-[#daa916] to-red-600",
            "hover:from-[#daa916]/90 hover:to-red-700",
              "text-white shadow-lg",
              "transition-all duration-300 transform hover:scale-[1.02]"
            )}
          >
            <span className="relative z-10 flex items-center">
              <Home className="mr-2 h-4 w-4" />
              Ir para Home
            </span>
          </Button>
        </motion.div>

        {/* Sugestões adicionais */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="mt-12 text-sm text-muted-foreground"
        >
          <p className="mb-2">Você pode tentar:</p>
          <div className="flex flex-wrap gap-2 justify-center">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate("/dashboard")}
              className="text-xs hover:text-primary"
            >
              Dashboard
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate("/dashboard/obras")}
              className="text-xs hover:text-primary"
            >
              Obras
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate("/settings")}
              className="text-xs hover:text-primary"
            >
              Configurações
            </Button>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default NotFound;
