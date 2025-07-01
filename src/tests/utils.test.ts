import { describe, expect, it } from "vitest";
import { formatDate } from "./utils";

describe("formatDate", () => {
    it("should format a valid date string correctly", () => {
        // Teste com uma string de data no formato ISO
        const isoDate = "2025-12-01T12:00:00.000Z";
        expect(formatDate(isoDate)).toBe("01/12/2025");
    });

    it("should format a valid Date object correctly", () => {
        // Teste com um objeto Date
        const dateObject = new Date(2025, 11, 25); // Mês é 0-indexado, então 11 é Dezembro
        expect(formatDate(dateObject)).toBe("25/12/2025");
    });

    it("should return an empty string for null or undefined input", () => {
        // Teste com null e undefined
        expect(formatDate(null)).toBe("");
        expect(formatDate(undefined)).toBe("");
    });

    it('should return "Data inválida" for an invalid date string', () => {
        // Teste com uma string que não pode ser convertida para data
        const invalidDate = "not a real date";
        expect(formatDate(invalidDate)).toBe("Data inválida");
    });

    it("should handle single digit day and month by padding with zero", () => {
        // Teste com data que precisa de padding
        const singleDigitDate = "2025-01-05T12:00:00.000Z";
        expect(formatDate(singleDigitDate)).toBe("05/01/2025");
    });
});
