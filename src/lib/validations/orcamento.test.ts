import { describe, expect, it } from "vitest";
import {
    AreaSchema,
    CepSchema,
    OrcamentoParametricoInputSchema,
    ValorMonetarioSchema,
    WizardCompletoSchema,
    WizardEtapa1Schema,
    WizardEtapa2Schema,
    WizardEtapa3Schema,
} from "./orcamento";

describe("Orçamento Paramétrico - Validation Schemas", () => {
    // ====================================
    // 🎯 Testes para Schemas Base
    // ====================================
    describe("Schemas Base", () => {
        describe("ValorMonetarioSchema", () => {
            it("deve validar e formatar um número", () => {
                const result = ValorMonetarioSchema.safeParse(123.456);
                expect(result.success).toBe(true);
                if (result.success) {
                    expect(result.data).toBe(123.46); // Deve arredondar para 2 casas
                }
            });
            it("deve falhar para um número negativo", () => {
                const result = ValorMonetarioSchema.safeParse(-100);
                expect(result.success).toBe(false);
            });
        });

        describe("AreaSchema", () => {
            it("deve validar e transformar uma string de área", () => {
                const result = AreaSchema.safeParse("150.7");
                expect(result.success).toBe(true);
                if (result.success) {
                    expect(result.data).toBe(150.7);
                }
            });
            it("deve falhar para uma área muito grande", () => {
                const result = AreaSchema.safeParse(1000000);
                expect(result.success).toBe(false);
            });
        });

        describe("CepSchema", () => {
            it("deve validar e transformar um CEP com hífen", () => {
                const result = CepSchema.safeParse("12345-678");
                expect(result.success).toBe(true);
                if (result.success) {
                    expect(result.data).toBe("12345678");
                }
            });
        });
    });

    // ====================================
    // 🎨 Testes para Schemas do Wizard
    // ====================================
    describe("Schemas do Wizard", () => {
        it("WizardEtapa1Schema: deve validar dados básicos", () => {
            const result = WizardEtapa1Schema.safeParse({
                nome_orcamento: "Meu Orçamento",
                tipo_obra: "R1_UNIFAMILIAR",
                padrao_obra: "NORMAL",
            });
            expect(result.success).toBe(true);
        });

        it("WizardEtapa2Schema: deve validar localização", () => {
            const result = WizardEtapa2Schema.safeParse({
                estado: "SP",
                cidade: "São Paulo",
            });
            expect(result.success).toBe(true);
        });

        it("WizardEtapa3Schema: deve validar áreas e exigir area_total", () => {
            const result = WizardEtapa3Schema.safeParse({ area_total: "200" });
            expect(result.success).toBe(true);
        });

        it("WizardEtapa3Schema: deve falhar se area_total estiver ausente", () => {
            const result = WizardEtapa3Schema.safeParse({
                area_construida: "150",
            });
            expect(result.success).toBe(false);
        });

        it("WizardCompletoSchema: deve unir todas as etapas com sucesso", () => {
            const payload = {
                nome_orcamento: "Orçamento Completo",
                tipo_obra: "COMERCIAL_LOJA",
                padrao_obra: "ALTO",
                estado: "RJ",
                cidade: "Rio de Janeiro",
                area_total: 500,
            };
            const result = WizardCompletoSchema.safeParse(payload);
            expect(result.success).toBe(true);
        });
    });

    // ==========================================
    // 🏗️ Testes para Schema Principal de Input
    // ==========================================
    describe("OrcamentoParametricoInputSchema", () => {
        it("deve validar um payload de input completo e correto", () => {
            const payload = {
                nome_orcamento: "Input Válido",
                tipo_obra: "REFORMA_COMERCIAL",
                padrao_obra: "LUXO",
                estado: "MG",
                cidade: "Belo Horizonte",
                area_total: 120.5,
            };
            const result = OrcamentoParametricoInputSchema.safeParse(payload);
            expect(result.success).toBe(true);
        });
    });
});
