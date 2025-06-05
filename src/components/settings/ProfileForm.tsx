import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/auth";
import { toast } from "@/components/ui/use-toast";
import { profileSchema } from "@/lib/validations";
import { formatCPF, formatPhone } from "@/lib/formatters";
import { supabase } from "@/integrations/supabase/client";

interface ProfileData {
  firstName: string;
  lastName: string;
  email: string;
  cpf: string;
  telefone: string;
  dataNascimento: string;
}

export function ProfileForm() {
  const { user } = useAuth();
  
  const [profile, setProfile] = useState<ProfileData>({
    firstName: user?.profile?.first_name || "",
    lastName: user?.profile?.last_name || "",
    email: user?.email || "",
    cpf: user?.profile?.cpf || "",
    telefone: user?.profile?.telefone || "",
    dataNascimento: user?.profile?.data_nascimento || ""
  });
  
  // Atualiza o perfil quando o usuário for carregado ou alterado
  useEffect(() => {
    if (user) {
      setProfile({
        firstName: user.profile?.first_name || "",
        lastName: user.profile?.last_name || "",
        email: user.email || "",
        cpf: user.profile?.cpf || "",
        telefone: user.profile?.telefone || "",
        dataNascimento: user.profile?.data_nascimento || ""
      });
    }
  }, [user]);
  
  const [isUpdating, setIsUpdating] = useState(false);
  
  const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    // Aplicamos formatação para campos específicos
    if (name === "cpf") {
      setProfile((prev) => ({ ...prev, [name]: formatCPF(value) }));
    } else if (name === "telefone") {
      setProfile((prev) => ({ ...prev, [name]: formatPhone(value) }));
    } else {
      setProfile((prev) => ({ ...prev, [name]: value }));
    }
  };
  
  const handleSaveProfile = async () => {
    try {
      if (!user?.id) {
        toast({
          title: "Erro ao atualizar perfil",
          description: "Usuário não autenticado.",
          variant: "destructive",
        });
        return;
      }
      
      // Validamos os dados usando o Zod schema
      const validationResult = profileSchema.safeParse({
        ...profile,
        // Convertemos a string de data para objeto Date se existir
        dataNascimento: profile.dataNascimento ? new Date(profile.dataNascimento) : null
      });
      
      if (!validationResult.success) {
        // Exibe o primeiro erro encontrado
        const errorMessage = validationResult.error.errors[0].message;
        toast({
          title: "Erro de validação",
          description: errorMessage,
          variant: "destructive",
        });
        return;
      }
      
      setIsUpdating(true);
      
      // Preparamos os dados para envio ao Supabase
      const updateData = {
        first_name: profile.firstName,
        last_name: profile.lastName,
        cpf: profile.cpf,
        telefone: profile.telefone,
        data_nascimento: profile.dataNascimento || null
      };
      
      // Atualizamos o perfil no Supabase
      const { error } = await supabase
        .from('profiles')
        .update(updateData)
        .eq('id', user.id);
      
      if (error) {
        throw error;
      }
      
      toast({
        title: "Perfil atualizado",
        description: "Suas informações foram salvas com sucesso.",
      });
    } catch (error) {
      console.error("Erro ao atualizar perfil:", error);
      toast({
        title: "Erro ao atualizar perfil",
        description: "Ocorreu um erro ao tentar salvar suas informações.",
        variant: "destructive",
      });
    } finally {
      setIsUpdating(false);
    }
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Informações Pessoais</CardTitle>
        <CardDescription>
          Atualize suas informações pessoais e de contato.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="firstName">Nome</Label>
            <Input 
              id="firstName" 
              name="firstName"
              value={profile.firstName} 
              onChange={handleProfileChange}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="lastName">Sobrenome</Label>
            <Input 
              id="lastName" 
              name="lastName"
              value={profile.lastName} 
              onChange={handleProfileChange}
            />
          </div>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input 
            id="email" 
            name="email"
            value={profile.email} 
            disabled 
          />
          <p className="text-sm text-muted-foreground">
            O email não pode ser alterado.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="cpf">CPF</Label>
            <Input 
              id="cpf" 
              name="cpf"
              placeholder="000.000.000-00"
              value={profile.cpf || ""} 
              onChange={handleProfileChange}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="telefone">Telefone</Label>
            <Input 
              id="telefone" 
              name="telefone"
              placeholder="(00) 00000-0000"
              value={profile.telefone || ""} 
              onChange={handleProfileChange}
            />
          </div>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="dataNascimento">Data de Nascimento</Label>
          <Input 
            id="dataNascimento" 
            name="dataNascimento"
            type="date"
            value={profile.dataNascimento || ""} 
            onChange={handleProfileChange}
          />
        </div>
      </CardContent>
      <CardFooter>
        <Button 
          onClick={handleSaveProfile} 
          disabled={isUpdating}
        >
          {isUpdating ? "Salvando..." : "Salvar Alterações"}
        </Button>
      </CardFooter>
    </Card>
  );
}
