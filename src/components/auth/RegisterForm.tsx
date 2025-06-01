import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { t } from "@/lib/i18n";
import { Loader2 } from "lucide-react";
import { registerSchema } from "@/lib/validations/auth";

type RegisterFormValues = z.infer<typeof registerSchema>;

export const RegisterForm = () => {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

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
      
      toast.success(t("messages.registerSuccess"));
      navigate("/dashboard");
    } catch (error: any) {
      toast.error(error.message || t("messages.generalError"));
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
                <FormLabel className="text-gray-300">{t("auth.firstName")}</FormLabel>
                <FormControl>
                  <Input
                    placeholder={t("auth.enterFirstName")}
                    {...field}
                    disabled={isLoading}
                    className="bg-gray-700 border-gray-600 text-white placeholder:text-gray-400 focus:border-[#daa916] focus:ring-[#daa916]"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="lastName"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-gray-300">{t("auth.lastName")}</FormLabel>
                <FormControl>
                  <Input
                    placeholder={t("auth.enterLastName")}
                    {...field}
                    disabled={isLoading}
                    className="bg-gray-700 border-gray-600 text-white placeholder:text-gray-400 focus:border-[#daa916] focus:ring-[#daa916]"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-gray-300">{t("auth.email")}</FormLabel>
              <FormControl>
                <Input
                  placeholder={t("auth.enterEmail")}
                  {...field}
                  disabled={isLoading}
                  className="bg-gray-700 border-gray-600 text-white placeholder:text-gray-400 focus:border-[#daa916] focus:ring-[#daa916]"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-gray-300">{t("auth.password")}</FormLabel>
              <FormControl>
                <Input
                  type="password"
                  placeholder={t("auth.enterPassword")}
                  {...field}
                  disabled={isLoading}
                  className="bg-gray-700 border-gray-600 text-white placeholder:text-gray-400 focus:border-[#daa916] focus:ring-[#daa916]"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="confirmPassword"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-gray-300">{t("auth.confirmPassword")}</FormLabel>
              <FormControl>
                <Input
                  type="password"
                  placeholder={t("auth.confirmPassword")}
                  {...field}
                  disabled={isLoading}
                  className="bg-gray-700 border-gray-600 text-white placeholder:text-gray-400 focus:border-[#daa916] focus:ring-[#daa916]"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button
          type="submit"
          className="w-full bg-[#daa916] hover:bg-[#daa916]/90 text-[#182b4d] font-semibold"
          disabled={isLoading}
        >
          {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {t("auth.createAccountPrefix")}{t("auth.createAccountBrand")}
        </Button>
      </form>
    </Form>
  );
};
