import { z } from "zod";

import { t } from "@/lib/i18n";

// Regex para validar CEP brasileiro (formato: 00000-000 ou 00000000)
const cepRegex = /^(\d{5}-?\d{3})$/;

export const obraSchema = z.object({
  nome: z.string().min(3, { message: t("messages.requiredField") }),
  endereco: z.string().min(3, { message: t("messages.requiredField") }),
  cidade: z.string().min(1, { message: t("messages.requiredField") }),
  estado: z.string().min(2, { message: t("messages.requiredField") }),
  cep: z.string()
    .min(8, { message: "CEP deve ter pelo menos 8 dígitos" })
    .regex(cepRegex, { message: "CEP deve estar no formato 00000-000" })
    .transform((val) => {
      // Remove formatação para armazenar apenas números no banco
      const cleaned = val.replace(/\D/g, '');
      // Retorna formatado para exibição
      return cleaned.length === 8 ? cleaned.replace(/(\d{5})(\d{3})/, '$1-$2') : val;
    }),
  // Mantém nome antigo para compatibilidade com formulários
  orcamento: z.coerce
    .number()
    .min(0, { message: t("messages.invalidNumber") }),
  data_inicio: z.date().nullable().optional(),
  // Mantém nome antigo para compatibilidade com formulários
  data_prevista_termino: z.date().nullable().optional(),
  construtora_id: z.string().min(1, { message: 'Selecione a construtora/autônomo responsável' }),
});

export type ObraFormValues = z.infer<typeof obraSchema>;
