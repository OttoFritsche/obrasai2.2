import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { toast } from "sonner";
import { useAuth } from "@/contexts/auth";
import { t } from "@/lib/i18n";
import { Loader2, Eye, EyeOff } from "lucide-react";
import { GoogleAuthButton } from "@/components/auth/GoogleAuthButton";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import Logo from "@/components/ui/Logo";
import logoImage from "@/assets/logo/ObrasAI_dark.png";
import { supabase } from "@/integrations/supabase/client";
import loginBg from "@/assets/images/4d142594-a29e-4e94-bd77-48cf91ebcfac.png";
// ✅ Comentar temporariamente o painel de debug
// import AuthDebugPanel from "@/components/debug/AuthDebugPanel";

// Esquema de validação do formulário
const loginSchema = z.object({
  email: z.string().email({
    message: t("messages.invalidEmail"),
  }),
  password: z.string().min(6, {
    message: t("messages.passwordTooShort"),
  }),
});

type LoginFormValues = z.infer<typeof loginSchema>;

const Login = () => {
  const { login, user, session, loading } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // ✅ Redirecionar automaticamente quando o usuário estiver autenticado
  useEffect(() => {
    if (session && !loading) { // Condição de redirecionamento ajustada
      navigate("/dashboard", { replace: true });
    }
  }, [session, loading, navigate]); // Dependências ajustadas

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data: LoginFormValues) => {
    try {
      setIsLoading(true);
      const { error } = await login(data.email, data.password);
      
      if (error) {
        const errorMessage = (error instanceof Error) ? error.message : t("auth.loginError");
        toast.error(errorMessage);
        return;
      }
      
      toast.success(t("messages.loginSuccess"));
      // ✅ Redirecionamento será feito pelo useEffect
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : t("messages.generalError");
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center p-4 overflow-hidden">
      {/* Imagem de fundo com overlay */}
      <img
        src={loginBg}
        alt="Background ObrasAI"
        className="absolute inset-0 w-full h-full object-cover z-0"
        style={{ filter: "blur(0px) brightness(0.6)" }}
      />
      <div className="absolute inset-0 bg-black/70 z-10" />
      
      {/* ✅ Restaurar layout original sem debug panel */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        className="relative z-20 w-full max-w-md"
      >
        <Card className="border-gray-200 backdrop-blur-md bg-white shadow-2xl">
          <CardHeader className="space-y-1 text-center pb-8">
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="flex justify-center mb-4"
            >
              <div className="h-16 w-full flex items-center justify-center">
                <Logo variant="horizontal" width={240} height={64} alt="Logo Obras.AI" />
              </div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <CardTitle className="text-3xl font-bold text-gray-800 text-center">
                Bem-vindo
              </CardTitle>
            </motion.div>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              <CardDescription className="text-gray-600">
                Entre com suas credenciais para acessar o sistema
              </CardDescription>
            </motion.div>
          </CardHeader>
          
          <CardContent className="space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <GoogleAuthButton buttonText={t("auth.googleLogin")} />
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="relative"
            >
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white px-2 text-gray-500">
                  ou continue com e-mail
                </span>
              </div>
            </motion.div>

            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.6 }}
                >
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-gray-700 font-medium">E-mail</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="seu@email.com"
                            {...field}
                            disabled={isLoading}
                            className="bg-gray-50 border-gray-300 text-gray-800 placeholder:text-gray-400 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all duration-300"
                          />
                        </FormControl>
                        <FormMessage className="text-red-600" />
                      </FormItem>
                    )}
                  />
                </motion.div>
                
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.7 }}
                >
                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-gray-700 font-medium">Senha</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Input
                              type={showPassword ? "text" : "password"}
                              placeholder="••••••••"
                              {...field}
                              disabled={isLoading}
                              className="bg-gray-50 border-gray-300 text-gray-800 placeholder:text-gray-400 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 pr-10 transition-all duration-300"
                            />
                            <button
                              type="button"
                              onClick={() => setShowPassword(!showPassword)}
                              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                            >
                              {showPassword ? (
                                <EyeOff className="h-4 w-4" />
                              ) : (
                                <Eye className="h-4 w-4" />
                              )}
                            </button>
                          </div>
                        </FormControl>
                        <FormMessage className="text-red-600" />
                      </FormItem>
                    )}
                  />
                </motion.div>
                
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.8 }}
                >
                  <Button
                    type="submit"
                    className="w-full h-11 font-semibold bg-gray-700 border-gray-600 text-white hover:bg-gray-600 hover:border-[#daa916] shadow-lg transition-all duration-300 transform hover:scale-[1.02] border-0"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Entrando...
                      </>
                    ) : (
                      "Entrar no ObrasAI"
                    )}
                  </Button>
                </motion.div>
              </form>
            </Form>
          </CardContent>
          
          <CardFooter className="flex flex-col space-y-3 pt-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.9 }}
              className="text-sm text-center"
            >
              <Link
                to="/forgot-password"
                className="text-blue-600 hover:text-blue-700 transition-colors underline-offset-4 hover:underline"
              >
                Esqueceu sua senha?
              </Link>
            </motion.div>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1 }}
              className="text-sm text-center text-gray-600"
            >
              Não tem uma conta?{" "}
              <Link
                to="/register"
                className="text-blue-600 hover:text-blue-700 transition-colors font-medium underline-offset-4 hover:underline"
              >
                Criar conta
              </Link>
            </motion.div>
          </CardFooter>
        </Card>
      </motion.div>
    </div>
  );
};

export default Login;
