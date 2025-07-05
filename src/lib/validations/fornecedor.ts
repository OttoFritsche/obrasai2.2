import { z } from "zod";

import { unformat } from "@/lib/utils/formatters";

export type FornecedorType = "pj" | "pf";

// Função auxiliar para validar CNPJ
const validateCNPJ = (cnpj: string): boolean => {
  const cleaned = unformat(cnpj);
  
  // Verifica se tem 14 dígitos
  if (cleaned.length !== 14) return false;
  
  // Verifica se não são todos números iguais
  if (/^(\d)\1+$/.test(cleaned)) return false;
  
  // Algoritmo de validação do CNPJ
  let sum = 0;
  let weight = 5;
  
  // Primeiro dígito verificador
  for (let i = 0; i < 12; i++) {
    sum += parseInt(cleaned[i]) * weight;
    weight = weight === 2 ? 9 : weight - 1;
  }
  
  const digit1 = sum % 11 < 2 ? 0 : 11 - (sum % 11);
  
  if (parseInt(cleaned[12]) !== digit1) return false;
  
  // Segundo dígito verificador
  sum = 0;
  weight = 6;
  
  for (let i = 0; i < 13; i++) {
    sum += parseInt(cleaned[i]) * weight;
    weight = weight === 2 ? 9 : weight - 1;
  }
  
  const digit2 = sum % 11 < 2 ? 0 : 11 - (sum % 11);
  
  return parseInt(cleaned[13]) === digit2;
};

// Função auxiliar para validar CPF
const validateCPF = (cpf: string): boolean => {
  const cleaned = unformat(cpf);
  
  // Verifica se tem 11 dígitos
  if (cleaned.length !== 11) return false;
  
  // Verifica se não são todos números iguais
  if (/^(\d)\1+$/.test(cleaned)) return false;
  
  // Algoritmo de validação do CPF
  let sum = 0;
  
  // Primeiro dígito verificador
  for (let i = 0; i < 9; i++) {
    sum += parseInt(cleaned[i]) * (10 - i);
  }
  
  const digit1 = sum % 11 < 2 ? 0 : 11 - (sum % 11);
  
  if (parseInt(cleaned[9]) !== digit1) return false;
  
  // Segundo dígito verificador
  sum = 0;
  for (let i = 0; i < 10; i++) {
    sum += parseInt(cleaned[i]) * (11 - i);
  }
  
  const digit2 = sum % 11 < 2 ? 0 : 11 - (sum % 11);
  
  return parseInt(cleaned[10]) === digit2;
};

export const fornecedorPJSchema = z.object({
  cnpj: z
    .string()
    .min(1, { message: "CNPJ é obrigatório" })
    .refine((cnpj) => validateCNPJ(cnpj), {
      message: "CNPJ inválido",
    }),
  razao_social: z
    .string()
    .min(1, { message: "Razão social é obrigatória" })
    .min(2, { message: "Razão social deve ter pelo menos 2 caracteres" }),
  nome_fantasia: z.string().optional(),
  inscricao_estadual: z.string().optional(),
  inscricao_municipal: z.string().optional(),
  email: z
    .string()
    .email({ message: "Email inválido" })
    .optional()
    .nullable()
    .or(z.literal("")),
  telefone_principal: z.string().optional(),
  telefone_secundario: z.string().optional(),
  website: z
    .string()
    .url({ message: "Website deve ser uma URL válida" })
    .optional()
    .or(z.literal("")),
  endereco: z.string().optional(),
  numero: z.string().optional(),
  complemento: z.string().optional(),
  bairro: z.string().optional(),
  cidade: z.string().optional(),
  estado: z.string().min(2, { message: "Estado inválido" }).optional(),
  cep: z
    .string()
    .optional()
    .refine((cep) => !cep || unformat(cep).length === 8, {
      message: "CEP deve ter 8 dígitos",
    }),
  observacoes: z.string().optional(),
});

export const fornecedorPFSchema = z.object({
  cpf: z
    .string()
    .min(1, { message: "CPF é obrigatório" })
    .refine((cpf) => validateCPF(cpf), {
      message: "CPF inválido",
    }),
  nome: z
    .string()
    .min(1, { message: "Nome é obrigatório" })
    .min(2, { message: "Nome deve ter pelo menos 2 caracteres" }),
  rg: z.string().optional(),
  data_nascimento: z.date().nullable().optional(),
  email: z
    .string()
    .email({ message: "Email inválido" })
    .optional()
    .nullable()
    .or(z.literal("")),
  telefone_principal: z.string().optional(),
  telefone_secundario: z.string().optional(),
  tipo_fornecedor: z.string().optional(),
  endereco: z.string().optional(),
  numero: z.string().optional(),
  complemento: z.string().optional(),
  bairro: z.string().optional(),
  cidade: z.string().optional(),
  estado: z.string().min(2, { message: "Estado inválido" }).optional(),
  cep: z
    .string()
    .optional()
    .refine((cep) => !cep || unformat(cep).length === 8, {
      message: "CEP deve ter 8 dígitos",
    }),
  observacoes: z.string().optional(),
});

export type FornecedorPJFormValues = z.infer<typeof fornecedorPJSchema>;
export type FornecedorPFFormValues = z.infer<typeof fornecedorPFSchema>;
