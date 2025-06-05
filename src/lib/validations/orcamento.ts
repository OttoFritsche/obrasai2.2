/**
 * 🎯 Schemas de validação para Orçamento Paramétrico
 * 
 * Este arquivo contém todos os schemas Zod para validação de dados
 * do módulo de orçamento paramétrico com IA.
 * 
 * @author ObrasAI Team
 * @version 1.0.0
 */

import { z } from "zod";

// ====================================
// 📋 ENUMs - Tipos de Dados Estruturados
// ====================================

/**
 * Tipos de obra suportados pelo sistema de orçamento
 */
export const TipoObraEnum = z.enum([
  "R1_UNIFAMILIAR",        // Residência Unifamiliar  
  "R4_MULTIFAMILIAR",      // Residência Multifamiliar
  "COMERCIAL_LOJA",        // Comércio - Loja
  "COMERCIAL_ESCRITORIO",  // Comércio - Escritório
  "COMERCIAL_GALPAO",      // Comércio - Galpão
  "INDUSTRIAL_LEVE",       // Industrial Leve
  "INDUSTRIAL_PESADA",     // Industrial Pesada
  "INSTITUCIONAL",         // Institucional (escola, hospital)
  "REFORMA_RESIDENCIAL",   // Reforma Residencial
  "REFORMA_COMERCIAL"      // Reforma Comercial
]);

/**
 * Padrões construtivos com diferentes níveis de acabamento
 */
export const PadraoObraEnum = z.enum([
  "POPULAR",    // Padrão Popular (baixo custo)
  "NORMAL",     // Padrão Normal (médio)
  "ALTO",       // Padrão Alto (alto custo)
  "LUXO"        // Padrão Luxo (altíssimo custo)
]);

/**
 * Status do orçamento no fluxo do sistema
 */
export const StatusOrcamentoEnum = z.enum([
  "RASCUNHO",          // Em criação
  "CONCLUIDO",         // Finalizado
  "VINCULADO_OBRA",    // Ligado a obra real
  "CONVERTIDO"         // Convertido em obra
]);

/**
 * Estados brasileiros (siglas)
 */
export const EstadoEnum = z.string()
  .length(2, "Estado deve ter exatamente 2 caracteres")
  .regex(/^[A-Z]{2}$/, "Estado deve estar em formato de sigla (ex: SP, RJ)");

/**
 * Unidades de medida padrão da construção civil
 */
export const UnidadeMedidaEnum = z.enum([
  "m²",    // Metro quadrado
  "m³",    // Metro cúbico
  "m",     // Metro linear
  "kg",    // Quilograma
  "t",     // Tonelada
  "und",   // Unidade
  "cj",    // Conjunto
  "pç",    // Peça
  "h",     // Hora
  "vg",    // Verba/Viga
  "l",     // Litro
  "sc",    // Saco
  "gl"     // Global
]);

// ====================================
// 🎯 SCHEMAS BASE - Validações Fundamentais
// ====================================

/**
 * Schema base para valores monetários
 */
export const ValorMonetarioSchema = z.number()
  .min(0, "Valor deve ser positivo")
  .refine((val) => Number.isFinite(val), "Valor deve ser um número válido")
  .refine((val) => val <= 999999999.99, "Valor muito alto")
  .transform((val) => Number(val.toFixed(2))); // Garantir 2 casas decimais

/**
 * Schema base para áreas (m²) - para formulários
 */
export const AreaSchema = z.union([
  z.string().refine((val) => val === "" || !isNaN(parseFloat(val)), "Área deve ser um número válido"),
  z.number()
])
.transform((val) => {
  if (typeof val === "string") {
    if (val === "") return undefined;
    const num = parseFloat(val);
    return isNaN(num) ? undefined : num;
  }
  return val;
})
.refine((val) => val === undefined || (val >= 0.01 && val <= 999999), {
  message: "Área deve estar entre 0.01 e 999999 m²"
});

/**
 * Schema base para áreas (m²) - para campos já processados
 */
export const AreaSchemaCompleto = z.number()
  .min(0.01, "Área deve ser maior que zero")
  .max(999999, "Área muito grande")
  .refine((val) => Number.isFinite(val), "Área deve ser um número válido");

/**
 * Schema base para percentuais
 */
export const PercentualSchema = z.number()
  .min(0, "Percentual deve ser positivo")
  .max(100, "Percentual não pode exceder 100%");

/**
 * Schema para coordenadas geográficas (CEP brasileiro)
 */
export const CepSchema = z.string()
  .regex(/^\d{5}-?\d{3}$/, "CEP deve estar no formato 00000-000")
  .transform((cep) => cep.replace("-", ""));

// ====================================
// 🏗️ SCHEMAS PRINCIPAIS - Orçamento Paramétrico
// ====================================

/**
 * Schema para dados de entrada do orçamento
 */
export const OrcamentoParametricoInputSchema = z.object({
  // Identificação básica
  nome_orcamento: z.string()
    .min(3, "Nome deve ter pelo menos 3 caracteres")
    .max(100, "Nome muito longo")
    .trim(),
  
  descricao: z.string()
    .max(500, "Descrição muito longa")
    .optional()
    .transform((val) => val?.trim()),

  // Classificação da obra
  tipo_obra: TipoObraEnum,
  padrao_obra: PadraoObraEnum,
  
  // Localização
  estado: EstadoEnum,
  cidade: z.string()
    .min(2, "Nome da cidade muito curto")
    .max(100, "Nome da cidade muito longo")
    .trim(),
  cep: CepSchema.optional(),
  
  // Áreas e metragens
  area_total: AreaSchema.refine((val) => val !== undefined && val >= 0.01, {
    message: "Área total é obrigatória e deve ser maior que zero"
  }),
  area_construida: AreaSchema.optional(),
  area_detalhada: z.record(z.string(), z.number().positive()).optional(),
  
  // Especificações técnicas  
  especificacoes: z.record(z.any()).optional(),
  parametros_entrada: z.record(z.any()).optional(),
  
  // Relacionamento opcional com obra existente
  obra_id: z.string().uuid().optional()
});

/**
 * Schema para orçamento paramétrico completo (com resultados da IA)
 */
export const OrcamentoParametricoSchema = OrcamentoParametricoInputSchema.extend({
  id: z.string().uuid(),
  usuario_id: z.string().uuid(),
  tenant_id: z.string().uuid(),
  
  // Resultados do cálculo
  custo_estimado: ValorMonetarioSchema,
  custo_m2: ValorMonetarioSchema,
  margem_erro_estimada: PercentualSchema.default(15.0),
  confianca_estimativa: z.number()
    .int()
    .min(0, "Confiança deve ser positiva")
    .max(100, "Confiança não pode exceder 100%")
    .default(80),
  
  // Dados da IA
  parametros_ia: z.record(z.any()).optional(),
  sugestoes_ia: z.array(z.string()).default([]),
  alertas_ia: z.array(z.string()).default([]),
  
  // Status e controle
  status: StatusOrcamentoEnum.default("RASCUNHO"),
  data_calculo: z.date().default(() => new Date()),
  created_at: z.date().default(() => new Date()),
  updated_at: z.date().default(() => new Date())
});

/**
 * Schema para item de orçamento
 */
export const ItemOrcamentoSchema = z.object({
  id: z.string().uuid().optional(),
  orcamento_id: z.string().uuid(),
  
  // Categorização (usando ENUMs existentes do sistema)
  categoria: z.enum([
    "MATERIAL_CONSTRUCAO",
    "MAO_DE_OBRA", 
    "ALUGUEL_EQUIPAMENTOS",
    "TRANSPORTE_FRETE",
    "TAXAS_LICENCAS",
    "SERVICOS_TERCEIRIZADOS",
    "ADMINISTRATIVO",
    "IMPREVISTOS",
    "OUTROS"
  ]),
  
  etapa: z.enum([
    "PLANEJAMENTO",
    "DEMOLICAO",
    "TERRAPLANAGEM",
    "FUNDACAO",
    "ESTRUTURA",
    "ALVENARIA",
    "COBERTURA",
    "INSTALACOES_ELETRICAS",
    "INSTALACOES_HIDRAULICAS",
    "REVESTIMENTOS_INTERNOS",
    "REVESTIMENTOS_EXTERNOS",
    "PINTURA",
    "ACABAMENTOS",
    "PAISAGISMO",
    "LIMPEZA_POS_OBRA",
    "ENTREGA_VISTORIA",
    "DOCUMENTACAO",
    "OUTROS"
  ]),
  
  insumo: z.string(), // Será validado contra o ENUM do banco
  
  // Quantitativos e valores
  quantidade_estimada: z.number()
    .positive("Quantidade deve ser positiva")
    .max(999999, "Quantidade muito alta"),
  
  unidade_medida: UnidadeMedidaEnum,
  
  valor_unitario_base: ValorMonetarioSchema,
  
  // Dados auxiliares
  fonte_preco: z.enum(["CUB", "HISTORICO", "FORNECEDOR", "IA"]).optional(),
  indice_regional: z.number().positive().default(1.0),
  coeficiente_tecnico: z.number().positive().optional(),
  
  // Observações
  observacoes: z.string().max(500).optional(),
  alternativas_sugeridas: z.array(z.string()).default([]),
  
  // Auditoria
  created_at: z.date().default(() => new Date()),
  updated_at: z.date().default(() => new Date())
});

/**
 * Schema para base de custos regionais
 */
export const BaseCustoRegionalSchema = z.object({
  id: z.string().uuid().optional(),
  
  // Localização
  estado: EstadoEnum,
  cidade: z.string().min(2).max(100).trim(),
  regiao: z.string().max(50).optional(),
  
  // Tipo e padrão
  tipo_obra: TipoObraEnum,
  padrao_obra: PadraoObraEnum,
  
  // Custos
  custo_m2_base: ValorMonetarioSchema,
  indice_regional: z.number().positive().default(1.0),
  
  // Fonte dos dados
  fonte_dados: z.enum(["SINDUSCON", "IBGE", "MERCADO", "HISTORICO"]),
  referencia_cub: z.string().max(20).optional(),
  
  // Controle temporal
  data_referencia: z.date(),
  data_atualizacao: z.date().default(() => new Date()),
  ativo: z.boolean().default(true),
  
  // Auditoria
  created_at: z.date().default(() => new Date()),
  updated_at: z.date().default(() => new Date())
});

/**
 * Schema para coeficientes técnicos
 */
export const CoeficienteTecnicoSchema = z.object({
  id: z.string().uuid().optional(),
  
  // Tipo e padrão da obra
  tipo_obra: TipoObraEnum,
  padrao_obra: PadraoObraEnum,
  
  // Categorização
  categoria: z.string(), // Será validado contra ENUM existente
  etapa: z.string(),     // Será validado contra ENUM existente  
  insumo: z.string(),    // Será validado contra ENUM existente
  
  // Coeficiente técnico
  quantidade_por_m2: z.number()
    .positive("Quantidade por m² deve ser positiva")
    .max(9999, "Coeficiente muito alto"),
  
  unidade_medida: UnidadeMedidaEnum,
  
  // Fonte técnica
  fonte_tecnica: z.enum(["TCPO", "SINAPI", "EMPRESA", "NORMA"]),
  norma_referencia: z.string().max(50).optional(),
  
  // Variações
  variacao_minima: z.number().positive().optional(),
  variacao_maxima: z.number().positive().optional(),
  observacoes_tecnicas: z.string().max(500).optional(),
  
  // Controle
  ativo: z.boolean().default(true),
  created_at: z.date().default(() => new Date()),
  updated_at: z.date().default(() => new Date())
});

/**
 * Schema para comparação orçamento vs real
 */
export const ComparacaoOrcamentoRealSchema = z.object({
  id: z.string().uuid().optional(),
  
  // Relacionamentos
  orcamento_id: z.string().uuid(),
  obra_id: z.string().uuid(),
  tenant_id: z.string().uuid(),
  
  // Comparação de valores
  valor_orcado: ValorMonetarioSchema,
  valor_real: ValorMonetarioSchema,
  
  // Análises
  desvios_por_categoria: z.record(z.number()).optional(),
  desvios_por_etapa: z.record(z.number()).optional(),
  
  // Insights
  principais_desvios: z.array(z.string()).default([]),
  causas_identificadas: z.array(z.string()).default([]),
  licoes_aprendidas: z.array(z.string()).default([]),
  
  // Métricas
  score_precisao: z.number().int().min(0).max(100).optional(),
  fatores_sucesso: z.array(z.string()).default([]),
  fatores_erro: z.array(z.string()).default([]),
  
  // Controle temporal
  data_inicio_obra: z.date().optional(),
  data_fim_obra: z.date().optional(),
  data_analise: z.date().default(() => new Date()),
  
  // Auditoria
  created_at: z.date().default(() => new Date()),
  updated_at: z.date().default(() => new Date())
});

// ====================================
// 🎨 SCHEMAS PARA WIZARD/FORMULÁRIOS
// ====================================

/**
 * Schema para Etapa 1: Dados básicos da obra
 */
export const WizardEtapa1Schema = z.object({
  nome_orcamento: z.string()
    .min(3, "Nome deve ter pelo menos 3 caracteres")
    .max(100, "Nome muito longo"),
  
  tipo_obra: TipoObraEnum,
  padrao_obra: PadraoObraEnum,
  
  descricao: z.string().max(500).optional()
});

/**
 * Schema para Etapa 2: Localização
 */
export const WizardEtapa2Schema = z.object({
  estado: EstadoEnum,
  cidade: z.string().min(2).max(100).trim(),
  cep: CepSchema.optional()
});

/**
 * Schema para Etapa 3: Áreas e metragens
 */
export const WizardEtapa3Schema = z.object({
  area_total: AreaSchema.refine((val) => val !== undefined && val >= 0.01, {
    message: "Área total é obrigatória e deve ser maior que zero"
  }),
  area_construida: AreaSchema.optional(),
  area_detalhada: z.record(z.string(), z.number().positive()).optional()
});

/**
 * Schema para Etapa 4: Especificações técnicas
 */
export const WizardEtapa4Schema = z.object({
  especificacoes: z.record(z.any()).optional(),
  parametros_entrada: z.record(z.any()).optional()
});

/**
 * Schema completo do wizard (união de todas as etapas)
 */
export const WizardCompletoSchema = WizardEtapa1Schema
  .merge(WizardEtapa2Schema)
  .merge(WizardEtapa3Schema)
  .merge(WizardEtapa4Schema)
  .extend({
    obra_id: z.string().uuid().optional()
  });

// ====================================
// 🔧 SCHEMAS PARA REQUESTS/RESPONSES
// ====================================

/**
 * Schema para request de criação de orçamento
 */
export const CriarOrcamentoRequestSchema = WizardCompletoSchema;

/**
 * Schema para request de atualização de orçamento
 */
export const AtualizarOrcamentoRequestSchema = WizardCompletoSchema.partial();

/**
 * Schema para request de cálculo de orçamento
 */
export const CalcularOrcamentoRequestSchema = z.object({
  orcamento_id: z.string().uuid(),
  forcar_recalculo: z.boolean().default(false)
});

/**
 * Schema para response de cálculo de orçamento
 */
export const CalcularOrcamentoResponseSchema = z.object({
  success: z.boolean(),
  orcamento: OrcamentoParametricoSchema,
  itens: z.array(ItemOrcamentoSchema),
  tempo_calculo_ms: z.number().int().positive(),
  tokens_usados: z.number().int().positive().optional()
});

/**
 * Schema para filtros de busca de orçamentos
 */
export const FiltrosOrcamentoSchema = z.object({
  tipo_obra: TipoObraEnum.optional(),
  padrao_obra: PadraoObraEnum.optional(),
  status: StatusOrcamentoEnum.optional(),
  estado: EstadoEnum.optional(),
  cidade: z.string().optional(),
  custo_min: ValorMonetarioSchema.optional(),
  custo_max: ValorMonetarioSchema.optional(),
  data_inicio: z.date().optional(),
  data_fim: z.date().optional(),
  limit: z.number().int().positive().max(100).default(20),
  offset: z.number().int().min(0).default(0)
});

// ====================================
// 📤 EXPORTS - Tipos TypeScript
// ====================================

export type TipoObra = z.infer<typeof TipoObraEnum>;
export type PadraoObra = z.infer<typeof PadraoObraEnum>;
export type StatusOrcamento = z.infer<typeof StatusOrcamentoEnum>;
export type UnidadeMedida = z.infer<typeof UnidadeMedidaEnum>;

export type OrcamentoParametricoInput = z.infer<typeof OrcamentoParametricoInputSchema>;
export type OrcamentoParametrico = z.infer<typeof OrcamentoParametricoSchema>;
export type ItemOrcamento = z.infer<typeof ItemOrcamentoSchema>;
export type BaseCustoRegional = z.infer<typeof BaseCustoRegionalSchema>;
export type CoeficienteTecnico = z.infer<typeof CoeficienteTecnicoSchema>;
export type ComparacaoOrcamentoReal = z.infer<typeof ComparacaoOrcamentoRealSchema>;

export type WizardEtapa1 = z.infer<typeof WizardEtapa1Schema>;
export type WizardEtapa2 = z.infer<typeof WizardEtapa2Schema>;
export type WizardEtapa3 = z.infer<typeof WizardEtapa3Schema>;
export type WizardEtapa4 = z.infer<typeof WizardEtapa4Schema>;
export type WizardCompleto = z.infer<typeof WizardCompletoSchema>;

export type CriarOrcamentoRequest = z.infer<typeof CriarOrcamentoRequestSchema>;
export type AtualizarOrcamentoRequest = z.infer<typeof AtualizarOrcamentoRequestSchema>;
export type CalcularOrcamentoRequest = z.infer<typeof CalcularOrcamentoRequestSchema>;
export type CalcularOrcamentoResponse = z.infer<typeof CalcularOrcamentoResponseSchema>;
export type FiltrosOrcamento = z.infer<typeof FiltrosOrcamentoSchema>;

// ====================================
// 🎯 CONSTANTES ÚTEIS
// ====================================

/**
 * Labels amigáveis para tipos de obra
 */
export const TIPO_OBRA_LABELS: Record<TipoObra, string> = {
  R1_UNIFAMILIAR: "Residência Unifamiliar",
  R4_MULTIFAMILIAR: "Residência Multifamiliar", 
  COMERCIAL_LOJA: "Comércio - Loja",
  COMERCIAL_ESCRITORIO: "Comércio - Escritório",
  COMERCIAL_GALPAO: "Comércio - Galpão",
  INDUSTRIAL_LEVE: "Industrial Leve",
  INDUSTRIAL_PESADA: "Industrial Pesada",
  INSTITUCIONAL: "Institucional",
  REFORMA_RESIDENCIAL: "Reforma Residencial",
  REFORMA_COMERCIAL: "Reforma Comercial"
};

/**
 * Labels amigáveis para padrões de obra
 */
export const PADRAO_OBRA_LABELS: Record<PadraoObra, string> = {
  POPULAR: "Padrão Popular",
  NORMAL: "Padrão Normal",
  ALTO: "Padrão Alto",
  LUXO: "Padrão Luxo"
};

/**
 * Labels amigáveis para status
 */
export const STATUS_ORCAMENTO_LABELS: Record<StatusOrcamento, string> = {
  RASCUNHO: "Rascunho",
  CONCLUIDO: "Concluído",
  VINCULADO_OBRA: "Vinculado à Obra",
  CONVERTIDO: "Convertido em Obra"
};

/**
 * Cores para status (Tailwind classes)
 */
export const STATUS_ORCAMENTO_CORES: Record<StatusOrcamento, string> = {
  RASCUNHO: "bg-gray-100 text-gray-800",
  CONCLUIDO: "bg-blue-100 text-blue-800",
  VINCULADO_OBRA: "bg-green-100 text-green-800",
  CONVERTIDO: "bg-purple-100 text-purple-800"
};

/**
 * Estados brasileiros completos
 */
export const ESTADOS_BRASILEIROS = [
  { sigla: "AC", nome: "Acre" },
  { sigla: "AL", nome: "Alagoas" },
  { sigla: "AP", nome: "Amapá" },
  { sigla: "AM", nome: "Amazonas" },
  { sigla: "BA", nome: "Bahia" },
  { sigla: "CE", nome: "Ceará" },
  { sigla: "DF", nome: "Distrito Federal" },
  { sigla: "ES", nome: "Espírito Santo" },
  { sigla: "GO", nome: "Goiás" },
  { sigla: "MA", nome: "Maranhão" },
  { sigla: "MT", nome: "Mato Grosso" },
  { sigla: "MS", nome: "Mato Grosso do Sul" },
  { sigla: "MG", nome: "Minas Gerais" },
  { sigla: "PA", nome: "Pará" },
  { sigla: "PB", nome: "Paraíba" },
  { sigla: "PR", nome: "Paraná" },
  { sigla: "PE", nome: "Pernambuco" },
  { sigla: "PI", nome: "Piauí" },
  { sigla: "RJ", nome: "Rio de Janeiro" },
  { sigla: "RN", nome: "Rio Grande do Norte" },
  { sigla: "RS", nome: "Rio Grande do Sul" },
  { sigla: "RO", nome: "Rondônia" },
  { sigla: "RR", nome: "Roraima" },
  { sigla: "SC", nome: "Santa Catarina" },
  { sigla: "SP", nome: "São Paulo" },
  { sigla: "SE", nome: "Sergipe" },
  { sigla: "TO", nome: "Tocantins" }
]; 