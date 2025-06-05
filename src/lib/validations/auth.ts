import { z } from "zod";
import { t } from "@/lib/i18n";

/**
 * Validação de senha robusta
 * Requisitos:
 * - Mínimo 8 caracteres
 * - Pelo menos 1 letra minúscula
 * - Pelo menos 1 letra maiúscula  
 * - Pelo menos 1 número
 * - Pelo menos 1 símbolo especial
 * - Não pode conter sequências comuns
 */
const passwordSchema = z.string()
  .min(8, "Senha deve ter pelo menos 8 caracteres")
  .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]+$/, {
    message: "Senha deve conter pelo menos: 1 letra minúscula, 1 maiúscula, 1 número e 1 caractere especial"
  })
  .refine((password) => {
    // Verificar sequências fracas
    const weakPatterns = [
      /123456/,
      /abcdef/,
      /qwerty/,
      /password/i,
      /admin/i,
      /user/i,
      /teste/i,
      /senha/i,
    ];
    
    return !weakPatterns.some(pattern => pattern.test(password));
  }, {
    message: "A senha não pode conter sequências comuns (123456, qwerty, password, etc)",
  })
  .refine((password) => {
    // Verificar repetição excessiva de caracteres
    const hasExcessiveRepetition = /(.)\1{3,}/.test(password);
    return !hasExcessiveRepetition;
  }, {
    message: "A senha não pode ter mais de 3 caracteres repetidos consecutivos",
  });

// Schema for registration form validation
export const registerSchema = z.object({
  firstName: z.string().min(1, {
    message: t("messages.requiredField"),
  }),
  lastName: z.string().min(1, {
    message: t("messages.requiredField"),
  }),
  email: z.string().email({
    message: t("messages.invalidEmail"),
  }),
  password: passwordSchema,
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: t("messages.passwordMismatch"),
  path: ["confirmPassword"],
});

// Exportando o tipo para uso nos componentes
export type RegisterFormValues = z.infer<typeof registerSchema>;

// Schema for login form validation
export const loginSchema = z.object({
  email: z.string().email({
    message: t("messages.invalidEmail"),
  }),
  password: z.string().min(1, {
    message: t("messages.requiredField"),
  }),
});

/**
 * Schema para mudança de senha
 */
export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, "A senha atual é obrigatória"),
  newPassword: passwordSchema,
  confirmPassword: z.string(),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "As senhas não conferem",
  path: ["confirmPassword"],
}).refine((data) => data.currentPassword !== data.newPassword, {
  message: "A nova senha deve ser diferente da senha atual",
  path: ["newPassword"],
});

/**
 * Função para verificar força da senha
 */
export const checkPasswordStrength = (password: string): {
  score: number;
  feedback: string[];
  isStrong: boolean;
} => {
  const feedback: string[] = [];
  let score = 0;

  // Comprimento
  if (password.length >= 12) score += 2;
  else if (password.length >= 8) score += 1;
  else feedback.push("Use pelo menos 8 caracteres");

  // Complexidade
  if (/[a-z]/.test(password)) score += 1;
  else feedback.push("Adicione letras minúsculas");

  if (/[A-Z]/.test(password)) score += 1;
  else feedback.push("Adicione letras maiúsculas");

  if (/\d/.test(password)) score += 1;
  else feedback.push("Adicione números");

  if (/[@$!%*?&#^()_+\-=[\]{};':"\\|,.<>/?]/.test(password)) score += 1;
  else feedback.push("Adicione símbolos especiais");

  // Penalidades
  if (/(.)\1{2,}/.test(password)) {
    score -= 1;
    feedback.push("Evite repetir caracteres");
  }

  if (/(123|abc|qwe)/i.test(password)) {
    score -= 1;
    feedback.push("Evite sequências óbvias");
  }

  return {
    score: Math.max(0, Math.min(6, score)),
    feedback,
    isStrong: score >= 5,
  };
};
