
import { z } from "zod";
import { t } from "@/lib/i18n";

export const obraSchema = z.object({
  nome: z.string().min(3, { message: t("messages.requiredField") }),
  endereco: z.string().min(3, { message: t("messages.requiredField") }),
  cidade: z.string().min(1, { message: t("messages.requiredField") }),
  estado: z.string().min(2, { message: t("messages.requiredField") }),
  cep: z.string().min(8, { message: t("messages.requiredField") }),
  orcamento: z.coerce
    .number()
    .min(0, { message: t("messages.invalidNumber") }),
  data_inicio: z.date().nullable().optional(),
  data_prevista_termino: z.date().nullable().optional(),
});

export type ObraFormValues = z.infer<typeof obraSchema>;
