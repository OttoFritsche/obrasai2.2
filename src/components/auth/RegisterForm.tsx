import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { toast } from "sonner";
import { useAuth } from "@/contexts/auth";
import { t } from "@/lib/i18n";
import { Loader2 } from "lucide-react";
import { registerSchema, RegisterFormValues } from "@/lib/validations/auth";
import { motion } from "framer-motion";
import { useAnalytics } from "@/services/analyticsApi";

export const RegisterForm = () => {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const { trackConversion } = useAnalytics();

  const form = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  const onSubmit = async (data: RegisterFormValues) => {
    try {
      setIsLoading(true);
      const { error } = await register(
        data.email, 
        data.password, 
        data.firstName, 
        data.lastName
      );
      
      if (error) {
        toast.error(error.message || t("auth.registerError"));
        return;
      }
      
      // 📊 Track conversão de signup
      await trackConversion('signup', {
        user_email: data.email,
        user_name: `${data.firstName} ${data.lastName}`,
        referrer: document.referrer,
        user_agent: navigator.userAgent,
        registration_method: 'email'
      });
      
      toast.success("Cadastro realizado com sucesso! Verifique seu email para confirmar sua conta.");
      
      navigate("/login");
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : t("messages.generalError");
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="firstName"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-gray-700 font-medium">{t("auth.firstName")}</FormLabel>
                <FormControl>
                  <Input
                    placeholder={t("auth.enterFirstName")}
                    {...field}
                    disabled={isLoading}
                    className="bg-gray-50 border-gray-300 text-gray-800 placeholder:text-gray-400 focus:bg-white focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20"
                  />
                </FormControl>
                <FormMessage className="text-red-600" />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="lastName"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-gray-700 font-medium">{t("auth.lastName")}</FormLabel>
                <FormControl>
                  <Input
                    placeholder={t("auth.enterLastName")}
                    {...field}
                    disabled={isLoading}
                    className="bg-gray-50 border-gray-300 text-gray-800 placeholder:text-gray-400 focus:bg-white focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20"
                  />
                </FormControl>
                <FormMessage className="text-red-600" />
              </FormItem>
            )}
          />
        </div>
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-gray-700 font-medium">{t("auth.email")}</FormLabel>
              <FormControl>
                <Input
                  placeholder={t("auth.enterEmail")}
                  {...field}
                  disabled={isLoading}
                  className="bg-gray-50 border-gray-300 text-gray-800 placeholder:text-gray-400 focus:bg-white focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20"
                />
              </FormControl>
              <FormMessage className="text-red-600" />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-gray-700 font-medium">{t("auth.password")}</FormLabel>
              <FormControl>
                <Input
                  type="password"
                  placeholder={t("auth.enterPassword")}
                  {...field}
                  disabled={isLoading}
                  className="bg-gray-50 border-gray-300 text-gray-800 placeholder:text-gray-400 focus:bg-white focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20"
                />
              </FormControl>
              <FormMessage className="text-red-600" />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="confirmPassword"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-gray-700 font-medium">{t("auth.confirmPassword")}</FormLabel>
              <FormControl>
                <Input
                  type="password"
                  placeholder={t("auth.confirmPassword")}
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
          {t("auth.createAccountPrefix")}{t("auth.createAccountBrand")}
        </Button>
      </form>
    </Form>
  );
};
