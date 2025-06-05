import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarProvider, SidebarTrigger, useSidebar } from "@/components/ui/sidebar";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { HelpCircle, Settings, Building, Banknote, Users, FileText, Sparkles, LogOut, LayoutDashboard, Sun, Moon, Calculator } from "lucide-react";
import { useAuth } from "@/contexts/auth";
import { toast } from "sonner";
import { t } from "@/lib/i18n";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import Logo from "@/components/ui/Logo";
import { useTheme } from "@/providers/theme-provider";
import obrasAIDark from "@/assets/logo/logo_dark_horizon.png";
import obrasAILight from "@/assets/logo/logo_light_horizon.png";
import logoImageDark from "@/assets/logo/logo_image_dark.png";
import logoImageLight from "@/assets/logo/logo_image_light.png";

type DashboardLayoutProps = {
  children: React.ReactNode;
};

// Configuração dos itens do menu com cores suaves
const menuItems = [
  {
    icon: LayoutDashboard,
    label: "Dashboard",
    path: "/dashboard",
    color: "text-blue-500 dark:text-blue-400",
    bgColor: "bg-blue-500/10 dark:bg-blue-400/10",
    hoverBg: "hover:bg-blue-500/20 dark:hover:bg-blue-400/20"
  },
  {
    icon: Building,
    label: "Obras",
    path: "/dashboard/obras",
    color: "text-purple-500 dark:text-purple-400",
    bgColor: "bg-purple-500/10 dark:bg-purple-400/10",
    hoverBg: "hover:bg-purple-500/20 dark:hover:bg-purple-400/20"
  },
  {
    icon: Banknote,
    label: "Despesas",
    path: "/dashboard/despesas",
    color: "text-green-500 dark:text-green-400",
    bgColor: "bg-green-500/10 dark:bg-green-400/10",
    hoverBg: "hover:bg-green-500/20 dark:hover:bg-green-400/20"
  },
  {
    icon: Calculator,
    label: "Orçamentos IA",
    path: "/dashboard/orcamentos",
    color: "text-cyan-500 dark:text-cyan-400",
    bgColor: "bg-cyan-500/10 dark:bg-cyan-400/10",
    hoverBg: "hover:bg-cyan-500/20 dark:hover:bg-cyan-400/20"
  },
  {
    icon: FileText,
    label: "Notas Fiscais",
    path: "/dashboard/notas",
    color: "text-orange-500 dark:text-orange-400",
    bgColor: "bg-orange-500/10 dark:bg-orange-400/10",
    hoverBg: "hover:bg-orange-500/20 dark:hover:bg-orange-400/20"
  },
  {
    icon: Users,
    label: "Fornecedores",
    path: "/dashboard/fornecedores/pj",
    color: "text-pink-500 dark:text-pink-400",
    bgColor: "bg-pink-500/10 dark:bg-pink-400/10",
    hoverBg: "hover:bg-pink-500/20 dark:hover:bg-pink-400/20"
  },
  {
    icon: Sparkles,
    label: "Chat IA",
    path: "/dashboard/chat",
    color: "text-yellow-500 dark:text-yellow-400",
    bgColor: "bg-yellow-500/10 dark:bg-yellow-400/10",
    hoverBg: "hover:bg-yellow-500/20 dark:hover:bg-yellow-400/20"
  }
];

const DashboardLayout = ({ children }: DashboardLayoutProps) => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);

  const handleSignOut = async () => {
    try {
      setIsLoggingOut(true);
      await logout();
      navigate("/login");
    } catch (error) {
      console.error("Error signing out:", error);
      toast.error(t("messages.error"));
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <SidebarProvider>
      <div className="flex w-full min-h-screen bg-background transition-colors duration-300">
        <Sidebar 
          collapsible="icon"
          className="border-r border-border/50 backdrop-blur-md bg-sidebar-background/95"
        >
          <SidebarHeader className="p-4">
            <SidebarHeaderContent />
          </SidebarHeader>
          
          <SidebarContent className="px-3 py-2">
            <SidebarMenu>
              {menuItems.map((item, index) => {
                const Icon = item.icon;
                const isHovered = hoveredItem === item.path;
                
                return (
                  <motion.div
                    key={item.path}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <SidebarMenuItem>
                      <SidebarMenuButton 
                        tooltip={item.label}
                        className={cn(
                          "w-full justify-start rounded-lg transition-all duration-300",
                          "hover:scale-[1.02] active:scale-[0.98]",
                          item.hoverBg,
                          "group relative overflow-hidden"
                        )}
                        onClick={() => navigate(item.path)}
                        onMouseEnter={() => setHoveredItem(item.path)}
                        onMouseLeave={() => setHoveredItem(null)}
                      >
                        {/* Efeito de brilho ao hover */}
                        <motion.div
                          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent"
                          initial={{ x: "-100%" }}
                          animate={{ x: isHovered ? "100%" : "-100%" }}
                          transition={{ duration: 0.5 }}
                        />
                        
                        <div className={cn(
                          "relative flex items-center gap-3 w-full",
                          "transition-all duration-300"
                        )}>
                          <div className={cn(
                            "h-9 w-9 rounded-lg flex items-center justify-center transition-all duration-300",
                            item.bgColor,
                            isHovered && "shadow-lg scale-110"
                          )}>
                            <Icon className={cn("h-5 w-5", item.color)} />
                          </div>
                          <span className="font-medium text-sidebar-foreground">
                            {item.label}
                          </span>
                        </div>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  </motion.div>
                );
              })}
            </SidebarMenu>
          </SidebarContent>
          
          <SidebarFooter className="p-3">
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton 
                  tooltip="Configurações"
                  className="w-full justify-start rounded-lg hover:bg-accent transition-all duration-300"
                  onClick={() => navigate("/settings")}
                >
                  <div className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-lg bg-gray-500/10 dark:bg-gray-400/10 flex items-center justify-center">
                      <Settings className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                    </div>
                    <span className="font-medium">Configurações</span>
                  </div>
                </SidebarMenuButton>
              </SidebarMenuItem>
              
              <SidebarMenuItem>
                <SidebarMenuButton 
                  tooltip="Sair"
                  className="w-full justify-start rounded-lg hover:bg-destructive/10 transition-all duration-300"
                  onClick={handleSignOut} 
                  disabled={isLoggingOut}
                >
                  <div className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-lg bg-red-500/10 dark:bg-red-400/10 flex items-center justify-center">
                      <LogOut className="h-5 w-5 text-red-500 dark:text-red-400" />
                    </div>
                    <span className="font-medium">{isLoggingOut ? "Saindo..." : "Sair"}</span>
                  </div>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarFooter>
        </Sidebar>
        
        <div className="flex flex-col flex-grow">
          <DashboardHeader />
          <main className="flex-grow p-4 lg:p-6 bg-gradient-to-br from-background via-background to-muted/20 overflow-x-auto">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="h-full w-full min-w-0"
            >
              {children}
            </motion.div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

const SidebarHeaderContent = () => {
  const { state } = useSidebar();
  const { theme } = useTheme();
  const isCollapsed = state === "collapsed";
  
  // Determinar qual logo usar baseado no tema
  const logoSrc = theme === "dark" ? obrasAIDark : obrasAILight;
  const logoImageSrc = theme === "dark" ? logoImageDark : logoImageLight;

  return (
    <motion.div 
      className="flex items-center justify-center gap-3"
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      {/* Logo - responsiva ao colapso */}
      <div className={cn(
        "flex-shrink-0 flex items-center justify-center",
        isCollapsed ? "h-16 w-16" : "h-18 w-full"
      )}>
        {isCollapsed ? (
          <img 
            src={logoImageSrc} 
            alt="ObrasAI Logo" 
            className="h-16 w-16 object-contain"
          />
        ) : (
          <img 
            src={logoSrc} 
            alt="ObrasAI Logo" 
            className="h-10 w-auto object-contain max-w-full"
          />
        )}
      </div>
    </motion.div>
  );
};

export default DashboardLayout;
