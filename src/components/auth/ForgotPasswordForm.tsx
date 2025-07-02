import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/contexts/auth";
import type { ForgotPasswordFormValues } from "@/lib/validations/auth";
import { forgotPasswordSchema } from "@/lib/validations/auth";
import { Loader2, ArrowLeft, Mail } from "lucide-react";
import { Link } from "react-router-dom";

export const ForgotPasswordForm = () => {
  const { forgotPassword } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  const form = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: "",
    },
  });

  const onSubmit = async (data: ForgotPasswordFormValues) => {
    try {
      setIsLoading(true);
      const { error } = await forgotPassword(data.email);
      
      if (!error) {
        setEmailSent(true);
      }
    } catch (error) {
      console.error("Forgot password error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (emailSent) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader className="text-center">
          <div className="mx-auto w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-4">
            <Mail className="w-6 h-6 text-green-600" />
          </div>
          <CardTitle className="text-2xl">Email Enviado!</CardTitle>
          <CardDescription>
            Enviamos um link de redefinição de senha para o seu email.
            Verifique sua caixa de entrada e spam.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground text-center">
              Não recebeu o email? Verifique sua caixa de spam ou tente novamente em alguns minutos.
            </p>
            <Link to="/login">
              <Button variant="outline" className="w-full">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Voltar para login
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl">Esqueci minha senha</CardTitle>
        <CardDescription>
          Digite seu email para receber um link de redefinição de senha
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="seu.email@exemplo.com"
                      type="email"
                      {...field}
                      disabled={isLoading}
                      className="bg-gray-50 border-gray-300 text-gray-800 placeholder:text-gray-400 focus:bg-white focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20"
                    />
                  </FormControl>
                  <FormMessage className="text-red-600" />
                </FormItem>
              )}
            />

            <Button
              type="submit"
              className="w-full bg-gray-700 border-gray-600 text-white hover:bg-gray-600 hover:border-[#daa916] font-semibold shadow-lg transition-all duration-300 transform hover:scale-[1.02] border-0"
              disabled={isLoading}
            >
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Enviar link de redefinição
            </Button>

            <div className="text-center">
              <Link 
                to="/login" 
                className="text-sm text-gray-600 hover:text-gray-800 inline-flex items-center"
              >
                <ArrowLeft className="w-4 h-4 mr-1" />
                Voltar para login
              </Link>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};