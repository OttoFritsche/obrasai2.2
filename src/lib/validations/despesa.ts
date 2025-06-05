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

// ✅ Define os enum types baseados no schema do banco de dados
// ⚠️  IMPORTANTE: Usando apenas valores básicos testados para evitar erros de enum
// 🔧 TODO: Sincronizar completamente com o banco após verificar enums PostgreSQL
// 📍 Referência: src/integrations/supabase/types.ts - Database.public.Enums
const CategoriaEnum = z.enum([
  "MATERIAL_CONSTRUCAO",
  "MAO_DE_OBRA",
  "ALUGUEL_EQUIPAMENTOS", 
  "TRANSPORTE_FRETE",
  "TAXAS_LICENCAS",
  "SERVICOS_TERCEIRIZADOS",
  "ADMINISTRATIVO", 
  "IMPREVISTOS",
  "PROJETO_ARQUITETONICO",
  "PROJETO_ESTRUTURAL",
  "PROJETO_ELETRICO",
  "PROJETO_HIDRAULICO",
  "TAXAS_LEGAIS",
  "DOCUMENTACAO",
  "SEGURO_OBRA",
  "MARKETING_VENDAS",
  "CUSTOS_FINANCEIROS",
  "SEGURANCA_TRABALHO",
  "OUTROS"
]);

const EtapaEnum = z.enum([
  "PLANEJAMENTO",
  "DEMOLICAO",
  "TERRAPLANAGEM",
  "FUNDACAO",
  "ESTRUTURA", 
  "ALVENARIA",
  "COBERTURA", 
  "INSTALACOES_ELETRICAS",
  "INSTALACOES_HIDRAULICAS",
  "INSTALACOES_GAS",
  "INSTALACOES_AR_CONDICIONADO",
  "AUTOMACAO",
  "REVESTIMENTOS_INTERNOS",
  "REVESTIMENTOS_EXTERNOS", 
  "PINTURA",
  "ACABAMENTOS", 
  "PAISAGISMO",
  "LIMPEZA_POS_OBRA",
  "ENTREGA_VISTORIA",
  "DOCUMENTACAO", 
  "OUTROS"
]);

const InsumoEnum = z.enum([
  "CONCRETO_USINADO",
  "ACO_CA50",
  "FORMA_MADEIRA",
  "ESCAVACAO",
  "IMPERMEABILIZACAO_FUND",
  "IMPERMEABILIZANTE_ASFALTICO",
  "LASTRO_BRITA",
  "CONCRETO_MAGRO",
  "ACO_CA60",
  "TELA_SOLDADA",
  "ESPAÇADOR_ACO",
  "LAJE_PRE_MOLDADA",
  "VIGA_CONCRETO",
  "PILAR_CONCRETO",
  "TIJOLO_CERAMICO",
  "BLOCO_CONCRETO",
  "TIJOLO_ECOLOGICO",
  "BLOCO_CELULAR",
  "ARGAMASSA_ASSENTAMENTO",
  "CIMENTO_CP2",
  "CIMENTO_CP5",
  "CAL_HIDRATADA",
  "AREIA_MEDIA_LAVADA",
  "BRITA_0",
  "VERGA_CONTRAVERGA",
  "TELHA_CERAMICA",
  "TELHA_FIBROCIMENTO",
  "TELHA_CONCRETO",
  "TELHA_METALICA",
  "MADEIRAMENTO_TELHADO",
  "MANTA_SUBCOBERTURA",
  "RUFO_CALHA",
  "IMPERMEABILIZACAO_LAJE",
  "FIO_CABO_ELETRICO",
  "ELETRODUTO",
  "QUADRO_DISTRIBUICAO",
  "DISJUNTOR",
  "TOMADA_INTERRUPTOR",
  "LUMINARIA",
  "CABO_REDE_CAT6",
  "CABO_COAXIAL",
  "INTERFONE",
  "SENSOR_PRESENCA",
  "TUBO_PVC_ESGOTO",
  "TUBO_PVC_AGUA_FRIA",
  "TUBO_CPVC_AGUA_QUENTE",
  "TUBO_PEX_AGUA_QUENTE",
  "CONEXOES_HIDRAULICAS",
  "CAIXA_DAGUA",
  "CAIXA_GORDURA",
  "CAIXA_INSPECAO",
  "LOUCAS_METAIS",
  "AQUECEDOR_AGUA",
  "REGISTRO_GAVETA",
  "REGISTRO_PRESSAO",
  "FILTRO_AGUA",
  "CHAPISCO",
  "EMBOCO",
  "REBOCO",
  "GESSO_LISO",
  "AZULEJO",
  "PISO_CERAMICO",
  "PORCELANATO",
  "PISO_LAMINADO",
  "PISO_VINILICO",
  "RODAPE",
  "REJUNTE_EPOXI",
  "REJUNTE_ACRILICO",
  "FORRO_PVC",
  "FORRO_GESSO_ACARTONADO",
  "REVESTIMENTO_FACHADA",
  "TEXTURA_GRAFIATO",
  "PISO_EXTERNO",
  "IMPERMEABILIZANTE_PAREDE",
  "MASSA_CORRIDA_PVA",
  "MASSA_ACRILICA",
  "SELADOR_ACRILICO",
  "TINTA_LATEX_PVA",
  "TINTA_ACRILICA",
  "VERNIZ",
  "LIXA",
  "FITA_CREPE",
  "ROLO_PINTURA",
  "TRINCHA_PINCEL",
  "SOLVENTE_THINNER",
  "PORTA_MADEIRA",
  "PORTA_ALUMINIO",
  "JANELA_MADEIRA",
  "JANELA_ALUMINIO",
  "JANELA_VIDRO",
  "BANCADA_GRANITO",
  "SOLEIRA_PEITORIL",
  "VIDRO_COMUM",
  "ESPELHO",
  "BOX_BANHEIRO",
  "FECHADURA_DOBRADICA",
  "GUARDA_CORPO",
  "TERRA_ADUBADA",
  "GRAMA",
  "MUDA_PLANTA",
  "PEDRA_DECORATIVA",
  "LIMITADOR_GRAMA",
  "SISTEMA_IRRIGACAO",
  "ILUMINACAO_JARDIM",
  "PROJETO_ARQUITETONICO",
  "PROJETO_ESTRUTURAL",
  "PROJETO_ELETRICO",
  "PROJETO_HIDRAULICO",
  "ART_RRT",
  "TAXA_PREFEITURA",
  "TAXA_CARTORIO",
  "ISS",
  "SEGURO_OBRA",
  "CONSULTORIA_ESPECIALIZADA",
  "PEDREIRO",
  "SERVENTE",
  "ELETRICISTA",
  "ENCANADOR",
  "PINTOR",
  "GESSEIRO",
  "CARPINTEIRO",
  "MARMORISTA",
  "VIDRACEIRO",
  "SERRALHEIRO",
  "JARDINEIRO",
  "MESTRE_OBRAS",
  "ENGENHEIRO_ARQUITETO",
  "AJUDANTE_GERAL",
  "BETONEIRA",
  "ANDAIME",
  "MARTELETE",
  "ESCORA",
  "COMPACTADOR_SOLO",
  "ESMERILHADEIRA",
  "GERADOR_ENERGIA",
  "BOMBA_SUBMERSA",
  "EPI",
  "FERRAMENTA",
  "PLACAS_SINALIZACAO",
  "AGUA_OBRA",
  "LUZ_OBRA",
  "LIMPEZA_OBRA",
  "CONTAINER_ENTULHO",
  "CONSUMIVEIS_ESCRITORIO",
  "ALIMENTACAO_EQUIPE",
  "TRANSPORTE_EQUIPE",
  "TAXAS_BANCARIAS",
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
