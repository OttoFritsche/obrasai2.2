import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/auth";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { LogOut, Bell, Search } from "lucide-react";
import { t } from "@/lib/i18n";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { motion } from "framer-motion";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { formatDateBR } from "@/lib/i18n";

export const DashboardHeader = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  
  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  const getInitials = () => {
    if (!user?.profile) return "U";
    
    const firstName = user.profile.first_name || "";
    const lastName = user.profile.last_name || "";
    
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  return (
    <motion.header 
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="bg-background/80 backdrop-blur-md sticky top-0 z-40"
    >
      <div className="px-6 py-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-4">
            <SidebarTrigger className="hover:bg-accent rounded-lg transition-colors" />
            
            {/* Saudação com gradiente */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1, duration: 0.3 }}
            >
              <h1 className="text-xl font-semibold">
                {t("dashboard.welcome")}, 
                <span className="ml-2 bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent">
                  {user?.profile?.first_name || "Usuário"}
                </span>
              </h1>
            </motion.div>
          </div>
          
          {/* Barra de pesquisa central (opcional) */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2, duration: 0.3 }}
            className="hidden lg:flex flex-1 max-w-md mx-8"
          >
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Pesquisar..."
                className="pl-10 bg-muted/50 border-border/50 focus:bg-background transition-colors"
              />
            </div>
          </motion.div>
          
          {/* Ações do header */}
          <div className="flex items-center gap-3">
            {/* Notificações */}
            <motion.div
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3, duration: 0.3 }}
            >
              <Button
                variant="ghost"
                size="icon"
                className="relative h-9 w-9 rounded-lg hover:bg-accent"
              >
                <Bell className="h-4 w-4" />
                <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-red-500 animate-pulse" />
              </Button>
            </motion.div>
            
            {/* Theme Toggle */}
            <motion.div
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4, duration: 0.3 }}
            >
              <ThemeToggle />
            </motion.div>
            
            {/* Perfil do usuário */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5, duration: 0.3 }}
              className="flex items-center gap-3 ml-2"
            >
              <div className="hidden md:flex flex-col items-end">
                <span className="text-sm font-medium">
                  {user?.profile?.first_name} {user?.profile?.last_name}
                </span>
                <span className="text-xs text-muted-foreground">
                  {user?.email}
                </span>
              </div>
              
              <Avatar className="h-9 w-9 ring-2 ring-primary/20 transition-all hover:ring-primary/40">
                <AvatarFallback className={cn(
                  "bg-gradient-to-br from-blue-500 to-purple-600 text-white font-semibold"
                )}>
                  {getInitials()}
                </AvatarFallback>
              </Avatar>
              
              <Button 
                variant="ghost" 
                size="icon"
                onClick={handleLogout}
                className="h-9 w-9 rounded-lg hover:bg-destructive/10 hover:text-destructive transition-colors"
              >
                <LogOut className="h-4 w-4" />
              </Button>
            </motion.div>
          </div>
        </div>
      </div>
    </motion.header>
  );
};
