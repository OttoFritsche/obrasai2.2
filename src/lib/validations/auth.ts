
import { z } from "zod";
import { t } from "@/lib/i18n";

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
  password: z.string().min(6, {
    message: t("messages.passwordTooShort"),
  }),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: t("messages.passwordMismatch"),
  path: ["confirmPassword"],
});

// Schema for login form validation
export const loginSchema = z.object({
  email: z.string().email({
    message: t("messages.invalidEmail"),
  }),
  password: z.string().min(1, {
    message: t("messages.requiredField"),
  }),
});
