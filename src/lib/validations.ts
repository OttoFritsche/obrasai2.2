
import { z } from 'zod';

// Formato CPF: 000.000.000-00
const cpfRegex = /^\d{3}\.\d{3}\.\d{3}-\d{2}$/;
// Formato CNPJ: 00.000.000/0000-00
const cnpjRegex = /^\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}$/;
// Formato CEP: 00000-000
const cepRegex = /^\d{5}-\d{3}$/;
// Formato telefone: (00) 00000-0000 ou (00) 0000-0000
const phoneRegex = /^\(\d{2}\) \d{4,5}-\d{4}$/;

// Schema para perfil de usuário
export const profileSchema = z.object({
  firstName: z.string().min(2, "Nome deve ter pelo menos 2 caracteres"),
  lastName: z.string().min(2, "Sobrenome deve ter pelo menos 2 caracteres"),
  cpf: z.string()
    .regex(cpfRegex, "CPF inválido (formato: 000.000.000-00)")
    .optional()
    .nullable(),
  telefone: z.string()
    .regex(phoneRegex, "Telefone inválido (formato: (00) 00000-0000)")
    .optional()
    .nullable(),
  dataNascimento: z.date().optional().nullable(),
});

// Schema para obra
export const obraSchema = z.object({
  nome: z.string().min(3, "Nome da obra deve ter pelo menos 3 caracteres"),
  endereco: z.string().min(5, "Endereço deve ter pelo menos 5 caracteres"),
  cidade: z.string().min(2, "Cidade deve ter pelo menos 2 caracteres"),
  estado: z.string().length(2, "Estado deve ter exatamente 2 caracteres"),
  cep: z.string().regex(cepRegex, "CEP inválido (formato: 00000-000)"),
  dataInicio: z.date().optional().nullable(),
  dataPrevistaTermino: z.date().optional().nullable(),
  orcamento: z.number().nonnegative("Orçamento não pode ser negativo"),
});

// Schema para fornecedor PJ
export const fornecedorPJSchema = z.object({
  cnpj: z.string().regex(cnpjRegex, "CNPJ inválido (formato: 00.000.000/0000-00)"),
  razaoSocial: z.string().min(3, "Razão social deve ter pelo menos 3 caracteres"),
  nomeFantasia: z.string().optional(),
  inscricaoEstadual: z.string().optional(),
  inscricaoMunicipal: z.string().optional(),
  email: z.string().email("Email inválido").optional().nullable(),
  telefonePrincipal: z.string()
    .regex(phoneRegex, "Telefone inválido (formato: (00) 00000-0000)")
    .optional()
    .nullable(),
  telefoneSecundario: z.string()
    .regex(phoneRegex, "Telefone inválido (formato: (00) 00000-0000)")
    .optional()
    .nullable(),
  website: z.string().url("URL inválida").optional().nullable(),
  endereco: z.string().optional(),
  numero: z.string().optional(),
  complemento: z.string().optional(),
  bairro: z.string().optional(),
  cidade: z.string().optional(),
  estado: z.string().length(2, "Estado deve ter exatamente 2 caracteres").optional(),
  cep: z.string().regex(cepRegex, "CEP inválido (formato: 00000-000)").optional(),
  observacoes: z.string().optional(),
});

// Schema para fornecedor PF
export const fornecedorPFSchema = z.object({
  cpf: z.string().regex(cpfRegex, "CPF inválido (formato: 000.000.000-00)"),
  nome: z.string().min(3, "Nome deve ter pelo menos 3 caracteres"),
  rg: z.string().optional(),
  dataNascimento: z.date().optional().nullable(),
  tipoFornecedor: z.string().optional(),
  email: z.string().email("Email inválido").optional().nullable(),
  telefonePrincipal: z.string()
    .regex(phoneRegex, "Telefone inválido (formato: (00) 00000-0000)")
    .optional()
    .nullable(),
  telefoneSecundario: z.string()
    .regex(phoneRegex, "Telefone inválido (formato: (00) 00000-0000)")
    .optional()
    .nullable(),
  endereco: z.string().optional(),
  numero: z.string().optional(),
  complemento: z.string().optional(),
  bairro: z.string().optional(),
  cidade: z.string().optional(),
  estado: z.string().length(2, "Estado deve ter exatamente 2 caracteres").optional(),
  cep: z.string().regex(cepRegex, "CEP inválido (formato: 00000-000)").optional(),
  observacoes: z.string().optional(),
});

// Schema para despesa
export const despesaSchema = z.object({
  obraId: z.string().uuid("ID de obra inválido"),
  fornecedorPjId: z.string().uuid("ID de fornecedor PJ inválido").optional().nullable(),
  fornecedorPfId: z.string().uuid("ID de fornecedor PF inválido").optional().nullable(),
  descricao: z.string().min(3, "Descrição deve ter pelo menos 3 caracteres"),
  dataDespesa: z.date(),
  insumo: z.string().optional(),
  etapa: z.string().optional(),
  categoria: z.string().optional(),
  unidade: z.string().optional(),
  quantidade: z.number().positive("Quantidade deve ser maior que zero"),
  valorUnitario: z.number().positive("Valor unitário deve ser maior que zero"),
  numeroNf: z.string().optional(),
  observacoes: z.string().optional(),
  pago: z.boolean().default(false),
  dataPagamento: z.date().optional().nullable(),
}).refine(data => data.fornecedorPjId || data.fornecedorPfId, {
  message: "Deve selecionar um fornecedor PJ ou PF",
  path: ["fornecedor"],
});

// Schema para nota fiscal
export const notaFiscalSchema = z.object({
  obraId: z.string().uuid("ID de obra inválido"),
  despesaId: z.string().uuid("ID de despesa inválido").optional().nullable(),
  fornecedorPjId: z.string().uuid("ID de fornecedor PJ inválido").optional().nullable(),
  fornecedorPfId: z.string().uuid("ID de fornecedor PF inválido").optional().nullable(),
  numero: z.string().optional(),
  dataEmissao: z.date(),
  valorTotal: z.number().positive("Valor total deve ser maior que zero"),
  chaveAcesso: z.string().max(44, "Chave de acesso deve ter no máximo 44 caracteres").optional().nullable(),
  descricao: z.string().optional(),
});

// Constantes para opções nos formulários
export const etapasObra = [
  "Fundação",
  "Estrutura",
  "Alvenaria",
  "Cobertura",
  "Instalações Elétricas",
  "Instalações Hidráulicas",
  "Acabamento",
  "Pintura",
  "Paisagismo",
  "Outros",
];

export const categoriasInsumo = [
  "Material de Construção",
  "Equipamentos",
  "Mão de Obra",
  "Serviços Terceirizados",
  "Documentação e Taxas",
  "Transporte e Logística",
  "Outros",
];

export const tiposInsumo = [
  "Cimento",
  "Areia",
  "Brita",
  "Tijolo",
  "Concreto",
  "Material Elétrico",
  "Material Hidráulico",
  "Ferragens",
  "Madeira",
  "Tintas",
  "Revestimento",
  "Ferramentas",
  "EPI",
  "Outros",
];

export const tiposFornecedorPF = [
  "Pedreiro",
  "Eletricista",
  "Encanador",
  "Pintor",
  "Carpinteiro",
  "Serralheiro",
  "Engenheiro",
  "Arquiteto",
  "Mestre de Obras",
  "Ajudante Geral",
  "Outros",
];

export const unidadesMedida = [
  "un",
  "kg",
  "m",
  "m²",
  "m³",
  "l",
  "cx",
  "pç",
  "sc",
  "diária",
  "hora",
  "serviço",
];
