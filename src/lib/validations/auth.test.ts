import { describe, expect, it, vi } from "vitest";

import {
    changePasswordSchema,
    forgotPasswordSchema,
    loginSchema,
    passwordSchema,
    registerSchema,
    resetPasswordSchema,
} from "./auth";

// Mock da função de internacionalização (i18n)
vi.mock("@/lib/i18n", () => ({
    t: (key: string) => key, // Retorna a própria chave para simplificar o teste
}));

describe("Auth Validation Schemas", () => {
    // Testes para o loginSchema
    describe("loginSchema", () => {
        it("deve validar um payload de login correto", () => {
            const result = loginSchema.safeParse({
                email: "test@example.com",
                password: "password123",
            });
            expect(result.success).toBe(true);
        });

        it("deve falhar para um e-mail inválido", () => {
            const result = loginSchema.safeParse({
                email: "not-an-email",
                password: "password123",
            });
            expect(result.success).toBe(false);
            if (!result.success) {
                expect(result.error.issues[0].message).toBe(
                    "messages.invalidEmail",
                );
            }
        });

        it("deve falhar se a senha estiver ausente", () => {
            const result = loginSchema.safeParse({
                email: "test@example.com",
                password: "",
            });
            expect(result.success).toBe(false);
            if (!result.success) {
                expect(result.error.issues[0].message).toBe(
                    "messages.requiredField",
                );
            }
        });
    });

    // Testes para o passwordSchema
    describe("passwordSchema", () => {
        it("deve validar uma senha forte", () => {
            const result = passwordSchema.safeParse("StrongP@ss1");
            expect(result.success).toBe(true);
        });

        it("deve falhar para senhas com menos de 8 caracteres", () => {
            const result = passwordSchema.safeParse("Sh0rt@");
            expect(result.success).toBe(false);
        });

        it("deve falhar se faltar uma letra minúscula", () => {
            const result = passwordSchema.safeParse("STRONGP@SS1");
            expect(result.success).toBe(false);
        });

        it("deve falhar se faltar uma letra maiúscula", () => {
            const result = passwordSchema.safeParse("strongp@ss1");
            expect(result.success).toBe(false);
        });

        it("deve falhar se faltar um número", () => {
            const result = passwordSchema.safeParse("StrongP@ss");
            expect(result.success).toBe(false);
        });

        it("deve falhar se faltar um caractere especial", () => {
            const result = passwordSchema.safeParse("StrongPass1");
            expect(result.success).toBe(false);
        });

        it('deve falhar para senhas com sequências comuns como "password"', () => {
            const result = passwordSchema.safeParse("MyP@ssword123");
            expect(result.success).toBe(false);
        });

        it("deve falhar para senhas com 4 caracteres repetidos consecutivos", () => {
            const result = passwordSchema.safeParse("P@ss1111word");
            expect(result.success).toBe(false);
        });
    });

    // Testes para o registerSchema
    describe("registerSchema", () => {
        it("deve validar um payload de registro correto", () => {
            const validPayload = {
                firstName: "Test",
                lastName: "User",
                email: "test@example.com",
                password: "StrongP@ss1",
                confirmPassword: "StrongP@ss1",
            };
            const result = registerSchema.safeParse(validPayload);
            expect(result.success).toBe(true);
        });

        it("deve falhar se as senhas não coincidirem", () => {
            const invalidPayload = {
                firstName: "Test",
                lastName: "User",
                email: "test@example.com",
                password: "StrongP@ss1",
                confirmPassword: "DifferentP@ss1",
            };
            const result = registerSchema.safeParse(invalidPayload);
            expect(result.success).toBe(false);
            if (!result.success) {
                // Verifica se o erro está no campo 'confirmPassword'
                expect(result.error.issues[0].path).toContain(
                    "confirmPassword",
                );
                expect(result.error.issues[0].message).toBe(
                    "messages.passwordMismatch",
                );
            }
        });

        it("deve falhar se um campo obrigatório estiver faltando", () => {
            const invalidPayload = {
                firstName: "", // campo obrigatório vazio
                lastName: "User",
                email: "test@example.com",
                password: "StrongP@ss1",
                confirmPassword: "StrongP@ss1",
            };
            const result = registerSchema.safeParse(invalidPayload);
            expect(result.success).toBe(false);
            if (!result.success) {
                expect(result.error.issues[0].path).toContain("firstName");
                expect(result.error.issues[0].message).toBe(
                    "messages.requiredField",
                );
            }
        });
    });

    // Testes para changePasswordSchema
    describe("changePasswordSchema", () => {
        it("deve validar uma troca de senha correta", () => {
            const result = changePasswordSchema.safeParse({
                currentPassword: "OldP@ssword1",
                newPassword: "NewStrongP@ss1",
                confirmPassword: "NewStrongP@ss1",
            });
            expect(result.success).toBe(true);
        });

        it("deve falhar se a nova senha for igual à atual", () => {
            const result = changePasswordSchema.safeParse({
                currentPassword: "SameP@ssword1",
                newPassword: "SameP@ssword1",
                confirmPassword: "SameP@ssword1",
            });
            expect(result.success).toBe(false);
            if (!result.success) {
                expect(result.error.issues[0].path).toContain("newPassword");
            }
        });
    });

    // Testes para forgotPasswordSchema
    describe("forgotPasswordSchema", () => {
        it("deve validar um e-mail correto", () => {
            const result = forgotPasswordSchema.safeParse({
                email: "test@example.com",
            });
            expect(result.success).toBe(true);
        });

        it("deve falhar para um e-mail inválido", () => {
            const result = forgotPasswordSchema.safeParse({
                email: "not-an-email",
            });
            expect(result.success).toBe(false);
        });
    });

    // Testes para resetPasswordSchema
    describe("resetPasswordSchema", () => {
        it("deve validar uma redefinição de senha correta", () => {
            const result = resetPasswordSchema.safeParse({
                password: "NewStrongP@ss1",
                confirmPassword: "NewStrongP@ss1",
            });
            expect(result.success).toBe(true);
        });

        it("deve falhar se as senhas não coincidirem", () => {
            const result = resetPasswordSchema.safeParse({
                password: "NewStrongP@ss1",
                confirmPassword: "DifferentP@ss1",
            });
            expect(result.success).toBe(false);
        });
    });

    // Testes para a função checkPasswordStrength
    describe("checkPasswordStrength", () => {
        it("deve retornar score baixo para uma senha fraca", () => {
            const { score, isStrong, feedback } = checkPasswordStrength("123");
            expect(score).toBeLessThan(3);
            expect(isStrong).toBe(false);
            expect(feedback).toContain("Use pelo menos 8 caracteres");
        });

        it("deve retornar score médio para uma senha razoável", () => {
            const { score, isStrong } = checkPasswordStrength("Razoavel123");
            expect(score).toBeGreaterThanOrEqual(3);
            expect(score).toBeLessThan(5);
            expect(isStrong).toBe(false);
        });

        it("deve retornar score alto e isStrong true para uma senha forte", () => {
            const { score, isStrong, feedback } = checkPasswordStrength(
                "V3ryStr0ngP@ssw0rd!",
            );
            expect(score).toBeGreaterThanOrEqual(5);
            expect(isStrong).toBe(true);
            expect(feedback.length).toBe(0);
        });
    });
});
