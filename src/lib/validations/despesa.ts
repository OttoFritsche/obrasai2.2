import { z } from "zod";
import { t } from "@/lib/i18n";

// Define as opções válidas para forma de pagamento
export const formasPagamento = [
  'PIX',
  'Cartão de Crédito',
  'Cartão de Débito',
  'Boleto Bancário',
  'Transferência Bancária',
  'Dinheiro'
] as const; // Usa 'as const' para criar um tipo literal readonly

// Define os enum types baseados no schema do banco de dados
const CategoriaEnum = z.enum([
  "MATERIAL_CONSTRUCAO",
  "MAO_DE_OBRA",
  "ALUGUEL_EQUIPAMENTOS", 
  "TRANSPORTE_FRETE",
  "TAXAS_LICENCAS",
  "SERVICOS_TERCEIRIZADOS",
  "ADMINISTRATIVO", 
  "IMPREVISTOS",
  "OUTROS"
]);

const EtapaEnum = z.enum([
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
  "DOCUMENTACAO", 
  "OUTROS"
]);

const InsumoEnum = z.enum([
  "CONCRETO_USINADO",
  "ACO_CA50",
  "FORMA_MADEIRA",
  // Adicionar todos os outros insumos aqui
  "OUTROS"
]);

// Define o schema Zod para o formulário de despesa
export const despesaSchema = z.object({
  // ID da obra (obrigatório, UUID)
  obra_id: z.string().uuid({ message: t("messages.requiredField") }),
  // ID do fornecedor PJ (opcional, UUID)
  fornecedor_pj_id: z.string().uuid().nullable().optional(),
  // ID do fornecedor PF (opcional, UUID)
  fornecedor_pf_id: z.string().uuid().nullable().optional(),
  // Descrição da despesa (obrigatório, mínimo 3 caracteres)
  descricao: z.string().min(3, { message: t("messages.atLeast3Chars") }), 
  // Data da despesa (obrigatório)
  data_despesa: z.date({ required_error: t("messages.requiredField") }),
  // Insumo (opcional, baseado no enum)
  insumo: InsumoEnum.nullable().optional(),
  // Etapa (opcional, baseado no enum)
  etapa: EtapaEnum.nullable().optional(),
  // Categoria (obrigatório, baseado no enum - corrigido)
  categoria: CategoriaEnum, // Correção: Usar o enum diretamente para obrigatoriedade
  // Unidade de medida (opcional)
  unidade: z.string().nullable().optional(),
  // Quantidade (obrigatório, número positivo)
  quantidade: z.coerce.number().positive({ message: t("messages.positiveNumber") })
             .min(0.01, { message: t("messages.positiveNumber") }), 
  // Valor unitário (obrigatório, número positivo)
  valor_unitario: z.coerce.number().positive({ message: t("messages.positiveNumber") })
                  .min(0.01, { message: t("messages.positiveNumber") }), 
  // Número da nota fiscal (opcional)
  numero_nf: z.string().nullable().optional(),
  // Observações (opcional)
  observacoes: z.string().nullable().optional(),
  // Indica se a despesa foi paga (obrigatório, padrão false)
  pago: z.boolean().default(false),
  // Data do pagamento (opcional, mas obrigatório se 'pago' for true)
  data_pagamento: z.date().nullable().optional(),
  // Forma de pagamento (opcional, mas obrigatório se 'pago' for true)
  forma_pagamento: z.enum(formasPagamento).nullable().optional(),
})
// Aplica validação refinada para campos condicionais de pagamento
.superRefine((data, ctx) => {
  // Se a despesa está marcada como paga
  if (data.pago) {
    // Verifica se a data de pagamento foi fornecida
    if (!data.data_pagamento) {
      // Adiciona um erro ao campo data_pagamento
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: t("messages.requiredField"), 
        path: ["data_pagamento"], // Campo que gerou o erro
      });
    }
    // Verifica se a forma de pagamento foi fornecida
    if (!data.forma_pagamento) {
       // Adiciona um erro ao campo forma_pagamento
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: t("messages.requiredField"), 
        path: ["forma_pagamento"], // Campo que gerou o erro
      });
    }
  }
});

// Exporta o tipo inferido do schema para uso no formulário
export type DespesaFormValues = z.infer<typeof despesaSchema>;
