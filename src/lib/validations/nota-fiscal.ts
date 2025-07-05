
import { z } from "zod";

import { t } from "@/lib/i18n";

export const notaFiscalSchema = z.object({
  obra_id: z.string().uuid({ message: t("messages.requiredField") }),
  despesa_id: z.string().uuid().nullable().optional(),
  fornecedor_pj_id: z.string().uuid().nullable().optional(),
  fornecedor_pf_id: z.string().uuid().nullable().optional(),
  numero: z.string().optional(),
  data_emissao: z.date({ required_error: t("messages.requiredField") }),
  valor_total: z.coerce
    .number()
    .min(0.01, { message: t("messages.invalidNumber") }),
  chave_acesso: z.string().optional(),
  descricao: z.string().optional(),
  arquivo: z.instanceof(File).optional(),
});

export type NotaFiscalFormValues = z.infer<typeof notaFiscalSchema>;
