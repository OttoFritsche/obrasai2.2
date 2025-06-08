export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      ai_insights: {
        Row: {
          created_at: string
          generated_at: string
          id: string
          insight_data: Json | null
          insight_type: string
          obra_id: string
          summary_ptbr: string | null
          tenant_id: string | null
        }
        Insert: {
          created_at?: string
          generated_at?: string
          id?: string
          insight_data?: Json | null
          insight_type: string
          obra_id: string
          summary_ptbr?: string | null
          tenant_id?: string | null
        }
        Update: {
          created_at?: string
          generated_at?: string
          id?: string
          insight_data?: Json | null
          insight_type?: string
          obra_id?: string
          summary_ptbr?: string | null
          tenant_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ai_insights_obra_id_fkey"
            columns: ["obra_id"]
            isOneToOne: false
            referencedRelation: "obras"
            referencedColumns: ["id"]
          },
        ]
      }
      despesas: {
        Row: {
          categoria: Database["public"]["Enums"]["categoria_enum"] | null
          created_at: string
          custo: number
          data_despesa: string
          data_pagamento: string | null
          descricao: string
          etapa: Database["public"]["Enums"]["etapa_enum"] | null
          forma_pagamento: string | null
          fornecedor_pf_id: string | null
          fornecedor_pj_id: string | null
          id: string
          insumo: Database["public"]["Enums"]["insumo_enum"] | null
          numero_nf: string | null
          obra_id: string
          observacoes: string | null
          pago: boolean
          quantidade: number
          tenant_id: string | null
          unidade: string | null
          updated_at: string
          usuario_id: string | null
          valor_unitario: number
        }
        Insert: {
          categoria?: Database["public"]["Enums"]["categoria_enum"] | null
          created_at?: string
          custo: number
          data_despesa?: string
          data_pagamento?: string | null
          descricao: string
          etapa?: Database["public"]["Enums"]["etapa_enum"] | null
          forma_pagamento?: string | null
          fornecedor_pf_id?: string | null
          fornecedor_pj_id?: string | null
          id?: string
          insumo?: Database["public"]["Enums"]["insumo_enum"] | null
          numero_nf?: string | null
          obra_id: string
          observacoes?: string | null
          pago?: boolean
          quantidade?: number
          tenant_id?: string | null
          unidade?: string | null
          updated_at?: string
          usuario_id?: string | null
          valor_unitario: number
        }
        Update: {
          categoria?: Database["public"]["Enums"]["categoria_enum"] | null
          created_at?: string
          custo?: number
          data_despesa?: string
          data_pagamento?: string | null
          descricao?: string
          etapa?: Database["public"]["Enums"]["etapa_enum"] | null
          forma_pagamento?: string | null
          fornecedor_pf_id?: string | null
          fornecedor_pj_id?: string | null
          id?: string
          insumo?: Database["public"]["Enums"]["insumo_enum"] | null
          numero_nf?: string | null
          obra_id?: string
          observacoes?: string | null
          pago?: boolean
          quantidade?: number
          tenant_id?: string | null
          unidade?: string | null
          updated_at?: string
          usuario_id?: string | null
          valor_unitario?: number
        }
        Relationships: [
          {
            foreignKeyName: "despesas_fornecedor_pf_id_fkey"
            columns: ["fornecedor_pf_id"]
            isOneToOne: false
            referencedRelation: "fornecedores_pf"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "despesas_fornecedor_pj_id_fkey"
            columns: ["fornecedor_pj_id"]
            isOneToOne: false
            referencedRelation: "fornecedores_pj"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "despesas_obra_id_fkey"
            columns: ["obra_id"]
            isOneToOne: false
            referencedRelation: "obras"
            referencedColumns: ["id"]
          },
        ]
      }
      fornecedores_pf: {
        Row: {
          bairro: string | null
          cep: string | null
          cidade: string | null
          complemento: string | null
          cpf: string
          created_at: string
          data_nascimento: string | null
          email: string | null
          endereco: string | null
          estado: string | null
          id: string
          nome: string
          numero: string | null
          observacoes: string | null
          rg: string | null
          telefone_principal: string | null
          telefone_secundario: string | null
          tenant_id: string | null
          tipo_fornecedor: string | null
          updated_at: string
          usuario_id: string | null
        }
        Insert: {
          bairro?: string | null
          cep?: string | null
          cidade?: string | null
          complemento?: string | null
          cpf: string
          created_at?: string
          data_nascimento?: string | null
          email?: string | null
          endereco?: string | null
          estado?: string | null
          id?: string
          nome: string
          numero?: string | null
          observacoes?: string | null
          rg?: string | null
          telefone_principal?: string | null
          telefone_secundario?: string | null
          tenant_id?: string | null
          tipo_fornecedor?: string | null
          updated_at?: string
          usuario_id?: string | null
        }
        Update: {
          bairro?: string | null
          cep?: string | null
          cidade?: string | null
          complemento?: string | null
          cpf?: string
          created_at?: string
          data_nascimento?: string | null
          email?: string | null
          endereco?: string | null
          estado?: string | null
          id?: string
          nome?: string
          numero?: string | null
          observacoes?: string | null
          rg?: string | null
          telefone_principal?: string | null
          telefone_secundario?: string | null
          tenant_id?: string | null
          tipo_fornecedor?: string | null
          updated_at?: string
          usuario_id?: string | null
        }
        Relationships: []
      }
      fornecedores_pj: {
        Row: {
          bairro: string | null
          cep: string | null
          cidade: string | null
          cnpj: string
          complemento: string | null
          created_at: string
          email: string | null
          endereco: string | null
          estado: string | null
          id: string
          inscricao_estadual: string | null
          inscricao_municipal: string | null
          nome_fantasia: string | null
          numero: string | null
          observacoes: string | null
          razao_social: string
          telefone_principal: string | null
          telefone_secundario: string | null
          tenant_id: string | null
          updated_at: string
          usuario_id: string | null
          website: string | null
        }
        Insert: {
          bairro?: string | null
          cep?: string | null
          cidade?: string | null
          cnpj: string
          complemento?: string | null
          created_at?: string
          email?: string | null
          endereco?: string | null
          estado?: string | null
          id?: string
          inscricao_estadual?: string | null
          inscricao_municipal?: string | null
          nome_fantasia?: string | null
          numero?: string | null
          observacoes?: string | null
          razao_social: string
          telefone_principal?: string | null
          telefone_secundario?: string | null
          tenant_id?: string | null
          updated_at?: string
          usuario_id?: string | null
          website?: string | null
        }
        Update: {
          bairro?: string | null
          cep?: string | null
          cidade?: string | null
          cnpj?: string
          complemento?: string | null
          created_at?: string
          email?: string | null
          endereco?: string | null
          estado?: string | null
          id?: string
          inscricao_estadual?: string | null
          inscricao_municipal?: string | null
          nome_fantasia?: string | null
          numero?: string | null
          observacoes?: string | null
          razao_social?: string
          telefone_principal?: string | null
          telefone_secundario?: string | null
          tenant_id?: string | null
          updated_at?: string
          usuario_id?: string | null
          website?: string | null
        }
        Relationships: []
      }
      obras: {
        Row: {
          cep: string
          cidade: string
          created_at: string
          data_inicio: string | null
          data_prevista_termino: string | null
          endereco: string
          estado: string
          id: string
          nome: string
          orcamento: number
          tenant_id: string | null
          updated_at: string
          usuario_id: string
        }
        Insert: {
          cep: string
          cidade: string
          created_at?: string
          data_inicio?: string | null
          data_prevista_termino?: string | null
          endereco: string
          estado: string
          id?: string
          nome: string
          orcamento?: number
          tenant_id?: string | null
          updated_at?: string
          usuario_id: string
        }
        Update: {
          cep?: string
          cidade?: string
          created_at?: string
          data_inicio?: string | null
          data_prevista_termino?: string | null
          endereco?: string
          estado?: string
          id?: string
          nome?: string
          orcamento?: number
          tenant_id?: string | null
          updated_at?: string
          usuario_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          cpf: string | null
          created_at: string
          data_nascimento: string | null
          first_name: string | null
          id: string
          last_name: string | null
          role: string
          telefone: string | null
          tenant_id: string
          updated_at: string
        }
        Insert: {
          cpf?: string | null
          created_at?: string
          data_nascimento?: string | null
          first_name?: string | null
          id: string
          last_name?: string | null
          role?: string
          telefone?: string | null
          tenant_id: string
          updated_at?: string
        }
        Update: {
          cpf?: string | null
          created_at?: string
          data_nascimento?: string | null
          first_name?: string | null
          id?: string
          last_name?: string | null
          role?: string
          telefone?: string | null
          tenant_id?: string
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      categoria_enum:
        | "MATERIAL_CONSTRUCAO"
        | "MAO_DE_OBRA"
        | "ALUGUEL_EQUIPAMENTOS"
        | "TRANSPORTE_FRETE"
        | "TAXAS_LICENCAS"
        | "SERVICOS_TERCEIRIZADOS"
        | "ADMINISTRATIVO"
        | "IMPREVISTOS"
        | "PROJETO_ARQUITETONICO"
        | "PROJETO_ESTRUTURAL"
        | "PROJETO_ELETRICO"
        | "PROJETO_HIDRAULICO"
        | "TAXAS_LEGAIS"
        | "DOCUMENTACAO"
        | "SEGURO_OBRA"
        | "MARKETING_VENDAS"
        | "CUSTOS_FINANCEIROS"
        | "SEGURANCA_TRABALHO"
        | "OUTROS"
      etapa_enum:
        | "PLANEJAMENTO"
        | "DEMOLICAO"
        | "TERRAPLANAGEM"
        | "FUNDACAO"
        | "ESTRUTURA"
        | "ALVENARIA"
        | "COBERTURA"
        | "INSTALACOES_ELETRICAS"
        | "INSTALACOES_HIDRAULICAS"
        | "INSTALACOES_GAS"
        | "INSTALACOES_AR_CONDICIONADO"
        | "AUTOMACAO"
        | "REVESTIMENTOS_INTERNOS"
        | "REVESTIMENTOS_EXTERNOS"
        | "PINTURA"
        | "ACABAMENTOS"
        | "PAISAGISMO"
        | "LIMPEZA_POS_OBRA"
        | "ENTREGA_VISTORIA"
        | "DOCUMENTACAO"
        | "OUTROS"
        | "ADAPTACAO_ESTRUTURAL"
        | "RECUPERACAO_ESTRUTURAL"
        | "READEQUACAO_INSTALACOES"
      insumo_enum:
        | "CONCRETO_USINADO"
        | "ACO_CA50"
        | "FORMA_MADEIRA"
        | "ESCAVACAO"
        | "IMPERMEABILIZACAO_FUND"
        | "IMPERMEABILIZANTE_ASFALTICO"
        | "LASTRO_BRITA"
        | "CONCRETO_MAGRO"
        | "ACO_CA60"
        | "TELA_SOLDADA"
        | "ESPAÇADOR_ACO"
        | "LAJE_PRE_MOLDADA"
        | "VIGA_CONCRETO"
        | "PILAR_CONCRETO"
        | "TIJOLO_CERAMICO"
        | "BLOCO_CONCRETO"
        | "TIJOLO_ECOLOGICO"
        | "BLOCO_CELULAR"
        | "ARGAMASSA_ASSENTAMENTO"
        | "CIMENTO_CP2"
        | "CIMENTO_CP5"
        | "CAL_HIDRATADA"
        | "AREIA_MEDIA_LAVADA"
        | "BRITA_0"
        | "VERGA_CONTRAVERGA"
        | "TELHA_CERAMICA"
        | "TELHA_FIBROCIMENTO"
        | "TELHA_CONCRETO"
        | "TELHA_METALICA"
        | "MADEIRAMENTO_TELHADO"
        | "MANTA_SUBCOBERTURA"
        | "RUFO_CALHA"
        | "IMPERMEABILIZACAO_LAJE"
        | "FIO_CABO_ELETRICO"
        | "ELETRODUTO"
        | "QUADRO_DISTRIBUICAO"
        | "DISJUNTOR"
        | "TOMADA_INTERRUPTOR"
        | "LUMINARIA"
        | "CABO_REDE_CAT6"
        | "CABO_COAXIAL"
        | "INTERFONE"
        | "SENSOR_PRESENCA"
        | "TUBO_PVC_ESGOTO"
        | "TUBO_PVC_AGUA_FRIA"
        | "TUBO_CPVC_AGUA_QUENTE"
        | "TUBO_PEX_AGUA_QUENTE"
        | "CONEXOES_HIDRAULICAS"
        | "CAIXA_DAGUA"
        | "CAIXA_GORDURA"
        | "CAIXA_INSPECAO"
        | "LOUCAS_METAIS"
        | "AQUECEDOR_AGUA"
        | "REGISTRO_GAVETA"
        | "REGISTRO_PRESSAO"
        | "FILTRO_AGUA"
        | "CHAPISCO"
        | "EMBOCO"
        | "REBOCO"
        | "GESSO_LISO"
        | "AZULEJO"
        | "PISO_CERAMICO"
        | "PORCELANATO"
        | "PISO_LAMINADO"
        | "PISO_VINILICO"
        | "RODAPE"
        | "REJUNTE_EPOXI"
        | "REJUNTE_ACRILICO"
        | "FORRO_PVC"
        | "FORRO_GESSO_ACARTONADO"
        | "REVESTIMENTO_FACHADA"
        | "TEXTURA_GRAFIATO"
        | "PISO_EXTERNO"
        | "IMPERMEABILIZANTE_PAREDE"
        | "MASSA_CORRIDA_PVA"
        | "MASSA_ACRILICA"
        | "SELADOR_ACRILICO"
        | "TINTA_LATEX_PVA"
        | "TINTA_ACRILICA"
        | "VERNIZ"
        | "LIXA"
        | "FITA_CREPE"
        | "ROLO_PINTURA"
        | "TRINCHA_PINCEL"
        | "SOLVENTE_THINNER"
        | "PORTA_MADEIRA"
        | "PORTA_ALUMINIO"
        | "JANELA_MADEIRA"
        | "JANELA_ALUMINIO"
        | "JANELA_VIDRO"
        | "BANCADA_GRANITO"
        | "SOLEIRA_PEITORIL"
        | "VIDRO_COMUM"
        | "ESPELHO"
        | "BOX_BANHEIRO"
        | "FECHADURA_DOBRADICA"
        | "GUARDA_CORPO"
        | "TERRA_ADUBADA"
        | "GRAMA"
        | "MUDA_PLANTA"
        | "PEDRA_DECORATIVA"
        | "LIMITADOR_GRAMA"
        | "SISTEMA_IRRIGACAO"
        | "ILUMINACAO_JARDIM"
        | "PROJETO_ARQUITETONICO"
        | "PROJETO_ESTRUTURAL"
        | "PROJETO_ELETRICO"
        | "PROJETO_HIDRAULICO"
        | "ART_RRT"
        | "TAXA_PREFEITURA"
        | "TAXA_CARTORIO"
        | "ISS"
        | "SEGURO_OBRA"
        | "CONSULTORIA_ESPECIALIZADA"
        | "PEDREIRO"
        | "SERVENTE"
        | "ELETRICISTA"
        | "ENCANADOR"
        | "PINTOR"
        | "GESSEIRO"
        | "CARPINTEIRO"
        | "MARMORISTA"
        | "VIDRACEIRO"
        | "SERRALHEIRO"
        | "JARDINEIRO"
        | "MESTRE_OBRAS"
        | "ENGENHEIRO_ARQUITETO"
        | "AJUDANTE_GERAL"
        | "BETONEIRA"
        | "ANDAIME"
        | "MARTELETE"
        | "ESCORA"
        | "COMPACTADOR_SOLO"
        | "ESMERILHADEIRA"
        | "GERADOR_ENERGIA"
        | "BOMBA_SUBMERSA"
        | "EPI"
        | "FERRAMENTA"
        | "PLACAS_SINALIZACAO"
        | "AGUA_OBRA"
        | "LUZ_OBRA"
        | "LIMPEZA_OBRA"
        | "CONTAINER_ENTULHO"
        | "CONSUMIVEIS_ESCRITORIO"
        | "ALIMENTACAO_EQUIPE"
        | "TRANSPORTE_EQUIPE"
        | "TAXAS_BANCARIAS"
        | "OUTROS"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      categoria_enum: [
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
        "OUTROS",
      ],
      etapa_enum: [
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
        "OUTROS",
        "ADAPTACAO_ESTRUTURAL",
        "RECUPERACAO_ESTRUTURAL",
        "READEQUACAO_INSTALACOES",
      ],
      insumo_enum: [
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
        "OUTROS",
      ],
    },
  },
} as const 