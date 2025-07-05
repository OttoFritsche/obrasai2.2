import { z } from "zod";

import { Constants } from "@/integrations/supabase/types";
import { t } from "@/lib/i18n";

// Define as opções válidas para forma de pagamento
export const formasPagamento = [
  "PIX",
  "Cartão de Crédito",
  "Cartão de Débito",
  "Boleto Bancário",
  "Transferência Bancária",
  "Dinheiro",
] as const; // Usa 'as const' para criar um tipo literal readonly

// ✅ Define os enum types baseados no schema do banco de dados
// ⚠️  IMPORTANTE: Usando apenas valores básicos testados para evitar erros de enum
// 🔧 TODO: Sincronizar completamente com o banco após verificar enums PostgreSQL
// 📍 Referência: src/integrations/supabase/types.ts - Database.public.Enums
const CategoriaEnum = z.enum([...Constants.public.Enums.categoria_enum] as [
  ...typeof Constants.public.Enums.categoria_enum,
]);

const EtapaEnum = z.enum([...Constants.public.Enums.etapa_enum] as [
  ...typeof Constants.public.Enums.etapa_enum,
]);

const InsumoEnum = z.enum([...Constants.public.Enums.insumo_enum] as [
  ...typeof Constants.public.Enums.insumo_enum,
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
  // Insumo customizado (opcional, para insumos não-SINAPI)
  insumo_customizado: z.string().nullable().optional(),
  // Código SINAPI de referência (opcional, para comparação)
  sinapi_codigo: z.string().nullable().optional(),
  // ID de referência SINAPI (opcional, para vinculação)
  sinapi_referencia_id: z.string().nullable().optional(),
  // Etapa (opcional, baseado no enum)
  etapa: EtapaEnum.nullable().optional(),
  // Categoria (opcional, baseado no enum)
  categoria: CategoriaEnum.nullable().optional(),
  // Unidade de medida (opcional)
  unidade: z.string().nullable().optional(),
  // Quantidade (obrigatório, número positivo)
  quantidade: z.coerce.number().positive({
    message: t("messages.positiveNumber"),
  })
    .min(0.01, { message: t("messages.positiveNumber") }),
  // Valor unitário (obrigatório, número positivo)
  valor_unitario: z.coerce.number().positive({
    message: t("messages.positiveNumber"),
  })
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
    console.log('🔍 Validação superRefine - dados:', { 
      pago: data.pago, 
      data_pagamento: data.data_pagamento,
      forma_pagamento: data.forma_pagamento 
    });
    
    // Se a despesa está marcada como paga
    if (data.pago) {
      console.log('✅ Despesa marcada como paga, validando campos obrigatórios...');
      
      // Verifica se a data de pagamento foi fornecida
      if (!data.data_pagamento) {
        console.log('❌ Data de pagamento ausente');
        // Adiciona um erro ao campo data_pagamento
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: t("messages.requiredField"),
          path: ["data_pagamento"], // Campo que gerou o erro
        });
      } else {
        console.log('✅ Data de pagamento presente:', data.data_pagamento);
      }
      
      // Verifica se a forma de pagamento foi fornecida
      if (!data.forma_pagamento) {
        console.log('❌ Forma de pagamento ausente');
        // Adiciona um erro ao campo forma_pagamento
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: t("messages.requiredField"),
          path: ["forma_pagamento"], // Campo que gerou o erro
        });
      } else {
        console.log('✅ Forma de pagamento presente:', data.forma_pagamento);
      }
    } else {
      console.log('ℹ️ Despesa não marcada como paga, campos de pagamento opcionais');
    }
  });

// Exporta o tipo inferido do schema para uso no formulário
export type DespesaFormValues = z.infer<typeof despesaSchema>;
