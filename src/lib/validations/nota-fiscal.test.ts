import { describe, expect, it, vi } from 'vitest';

import { notaFiscalSchema } from './nota-fiscal';

// Mock da função de internacionalização (i18n)
vi.mock('@/lib/i18n', () => ({
  t: (key: string) => key,
}));

// Mock do objeto File para ambiente de teste Node.js
class MockFile {
  name: string;
  size: number;
  type: string;
  constructor(parts: (string | Blob | File)[], name: string, options?: FilePropertyBag) {
    this.name = name;
    this.size = options?.type?.length || 0; // simular tamanho
    this.type = options?.type || '';
  }
}
global.File = MockFile as any;


describe('Nota Fiscal Validation Schema', () => {

  const getValidPayload = () => ({
    obra_id: 'b1f8b4a0-7c1a-4b5a-9c1a-8f0a1b2c3d4e',
    data_emissao: new Date(),
    valor_total: 1500.75,
  });

  it('deve validar um payload mínimo correto', () => {
    const result = notaFiscalSchema.safeParse(getValidPayload());
    expect(result.success).toBe(true);
  });
  
  it('deve validar um payload com um arquivo', () => {
    const payload = {
      ...getValidPayload(),
      arquivo: new File([], 'nota.pdf', { type: 'application/pdf' })
    };
    const result = notaFiscalSchema.safeParse(payload);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.arquivo).toBeInstanceOf(File);
    }
  });

  it('deve usar coerce para o valor_total', () => {
    const payload = { ...getValidPayload(), valor_total: "123.45" };
    const result = notaFiscalSchema.safeParse(payload);
    expect(result.success).toBe(true);
    if(result.success){
        expect(result.data.valor_total).toBe(123.45);
    }
  });
  
  it('deve falhar se obra_id estiver ausente', () => {
    const { obra_id, ...payload } = getValidPayload();
    const result = notaFiscalSchema.safeParse(payload);
    expect(result.success).toBe(false);
  });
  
  it('deve falhar se o valor_total for zero', () => {
    const payload = { ...getValidPayload(), valor_total: 0 };
    const result = notaFiscalSchema.safeParse(payload);
    expect(result.success).toBe(false);
    if (!result.success) {
        expect(result.error.issues[0].message).toBe('messages.invalidNumber');
    }
  });
}); 