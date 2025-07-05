import { useEffect } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/auth";
import { FormProvider, useAutoFill,useFormField, useValidatedFormContext } from "@/contexts/FormContext";
import { supabase } from "@/integrations/supabase/client";
import { formatCPF, formatPhone } from "@/lib/formatters";
import { profileSchema } from "@/lib/validations";

interface ProfileData {
  firstName: string;
  lastName: string;
  email: string;
  cpf: string;
  telefone: string;
  dataNascimento: string;
}

function ProfileFormContent() {
  const { user } = useAuth();
  const { handleSubmit, isLoading } = useValidatedFormContext<ProfileData>();
  const { fillFields } = useAutoFill<ProfileData>();
  
  const firstNameField = useFormField<ProfileData>('firstName');
  const lastNameField = useFormField<ProfileData>('lastName');
  const emailField = useFormField<ProfileData>('email');
  const cpfField = useFormField<ProfileData>('cpf', formatCPF);
  const telefoneField = useFormField<ProfileData>('telefone', formatPhone);
  const dataNascimentoField = useFormField<ProfileData>('dataNascimento');
  
  // Atualiza o formulário quando o usuário for carregado
  useEffect(() => {
    if (user) {
      fillFields({
        firstName: user.profile?.first_name || "",
        lastName: user.profile?.last_name || "",
        email: user.email || "",
        cpf: user.profile?.cpf || "",
        telefone: user.profile?.telefone || "",
        dataNascimento: user.profile?.data_nascimento || ""
      });
    }
  }, [user, fillFields]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Informações Pessoais</CardTitle>
        <CardDescription>
          Atualize suas informações pessoais e de contato.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="firstName">Nome</Label>
              <Input 
                id="firstName" 
                {...firstNameField}
                onChange={firstNameField.onChange}
              />
              {firstNameField.error && (
                <p className="text-sm text-red-500">{firstNameField.error.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName">Sobrenome</Label>
              <Input 
                id="lastName" 
                {...lastNameField}
                onChange={lastNameField.onChange}
              />
              {lastNameField.error && (
                <p className="text-sm text-red-500">{lastNameField.error.message}</p>
              )}
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input 
              id="email" 
              {...emailField}
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
                placeholder="000.000.000-00"
                {...cpfField}
                onChange={cpfField.onChange}
              />
              {cpfField.error && (
                <p className="text-sm text-red-500">{cpfField.error.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="telefone">Telefone</Label>
              <Input 
                id="telefone" 
                placeholder="(00) 00000-0000"
                {...telefoneField}
                onChange={telefoneField.onChange}
              />
              {telefoneField.error && (
                <p className="text-sm text-red-500">{telefoneField.error.message}</p>
              )}
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="dataNascimento">Data de Nascimento</Label>
            <Input 
              id="dataNascimento" 
              type="date"
              {...dataNascimentoField}
              onChange={dataNascimentoField.onChange}
            />
            {dataNascimentoField.error && (
              <p className="text-sm text-red-500">{dataNascimentoField.error.message}</p>
            )}
          </div>
        </form>
      </CardContent>
      <CardFooter>
        <Button 
          onClick={handleSubmit} 
          disabled={isLoading}
          className="w-full"
        >
          {isLoading ? "Salvando..." : "Salvar Alterações"}
        </Button>
      </CardFooter>
    </Card>
  );
}

export function ProfileForm() {
  const { user } = useAuth();
  
  const handleSaveProfile = async (data: ProfileData) => {
    if (!user?.id) {
      throw new Error('Usuário não autenticado');
    }
    
    const updateData = {
      first_name: data.firstName,
      last_name: data.lastName,
      cpf: data.cpf,
      telefone: data.telefone,
      data_nascimento: data.dataNascimento || null
    };
    
    const { error } = await supabase
      .from('profiles')
      .update(updateData)
      .eq('id', user.id);
    
    if (error) {
      throw error;
    }
  };
  
  const defaultValues: ProfileData = {
    firstName: "",
    lastName: "",
    email: "",
    cpf: "",
    telefone: "",
    dataNascimento: ""
  };
  
  return (
     <FormProvider
       schema={profileSchema}
       defaultValues={defaultValues}
       onSubmit={handleSaveProfile}
       successMessage="Perfil atualizado com sucesso!"
       errorMessage="Erro ao atualizar perfil"
     >
       <ProfileFormContent />
     </FormProvider>
   );
 }
