import { describe, expect, it } from "vitest";

import { formatDateBR, formatDateTimeBR, isValidDate, daysDifference } from "@/lib/utils/dateUtils";

describe("formatDateBR", () => {
    it("should format a valid date string correctly", () => {
        // Teste com uma string de data no formato ISO
        const isoDate = "2025-12-01T12:00:00.000Z";
        expect(formatDateBR(isoDate)).toBe("01/12/2025");
    });

    it("should format a valid Date object correctly", () => {
        // Teste com um objeto Date
        const dateObject = new Date(2025, 11, 25); // Mês é 0-indexado, então 11 é Dezembro
        expect(formatDateBR(dateObject)).toBe("25/12/2025");
    });

    it("should return an empty string for null or undefined input", () => {
        // Teste com null e undefined
        expect(formatDateBR(null)).toBe("");
        expect(formatDateBR(undefined)).toBe("");
    });

    it('should return empty string for an invalid date string', () => {
        // Teste com uma string que não pode ser convertida para data
        const invalidDate = "not a real date";
        expect(formatDateBR(invalidDate)).toBe("");
    });

    it("should handle single digit day and month by padding with zero", () => {
        // Teste com data que precisa de padding
        const singleDigitDate = "2025-01-05T12:00:00.000Z";
        expect(formatDateBR(singleDigitDate)).toBe("05/01/2025");
    });
});

describe("formatDateTimeBR", () => {
    it("should format date and time correctly", () => {
        const date = new Date(2025, 11, 25, 14, 30);
        const formatted = formatDateTimeBR(date);
        expect(formatted).toContain("25/12/2025");
        expect(formatted).toContain("14:30");
    });

    it("should return empty string for null input", () => {
        expect(formatDateTimeBR(null)).toBe("");
    });
});

describe("isValidDate", () => {
    it("should return true for valid dates", () => {
        expect(isValidDate(new Date())).toBe(true);
        expect(isValidDate("2025-12-01")).toBe(true);
    });

    it("should return false for invalid dates", () => {
        expect(isValidDate(null)).toBe(false);
        expect(isValidDate("invalid")).toBe(false);
        expect(isValidDate({})).toBe(false);
    });
});

describe("daysDifference", () => {
    it("should calculate difference in days correctly", () => {
        const date1 = new Date(2025, 0, 1);
        const date2 = new Date(2025, 0, 5);
        expect(daysDifference(date1, date2)).toBe(4);
    });

    it("should work with string dates", () => {
        const diff = daysDifference("2025-01-01", "2025-01-05");
        expect(diff).toBe(4);
    });
});
