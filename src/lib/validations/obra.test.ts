import { describe, expect, it, vi } from "vitest";
import { obraSchema } from "./obra";

// Mock da função de internacionalização (i18n)
vi.mock("@/lib/i18n", () => ({
    t: (key: string) => key,
}));

describe("Obra Validation Schema", () => {
    const getValidPayload = () => ({
        nome: "Residência Unifamiliar",
        endereco: "Rua das Flores, 123",
        cidade: "São Paulo",
        estado: "SP",
        cep: "01234-567",
        orcamento: 500000.00,
        construtora_id: "c4f2c6c0-1b9a-4b1e-8c3a-9e3f2b1c4d5e",
    });

    it("deve validar um payload correto", () => {
        const result = obraSchema.safeParse(getValidPayload());
        expect(result.success).toBe(true);
    });

    describe("Validação e Transformação de CEP", () => {
        it("deve validar um CEP com hífen", () => {
            const payload = { ...getValidPayload(), cep: "98765-432" };
            const result = obraSchema.safeParse(payload);
            expect(result.success).toBe(true);
        });

        it("deve validar e transformar um CEP sem hífen", () => {
            const payload = { ...getValidPayload(), cep: "87654321" };
            const result = obraSchema.safeParse(payload);
            expect(result.success).toBe(true);
            // Verifica se o transform foi aplicado corretamente
            if (result.success) {
                expect(result.data.cep).toBe("87654-321");
            }
        });

        it("deve falhar para um CEP com formato inválido", () => {
            const payload = { ...getValidPayload(), cep: "12345" };
            const result = obraSchema.safeParse(payload);
            expect(result.success).toBe(false);
            if (!result.success) {
                expect(result.error.issues[0].message).toBe(
                    "CEP deve estar no formato 00000-000",
                );
            }
        });
    });

    it("deve usar coerce para o orçamento", () => {
        const payload = { ...getValidPayload(), orcamento: "750000.50" };
        const result = obraSchema.safeParse(payload);
        expect(result.success).toBe(true);
        if (result.success) {
            expect(result.data.orcamento).toBe(750000.50);
        }
    });

    it("deve falhar se o nome estiver ausente", () => {
        const payload = { ...getValidPayload(), nome: "" };
        const result = obraSchema.safeParse(payload);
        expect(result.success).toBe(false);
    });

    it("deve falhar se a construtora_id estiver ausente", () => {
        const payload = { ...getValidPayload(), construtora_id: "" };
        const result = obraSchema.safeParse(payload);
        expect(result.success).toBe(false);
    });
});
