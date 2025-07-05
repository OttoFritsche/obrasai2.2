import { describe, expect, it } from "vitest";
import { construtoraPFSchema, construtoraPJSchema } from "./construtora";

describe("Construtora Validation Schemas", () => {
    // Testes para o schema de Pessoa Jurídica
    describe("construtoraPJSchema", () => {
        const validPayload = {
            documento: "33.041.260/0652-90", // CNPJ Válido
            nome_razao_social: "Construtora Exemplo Ltda",
            email: "contato@exemplo.com",
            cep: "12345-678",
        };

        it("deve validar um payload PJ correto", () => {
            const result = construtoraPJSchema.safeParse(validPayload);
            expect(result.success).toBe(true);
        });

        it("deve falhar para um CNPJ inválido", () => {
            const result = construtoraPJSchema.safeParse({
                ...validPayload,
                documento: "11.111.111/1111-11", // CNPJ Inválido
            });
            expect(result.success).toBe(false);
            if (!result.success) {
                expect(result.error.issues[0].message).toBe("CNPJ inválido");
            }
        });

        it("deve falhar se a razão social estiver ausente", () => {
            const result = construtoraPJSchema.safeParse({
                ...validPayload,
                nome_razao_social: "",
            });
            expect(result.success).toBe(false);
            if (!result.success) {
                expect(result.error.issues[0].message).toBe(
                    "Razão social é obrigatória",
                );
            }
        });

        it("deve falhar para um CEP com formato inválido", () => {
            const result = construtoraPJSchema.safeParse({
                ...validPayload,
                cep: "12345", // CEP inválido
            });
            expect(result.success).toBe(false);
            if (!result.success) {
                expect(result.error.issues[0].message).toBe(
                    "CEP deve ter 8 dígitos",
                );
            }
        });
    });

    // Testes para o schema de Pessoa Física
    describe("construtoraPFSchema", () => {
        const validPayload = {
            cpf: "54546487040", // CPF Válido
            nome: "João da Silva",
            email: "joao@exemplo.com",
            cep: "87654-321",
        };

        it("deve validar um payload PF correto", () => {
            const result = construtoraPFSchema.safeParse(validPayload);
            expect(result.success).toBe(true);
        });

        it("deve falhar para um CPF inválido", () => {
            const result = construtoraPFSchema.safeParse({
                ...validPayload,
                cpf: "111.111.111-11", // CPF Inválido
            });
            expect(result.success).toBe(false);
            if (!result.success) {
                expect(result.error.issues[0].message).toBe("CPF inválido");
            }
        });

        it("deve falhar se o nome estiver ausente", () => {
            const result = construtoraPFSchema.safeParse({
                ...validPayload,
                nome: "",
            });
            expect(result.success).toBe(false);
            if (!result.success) {
                expect(result.error.issues[0].message).toBe(
                    "Nome é obrigatório",
                );
            }
        });
    });
});
