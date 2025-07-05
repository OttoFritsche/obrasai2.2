import { describe, expect, it } from "vitest";
import { fornecedorPFSchema, fornecedorPJSchema } from "./fornecedor";

describe("Fornecedor Validation Schemas", () => {
    describe("fornecedorPJSchema", () => {
        const getValidPJPayload = () => ({
            cnpj: "33.041.260/0652-90", // CNPJ Válido
            razao_social: "Fornecedor Exemplo S/A",
            email: "compras@fornecedor.com",
            website: "https://fornecedor.com",
            cep: "98765-432",
        });

        it("deve validar um payload PJ correto", () => {
            const result = fornecedorPJSchema.safeParse(getValidPJPayload());
            expect(result.success).toBe(true);
        });

        it("deve falhar para um CNPJ inválido", () => {
            const result = fornecedorPJSchema.safeParse({
                ...getValidPJPayload(),
                cnpj: "00.000.000/0000-00",
            });
            expect(result.success).toBe(false);
            if (!result.success) {
                expect(result.error.issues[0].message).toBe("CNPJ inválido");
            }
        });

        it("deve falhar se a razão social estiver ausente", () => {
            const result = fornecedorPJSchema.safeParse({
                ...getValidPJPayload(),
                razao_social: "",
            });
            expect(result.success).toBe(false);
            if (!result.success) {
                expect(result.error.issues[0].message).toBe(
                    "Razão social é obrigatória",
                );
            }
        });

        it("deve falhar para uma URL de website inválida", () => {
            const result = fornecedorPJSchema.safeParse({
                ...getValidPJPayload(),
                website: "um-site-invalido",
            });
            expect(result.success).toBe(false);
            if (!result.success) {
                expect(result.error.issues[0].message).toBe(
                    "Website deve ser uma URL válida",
                );
            }
        });
    });

    describe("fornecedorPFSchema", () => {
        const getValidPFPayload = () => ({
            cpf: "54546487040", // CPF Válido
            nome: "Maria da Silva",
            email: "maria@email.com",
            cep: "12345-876",
        });

        it("deve validar um payload PF correto", () => {
            const result = fornecedorPFSchema.safeParse(getValidPFPayload());
            expect(result.success).toBe(true);
        });

        it("deve falhar para um CPF inválido", () => {
            const result = fornecedorPFSchema.safeParse({
                ...getValidPFPayload(),
                cpf: "123.456.789-00",
            });
            expect(result.success).toBe(false);
            if (!result.success) {
                expect(result.error.issues[0].message).toBe("CPF inválido");
            }
        });

        it("deve falhar se o nome estiver ausente", () => {
            const result = fornecedorPFSchema.safeParse({
                ...getValidPFPayload(),
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
