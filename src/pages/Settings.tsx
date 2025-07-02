import { Tabs, TabsContent } from "@/components/ui/tabs";
import { useState } from "react";
import DashboardLayout from "@/components/layouts/DashboardLayout";
import { ProfileForm } from "@/components/settings/ProfileForm";
import { AccountForm } from "@/components/settings/AccountForm";
import { motion } from "framer-motion";
import { 
  Settings as SettingsIcon, 
  User, 
  Shield, 
  Bell, 
  Palette,
  Globe,
  Smartphone,
  Key
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

const Settings = () => {
  const [activeTab, setActiveTab] = useState("profile");
  
  const tabs = [
    { id: "profile", label: "Perfil", icon: User, color: "text-blue-600" },
    { id: "account", label: "Conta", icon: Shield, color: "text-green-600" },
    { id: "notifications", label: "Notificações", icon: Bell, color: "text-yellow-600" },
    { id: "appearance", label: "Aparência", icon: Palette, color: "text-[#182b4d]" },
    { id: "language", label: "Idioma", icon: Globe, color: "text-[#daa916]" },
    { id: "devices", label: "Dispositivos", icon: Smartphone, color: "text-blue-500" },
    { id: "security", label: "Segurança", icon: Key, color: "text-red-600" },
  ];
  
  return (
    <DashboardLayout>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="space-y-6"
      >
        {/* Header */}
        <div className="flex items-center gap-3">
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ 
              type: "spring",
              stiffness: 260,
              damping: 20
            }}
            className="h-10 w-10 rounded-lg bg-gradient-to-br from-gray-500 to-gray-600 flex items-center justify-center shadow-lg"
          >
            <SettingsIcon className="h-6 w-6 text-white" />
          </motion.div>
          <div>
            <h2 className="text-2xl font-bold">Configurações</h2>
            <p className="text-muted-foreground">Gerencie suas preferências e informações da conta.</p>
          </div>
        </div>
        
        <div className="grid grid-cols-12 gap-6">
          {/* Sidebar de navegação */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="col-span-12 lg:col-span-3"
          >
            <Card className="border-border/50 bg-card/50 backdrop-blur-sm sticky top-6">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Menu de Configurações
                </CardTitle>
              </CardHeader>
              <CardContent className="p-2">
                <nav className="space-y-1">
                  {tabs.map((tab, index) => {
                    const Icon = tab.icon;
                    const isActive = activeTab === tab.id;
                    
                    return (
                      <motion.button
                        key={tab.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.1 + index * 0.05 }}
                        onClick={() => setActiveTab(tab.id)}
                        className={cn(
                          "w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200",
                          "hover:bg-accent/50",
                          isActive && "bg-accent shadow-sm"
                        )}
                      >
                        <div className={cn(
                          "h-8 w-8 rounded-lg flex items-center justify-center transition-all duration-300",
                          isActive ? "bg-background shadow-sm" : "bg-muted/50",
                          isActive && "scale-110"
                        )}>
                          <Icon className={cn("h-4 w-4", tab.color)} />
                        </div>
                        <span className={cn(
                          "transition-colors",
                          isActive ? "text-foreground" : "text-muted-foreground"
                        )}>
                          {tab.label}
                        </span>
                        {isActive && (
                          <motion.div
                            layoutId="activeTab"
                            className="ml-auto h-2 w-2 rounded-full bg-primary"
                            transition={{ type: "spring", duration: 0.5 }}
                          />
                        )}
                      </motion.button>
                    );
                  })}
                </nav>
              </CardContent>
            </Card>
          </motion.div>
          
          {/* Conteúdo principal */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="col-span-12 lg:col-span-9"
          >
            <Card className="border-border/50 bg-card/95 backdrop-blur-sm">
              <CardContent className="p-6">
                <Tabs value={activeTab} className="w-full">
                  <TabsContent value="profile" className="space-y-6 mt-0">
                    <div className="space-y-2">
                      <h3 className="text-lg font-semibold">Informações do Perfil</h3>
                      <p className="text-sm text-muted-foreground">
                        Atualize suas informações pessoais e profissionais.
                      </p>
                    </div>
                    <ProfileForm />
                  </TabsContent>
                  
                  <TabsContent value="account" className="space-y-6 mt-0">
                    <div className="space-y-2">
                      <h3 className="text-lg font-semibold">Configurações da Conta</h3>
                      <p className="text-sm text-muted-foreground">
                        Gerencie suas configurações de conta e privacidade.
                      </p>
                    </div>
                    <AccountForm />
                  </TabsContent>
                  
                  <TabsContent value="notifications" className="space-y-6 mt-0">
                    <div className="space-y-2">
                      <h3 className="text-lg font-semibold">Preferências de Notificação</h3>
                      <p className="text-sm text-muted-foreground">
                        Configure como e quando você deseja receber notificações.
                      </p>
                    </div>
                    <div className="rounded-lg border border-dashed border-border/50 p-8 text-center">
                      <Bell className="h-12 w-12 mx-auto text-muted-foreground/30 mb-3" />
                      <p className="text-muted-foreground">
                        Configurações de notificação em breve...
                      </p>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="appearance" className="space-y-6 mt-0">
                    <div className="space-y-2">
                      <h3 className="text-lg font-semibold">Aparência</h3>
                      <p className="text-sm text-muted-foreground">
                        Personalize a aparência do sistema.
                      </p>
                    </div>
                    <div className="rounded-lg border border-dashed border-border/50 p-8 text-center">
                      <Palette className="h-12 w-12 mx-auto text-muted-foreground/30 mb-3" />
                      <p className="text-muted-foreground">
                        Opções de personalização em breve...
                      </p>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="language" className="space-y-6 mt-0">
                    <div className="space-y-2">
                      <h3 className="text-lg font-semibold">Idioma e Região</h3>
                      <p className="text-sm text-muted-foreground">
                        Configure seu idioma e preferências regionais.
                      </p>
                    </div>
                    <div className="rounded-lg border border-dashed border-border/50 p-8 text-center">
                      <Globe className="h-12 w-12 mx-auto text-muted-foreground/30 mb-3" />
                      <p className="text-muted-foreground">
                        Configurações de idioma em breve...
                      </p>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="devices" className="space-y-6 mt-0">
                    <div className="space-y-2">
                      <h3 className="text-lg font-semibold">Dispositivos Conectados</h3>
                      <p className="text-sm text-muted-foreground">
                        Gerencie os dispositivos conectados à sua conta.
                      </p>
                    </div>
                    <div className="rounded-lg border border-dashed border-border/50 p-8 text-center">
                      <Smartphone className="h-12 w-12 mx-auto text-muted-foreground/30 mb-3" />
                      <p className="text-muted-foreground">
                        Gerenciamento de dispositivos em breve...
                      </p>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="security" className="space-y-6 mt-0">
                    <div className="space-y-2">
                      <h3 className="text-lg font-semibold">Segurança</h3>
                      <p className="text-sm text-muted-foreground">
                        Configure opções de segurança e privacidade.
                      </p>
                    </div>
                    <div className="rounded-lg border border-dashed border-border/50 p-8 text-center">
                      <Key className="h-12 w-12 mx-auto text-muted-foreground/30 mb-3" />
                      <p className="text-muted-foreground">
                        Configurações de segurança em breve...
                      </p>
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </motion.div>
    </DashboardLayout>
  );
};

export default Settings;
