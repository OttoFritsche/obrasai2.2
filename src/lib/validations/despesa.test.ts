import { describe, expect, it, vi } from "vitest";
import { despesaSchema } from "./despesa";

// Mock da função de internacionalização (i18n)
vi.mock("@/lib/i18n", () => ({
    t: (key: string) => key, // Retorna a própria chave para simplificar o teste
}));

// Mock dos enums do Supabase
vi.mock("@/integrations/supabase/types", () => ({
    Constants: {
        public: {
            Enums: {
                categoria_enum: ["Material", "Mão de Obra"],
                etapa_enum: ["Fundação", "Estrutura"],
            },
        },
    },
}));

describe("Despesa Validation Schema", () => {
    const getValidPayload = () => ({
        obra_id: "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
        descricao: "Compra de cimento",
        data_despesa: new Date(),
        quantidade: 10,
        valor_unitario: 25.50,
    });

    it("deve validar uma despesa mínima e não paga", () => {
        const payload = getValidPayload();
        const result = despesaSchema.safeParse(payload);
        expect(result.success).toBe(true);
    });

    it("deve validar o uso de coerce em quantidade e valor_unitario", () => {
        const payload = {
            ...getValidPayload(),
            quantidade: "50.5", // String que deve ser convertida para número
            valor_unitario: "19.99",
        };
        const result = despesaSchema.safeParse(payload);
        expect(result.success).toBe(true);
        if (result.success) {
            expect(result.data.quantidade).toBe(50.5);
            expect(result.data.valor_unitario).toBe(19.99);
        }
    });

    it("deve falhar se a quantidade for negativa", () => {
        const payload = { ...getValidPayload(), quantidade: -5 };
        const result = despesaSchema.safeParse(payload);
        expect(result.success).toBe(false);
        if (!result.success) {
            expect(result.error.issues[0].message).toBe(
                "messages.positiveNumber",
            );
        }
    });

    it("deve falhar se a descrição for muito curta", () => {
        const payload = { ...getValidPayload(), descricao: "oi" };
        const result = despesaSchema.safeParse(payload);
        expect(result.success).toBe(false);
        if (!result.success) {
            expect(result.error.issues[0].message).toBe(
                "messages.atLeast3Chars",
            );
        }
    });

    describe("Validação Condicional de Pagamento", () => {
        it("deve validar uma despesa paga com data e forma de pagamento", () => {
            const payload = {
                ...getValidPayload(),
                pago: true,
                data_pagamento: new Date(),
                forma_pagamento: "PIX" as const,
            };
            const result = despesaSchema.safeParse(payload);
            expect(result.success).toBe(true);
        });

        it("deve falhar se pago for true mas data_pagamento estiver ausente", () => {
            const payload = {
                ...getValidPayload(),
                pago: true,
                data_pagamento: undefined,
                forma_pagamento: "PIX" as const,
            };
            const result = despesaSchema.safeParse(payload);
            expect(result.success).toBe(false);
            if (!result.success) {
                const hasIssue = result.error.issues.some(
                    (issue) =>
                        issue.path.includes("data_pagamento") &&
                        issue.message === "messages.requiredField",
                );
                expect(hasIssue).toBe(true);
            }
        });

        it("deve falhar se pago for true mas forma_pagamento estiver ausente", () => {
            const payload = {
                ...getValidPayload(),
                pago: true,
                data_pagamento: new Date(),
                forma_pagamento: undefined,
            };
            const result = despesaSchema.safeParse(payload);
            expect(result.success).toBe(false);
            if (!result.success) {
                const hasIssue = result.error.issues.some(
                    (issue) =>
                        issue.path.includes("forma_pagamento") &&
                        issue.message === "messages.requiredField",
                );
                expect(hasIssue).toBe(true);
            }
        });

        it("não deve exigir data e forma de pagamento se pago for false", () => {
            const payload = {
                ...getValidPayload(),
                pago: false,
                data_pagamento: undefined,
                forma_pagamento: undefined,
            };
            const result = despesaSchema.safeParse(payload);
            expect(result.success).toBe(true);
        });
    });
});
