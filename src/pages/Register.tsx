import { motion } from "framer-motion";
import { Link } from "react-router-dom";

import registerBg from "@/assets/images/4d142594-a29e-4e94-bd77-48cf91ebcfac.png";
import { GoogleAuthButton } from "@/components/auth/GoogleAuthButton";
import { RegisterForm } from "@/components/auth/RegisterForm";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import Logo from "@/components/ui/Logo";
import { t } from "@/lib/i18n";

const Register = () => {
  return (
    <div className="relative min-h-screen flex items-center justify-center p-4 overflow-hidden">
      {/* Imagem de fundo com overlay */}
      <img
        src={registerBg}
        alt="Background ObrasAI"
        className="absolute inset-0 w-full h-full object-cover z-0"
        style={{ filter: "blur(0px) brightness(0.6)" }}
      />
      <div className="absolute inset-0 bg-black/70 z-10" />
      
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
                Crie sua conta
              </CardTitle>
            </motion.div>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              <CardDescription className="text-gray-600">
                Comece sua jornada de gestão inteligente de obras
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
                  ou registre-se com e-mail
                </span>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
            >
              <RegisterForm />
            </motion.div>
          </CardContent>
          
          <CardFooter className="pt-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7 }}
              className="text-sm text-center text-gray-600 w-full"
            >
              Já tem uma conta?{" "}
              <Link
                to="/login"
                className="text-blue-600 hover:text-blue-700 transition-colors font-medium underline-offset-4 hover:underline"
              >
                Fazer login
              </Link>
            </motion.div>
          </CardFooter>
        </Card>
      </motion.div>
    </div>
  );
};

export default Register;
