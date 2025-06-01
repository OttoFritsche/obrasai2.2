
import { z } from "zod";
import { t } from "@/lib/i18n";

export type FornecedorType = "pj" | "pf";

export const fornecedorPJSchema = z.object({
  cnpj: z.string().min(1, { message: t("messages.requiredField") }),
  razao_social: z.string().min(1, { message: t("messages.requiredField") }),
  nome_fantasia: z.string().optional(),
  inscricao_estadual: z.string().optional(),
  inscricao_municipal: z.string().optional(),
  email: z.string().email({ message: t("messages.invalidEmail") }).optional().nullable(),
  telefone_principal: z.string().optional(),
  telefone_secundario: z.string().optional(),
  website: z.string().optional(),
  endereco: z.string().optional(),
  numero: z.string().optional(),
  complemento: z.string().optional(),
  bairro: z.string().optional(),
  cidade: z.string().optional(),
  estado: z.string().min(2, { message: t("messages.invalidState") }).optional(),
  cep: z.string().optional(),
  observacoes: z.string().optional(),
});

export const fornecedorPFSchema = z.object({
  cpf: z.string().min(1, { message: t("messages.requiredField") }),
  nome: z.string().min(1, { message: t("messages.requiredField") }),
  rg: z.string().optional(),
  data_nascimento: z.date().nullable().optional(),
  email: z.string().email({ message: t("messages.invalidEmail") }).optional().nullable(),
  telefone_principal: z.string().optional(),
  telefone_secundario: z.string().optional(),
  tipo_fornecedor: z.string().optional(),
  endereco: z.string().optional(),
  numero: z.string().optional(),
  complemento: z.string().optional(),
  bairro: z.string().optional(),
  cidade: z.string().optional(),
  estado: z.string().min(2, { message: t("messages.invalidState") }).optional(),
  cep: z.string().optional(),
  observacoes: z.string().optional(),
});

export type FornecedorPJFormValues = z.infer<typeof fornecedorPJSchema>;
export type FornecedorPFFormValues = z.infer<typeof fornecedorPFSchema>;
