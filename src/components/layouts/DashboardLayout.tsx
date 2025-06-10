import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarProvider, SidebarTrigger, useSidebar } from "@/components/ui/sidebar";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { HelpCircle, Settings, Building, Banknote, Users, FileText, Sparkles, LogOut, LayoutDashboard, Sun, Moon, Calculator, Building2, FileSignature, BarChart3, AlertTriangle, Bell } from "lucide-react";
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

// Configuração dos itens do menu com cores profissionais da construção civil
const menuItems = [
  {
    icon: LayoutDashboard,
    label: "Dashboard",
    path: "/dashboard",
    color: "text-slate-600 dark:text-slate-400",
    bgColor: "bg-slate-600/10 dark:bg-slate-400/10",
    hoverBg: "hover:bg-slate-600/20 dark:hover:bg-slate-400/20"
  },
  {
    icon: Building2,
    label: "Construtoras",
    path: "/dashboard/construtoras",
    color: "text-blue-700 dark:text-blue-300",
    bgColor: "bg-blue-700/10 dark:bg-blue-300/10",
    hoverBg: "hover:bg-blue-700/20 dark:hover:bg-blue-300/20"
  },
  {
    icon: Users,
    label: "Fornecedores",
    path: "/dashboard/fornecedores/pj",
    color: "text-teal-600 dark:text-teal-400",
    bgColor: "bg-teal-600/10 dark:bg-teal-400/10",
    hoverBg: "hover:bg-teal-600/20 dark:hover:bg-teal-400/20"
  },
  {
    icon: Building,
    label: "Obras",
    path: "/dashboard/obras",
    color: "text-blue-600 dark:text-blue-400",
    bgColor: "bg-blue-600/10 dark:bg-blue-400/10",
    hoverBg: "hover:bg-blue-600/20 dark:hover:bg-blue-400/20"
  },
  {
    icon: Calculator,
    label: "Orçamentos IA",
    path: "/dashboard/orcamentos",
    color: "text-emerald-600 dark:text-emerald-400",
    bgColor: "bg-emerald-600/10 dark:bg-emerald-400/10",
    hoverBg: "hover:bg-emerald-600/20 dark:hover:bg-emerald-400/20"
  },
  {
    icon: Banknote,
    label: "Despesas",
    path: "/dashboard/despesas",
    color: "text-orange-600 dark:text-orange-400",
    bgColor: "bg-orange-600/10 dark:bg-orange-400/10",
    hoverBg: "hover:bg-orange-600/20 dark:hover:bg-orange-400/20"
  },
  {
    icon: FileText,
    label: "Notas Fiscais",
    path: "/dashboard/notas",
    color: "text-indigo-600 dark:text-indigo-400",
    bgColor: "bg-indigo-600/10 dark:bg-indigo-400/10",
    hoverBg: "hover:bg-indigo-600/20 dark:hover:bg-indigo-400/20"
  },
  {
    icon: FileSignature,
    label: "Contratos",
    path: "/dashboard/contratos",
    color: "text-amber-600 dark:text-amber-400",
    bgColor: "bg-amber-600/10 dark:bg-amber-400/10",
    hoverBg: "hover:bg-amber-600/20 dark:hover:bg-amber-400/20"
  },
  {
    icon: Building2,
    label: "Plantas IA",
    path: "/dashboard/plantas",
    color: "text-cyan-600 dark:text-cyan-400",
    bgColor: "bg-cyan-600/10 dark:bg-cyan-400/10",
    hoverBg: "hover:bg-cyan-600/20 dark:hover:bg-cyan-400/20"
  },
  {
    icon: Sparkles,
    label: "Chat IA",
    path: "/dashboard/chat",
    color: "text-purple-600 dark:text-purple-400",
    bgColor: "bg-purple-600/10 dark:bg-purple-400/10",
    hoverBg: "hover:bg-purple-600/20 dark:hover:bg-purple-400/20"
  },
  {
    icon: BarChart3,
    label: "Análise Integrada",
    path: "/dashboard/analise",
    color: "text-rose-600 dark:text-rose-400",
    bgColor: "bg-rose-600/10 dark:bg-rose-400/10",
    hoverBg: "hover:bg-rose-600/20 dark:hover:bg-rose-400/20"
  },
  {
    icon: AlertTriangle,
    label: "Alertas de Desvio",
    path: "/dashboard/alertas",
    color: "text-red-600 dark:text-red-400",
    bgColor: "bg-red-600/10 dark:bg-red-400/10",
    hoverBg: "hover:bg-red-600/20 dark:hover:bg-red-400/20"
  },
  {
    icon: Bell,
    label: "Alertas Avançados",
    path: "/dashboard/alertas-avancados",
    color: "text-violet-600 dark:text-violet-400",
    bgColor: "bg-violet-600/10 dark:bg-violet-400/10",
    hoverBg: "hover:bg-violet-600/20 dark:hover:bg-violet-400/20"
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
