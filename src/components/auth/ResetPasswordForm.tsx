import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/contexts/auth";
import { resetPasswordSchema, ResetPasswordFormValues, checkPasswordStrength } from "@/lib/validations/auth";
import { Loader2, Eye, EyeOff, Lock } from "lucide-react";
import { Progress } from "@/components/ui/progress";

export const ResetPasswordForm = () => {
  const { resetPassword } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const form = useForm<ResetPasswordFormValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  });

  const watchedPassword = form.watch("password");
  const passwordStrength = watchedPassword ? checkPasswordStrength(watchedPassword) : null;

  const onSubmit = async (data: ResetPasswordFormValues) => {
    try {
      setIsLoading(true);
      await resetPassword(data.password);
    } catch (error) {
      console.error("Reset password error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const getPasswordStrengthColor = (score: number) => {
    if (score <= 2) return "bg-red-500";
    if (score <= 4) return "bg-yellow-500";
    return "bg-green-500";
  };

  const getPasswordStrengthText = (score: number) => {
    if (score <= 2) return "Fraca";
    if (score <= 4) return "Média";
    return "Forte";
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="text-center">
        <div className="mx-auto w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4">
          <Lock className="w-6 h-6 text-blue-600" />
        </div>
        <CardTitle className="text-2xl">Redefinir Senha</CardTitle>
        <CardDescription>
          Digite sua nova senha. Ela deve ser forte e segura.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nova Senha</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input
                        placeholder="Digite sua nova senha"
                        type={showPassword ? "text" : "password"}
                        {...field}
                        disabled={isLoading}
                        className="bg-gray-50 border-gray-300 text-gray-800 placeholder:text-gray-400 focus:bg-white focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 pr-10"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </FormControl>
                  <FormMessage className="text-red-600" />
                  
                  {/* Indicador de força da senha */}
                  {passwordStrength && watchedPassword.length > 0 && (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Força da senha:</span>
                        <span className={`font-medium ${
                          passwordStrength.score <= 2 ? 'text-red-600' : 
                          passwordStrength.score <= 4 ? 'text-yellow-600' : 'text-green-600'
                        }`}>
                          {getPasswordStrengthText(passwordStrength.score)}
                        </span>
                      </div>
                      <Progress 
                        value={(passwordStrength.score / 6) * 100} 
                        className="h-2"
                      />
                      {passwordStrength.feedback.length > 0 && (
                        <ul className="text-xs text-gray-600 space-y-1">
                          {passwordStrength.feedback.map((feedback, index) => (
                            <li key={index} className="flex items-center">
                              <span className="w-1 h-1 bg-gray-400 rounded-full mr-2"></span>
                              {feedback}
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  )}
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="confirmPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Confirmar Nova Senha</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input
                        placeholder="Confirme sua nova senha"
                        type={showConfirmPassword ? "text" : "password"}
                        {...field}
                        disabled={isLoading}
                        className="bg-gray-50 border-gray-300 text-gray-800 placeholder:text-gray-400 focus:bg-white focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 pr-10"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </FormControl>
                  <FormMessage className="text-red-600" />
                </FormItem>
              )}
            />

            <Button
              type="submit"
              className="w-full bg-gray-700 border-gray-600 text-white hover:bg-gray-600 hover:border-[#daa916] font-semibold shadow-lg transition-all duration-300 transform hover:scale-[1.02] border-0"
              disabled={isLoading || !passwordStrength?.isStrong}
            >
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Redefinir Senha
            </Button>

            {passwordStrength && !passwordStrength.isStrong && watchedPassword.length > 0 && (
              <p className="text-sm text-red-600 text-center">
                Por favor, escolha uma senha mais forte para continuar
              </p>
            )}
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};