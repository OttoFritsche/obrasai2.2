export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      ai_insights: {
        Row: {
          created_at: string;
          generated_at: string;
          id: string;
          insight_data: Json | null;
          insight_type: string;
          obra_id: string;
          summary_ptbr: string | null;
          tenant_id: string | null;
        };
        Insert: {
          created_at?: string;
          generated_at?: string;
          id?: string;
          insight_data?: Json | null;
          insight_type: string;
          obra_id: string;
          summary_ptbr?: string | null;
          tenant_id?: string | null;
        };
        Update: {
          created_at?: string;
          generated_at?: string;
          id?: string;
          insight_data?: Json | null;
          insight_type?: string;
          obra_id?: string;
          summary_ptbr?: string | null;
          tenant_id?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "ai_insights_obra_id_fkey";
            columns: ["obra_id"];
            isOneToOne: false;
            referencedRelation: "obras";
            referencedColumns: ["id"];
          },
        ];
      };
      alertas_desvio: {
        Row: {
          created_at: string;
          data_alerta: string;
          desvio_percentual: number;
          id: string;
          obra_id: string;
          status: string;
          tenant_id: string | null;
          tipo_desvio: string;
          valor_atual: number;
          valor_orcado: number;
        };
        Insert: {
          created_at?: string;
          data_alerta?: string;
          desvio_percentual: number;
          id?: string;
          obra_id: string;
          status?: string;
          tenant_id?: string | null;
          tipo_desvio: string;
          valor_atual: number;
          valor_orcado: number;
        };
        Update: {
          created_at?: string;
          data_alerta?: string;
          desvio_percentual?: number;
          id?: string;
          obra_id?: string;
          status?: string;
          tenant_id?: string | null;
          tipo_desvio?: string;
          valor_atual?: number;
          valor_orcado?: number;
        };
        Relationships: [
          {
            foreignKeyName: "alertas_desvio_obra_id_fkey";
            columns: ["obra_id"];
            isOneToOne: false;
            referencedRelation: "obras";
            referencedColumns: ["id"];
          },
        ];
      };
      configuracoes_alerta_avancadas: {
        Row: {
          id: string;
          obra_id: string;
          usuario_id: string;
          tenant_id: string | null;
          threshold_baixo: number;
          threshold_medio: number;
          threshold_alto: number;
          threshold_critico: number;
          notificar_email: boolean;
          notificar_dashboard: boolean;
          notificar_webhook: boolean;
          webhook_url: string | null;
          alertas_por_categoria: boolean;
          alertas_por_etapa: boolean;
          frequencia_verificacao: number;
          ativo: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          obra_id: string;
          usuario_id: string;
          tenant_id?: string | null;
          threshold_baixo?: number;
          threshold_medio?: number;
          threshold_alto?: number;
          threshold_critico?: number;
          notificar_email?: boolean;
          notificar_dashboard?: boolean;
          notificar_webhook?: boolean;
          webhook_url?: string | null;
          alertas_por_categoria?: boolean;
          alertas_por_etapa?: boolean;
          frequencia_verificacao?: number;
          ativo?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          obra_id?: string;
          usuario_id?: string;
          tenant_id?: string | null;
          threshold_baixo?: number;
          threshold_medio?: number;
          threshold_alto?: number;
          threshold_critico?: number;
          notificar_email?: boolean;
          notificar_dashboard?: boolean;
          notificar_webhook?: boolean;
          webhook_url?: string | null;
          alertas_por_categoria?: boolean;
          alertas_por_etapa?: boolean;
          frequencia_verificacao?: number;
          ativo?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "configuracoes_alerta_avancadas_obra_id_fkey";
            columns: ["obra_id"];
            isOneToOne: false;
            referencedRelation: "obras";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "configuracoes_alerta_avancadas_usuario_id_fkey";
            columns: ["usuario_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      despesas: {
        Row: {
          categoria: string | null;
          created_at: string;
          data_despesa: string;
          descricao: string | null;
          etapa: string | null;
          fornecedor: string | null;
          id: string;
          insumo: string | null;
          obra_id: string;
          tenant_id: string | null;
          tipo_despesa: string | null;
          updated_at: string | null;
          valor: number;
        };
        Insert: {
          categoria?: string | null;
          created_at?: string;
          data_despesa: string;
          descricao?: string | null;
          etapa?: string | null;
          fornecedor?: string | null;
          id?: string;
          insumo?: string | null;
          obra_id: string;
          tenant_id?: string | null;
          tipo_despesa?: string | null;
          updated_at?: string | null;
          valor: number;
        };
        Update: {
          categoria?: string | null;
          created_at?: string;
          data_despesa?: string;
          descricao?: string | null;
          etapa?: string | null;
          fornecedor?: string | null;
          id?: string;
          insumo?: string | null;
          obra_id?: string;
          tenant_id?: string | null;
          tipo_despesa?: string | null;
          updated_at?: string | null;
          valor?: number;
        };
        Relationships: [
          {
            foreignKeyName: "despesas_obra_id_fkey";
            columns: ["obra_id"];
            isOneToOne: false;
            referencedRelation: "obras";
            referencedColumns: ["id"];
          },
        ];
      };
      fornecedores_pf: {
        Row: {
          bairro: string | null;
          cep: string | null;
          cidade: string | null;
          cpf: string;
          created_at: string;
          email: string | null;
          endereco: string | null;
          estado: string | null;
          id: string;
          nome: string;
          obra_id: string;
          telefone: string | null;
          tenant_id: string | null;
          updated_at: string | null;
        };
        Insert: {
          bairro?: string | null;
          cep?: string | null;
          cidade?: string | null;
          cpf: string;
          created_at?: string;
          email?: string | null;
          endereco?: string | null;
          estado?: string | null;
          id?: string;
          nome: string;
          obra_id: string;
          telefone?: string | null;
          tenant_id?: string | null;
          updated_at?: string | null;
        };
        Update: {
          bairro?: string | null;
          cep?: string | null;
          cidade?: string | null;
          cpf?: string;
          created_at?: string;
          email?: string | null;
          endereco?: string | null;
          estado?: string | null;
          id?: string;
          nome?: string;
          obra_id?: string;
          telefone?: string | null;
          tenant_id?: string | null;
          updated_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "fornecedores_pf_obra_id_fkey";
            columns: ["obra_id"];
            isOneToOne: false;
            referencedRelation: "obras";
            referencedColumns: ["id"];
          },
        ];
      };
      fornecedores_pj: {
        Row: {
          bairro: string | null;
          cep: string | null;
          cidade: string | null;
          cnpj: string;
          created_at: string;
          email: string | null;
          endereco: string | null;
          estado: string | null;
          id: string;
          nome_fantasia: string | null;
          obra_id: string;
          razao_social: string;
          telefone: string | null;
          tenant_id: string | null;
          updated_at: string | null;
        };
        Insert: {
          bairro?: string | null;
          cep?: string | null;
          cidade?: string | null;
          cnpj: string;
          created_at?: string;
          email?: string | null;
          endereco?: string | null;
          estado?: string | null;
          id?: string;
          nome_fantasia?: string | null;
          obra_id: string;
          razao_social: string;
          telefone?: string | null;
          tenant_id?: string | null;
          updated_at?: string | null;
        };
        Update: {
          bairro?: string | null;
          cep?: string | null;
          cidade?: string | null;
          cnpj?: string;
          created_at?: string;
          email?: string | null;
          endereco?: string | null;
          estado?: string | null;
          id?: string;
          nome_fantasia?: string | null;
          obra_id?: string;
          razao_social?: string;
          telefone?: string | null;
          tenant_id?: string | null;
          updated_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "fornecedores_pj_obra_id_fkey";
            columns: ["obra_id"];
            isOneToOne: false;
            referencedRelation: "obras";
            referencedColumns: ["id"];
          },
        ];
      };
      notificacoes_alertas: {
        Row: {
          id: string;
          alerta_id: string;
          usuario_id: string;
          tenant_id: string | null;
          tipo_notificacao: string;
          status: string;
          titulo: string;
          mensagem: string;
          dados_extras: Json | null;
          tentativas: number;
          max_tentativas: number;
          enviada_em: string | null;
          lida_em: string | null;
          lida: boolean | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          alerta_id: string;
          usuario_id: string;
          tenant_id?: string | null;
          tipo_notificacao: string;
          status?: string;
          titulo: string;
          mensagem: string;
          dados_extras?: Json | null;
          tentativas?: number;
          max_tentativas?: number;
          enviada_em?: string | null;
          lida_em?: string | null;
          lida?: boolean | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          alerta_id?: string;
          usuario_id?: string;
          tenant_id?: string | null;
          tipo_notificacao?: string;
          status?: string;
          titulo?: string;
          mensagem?: string;
          dados_extras?: Json | null;
          tentativas?: number;
          max_tentativas?: number;
          enviada_em?: string | null;
          lida_em?: string | null;
          lida?: boolean | null;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "notificacoes_alertas_alerta_id_fkey";
            columns: ["alerta_id"];
            isOneToOne: false;
            referencedRelation: "alertas_desvio";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "notificacoes_alertas_usuario_id_fkey";
            columns: ["usuario_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      obras: {
        Row: {
          bairro: string | null;
          cep: string | null;
          cidade: string | null;
          created_at: string;
          data_fim: string | null;
          data_inicio: string;
          descricao: string | null;
          endereco: string | null;
          estado: string | null;
          id: string;
          nome: string;
          orcamento_total: number | null;
          status: string | null;
          tenant_id: string | null;
          updated_at: string | null;
        };
        Insert: {
          bairro?: string | null;
          cep?: string | null;
          cidade?: string | null;
          created_at?: string;
          data_fim?: string | null;
          data_inicio: string;
          descricao?: string | null;
          endereco?: string | null;
          estado?: string | null;
          id?: string;
          nome: string;
          orcamento_total?: number | null;
          status?: string | null;
          tenant_id?: string | null;
          updated_at?: string | null;
        };
        Update: {
          bairro?: string | null;
          cep?: string | null;
          cidade?: string | null;
          created_at?: string;
          data_fim?: string | null;
          data_inicio?: string;
          descricao?: string | null;
          endereco?: string | null;
          estado?: string | null;
          id?: string;
          nome?: string;
          orcamento_total?: number | null;
          status?: string | null;
          tenant_id?: string | null;
          updated_at?: string | null;
        };
        Relationships: [];
      };
      construtoras: {
        Row: {
          id: string;
          tenant_id: string;
          tipo: string;
          nome_razao_social: string;
          nome_fantasia: string | null;
          documento: string;
          inscricao_estadual: string | null;
          email: string | null;
          telefone: string | null;
          endereco: string | null;
          numero: string | null;
          complemento: string | null;
          bairro: string | null;
          cidade: string | null;
          estado: string | null;
          cep: string | null;
          responsavel_tecnico: string | null;
          documento_responsavel: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          tenant_id: string;
          tipo: string;
          nome_razao_social: string;
          nome_fantasia?: string | null;
          documento: string;
          inscricao_estadual?: string | null;
          email?: string | null;
          telefone?: string | null;
          endereco?: string | null;
          numero?: string | null;
          complemento?: string | null;
          bairro?: string | null;
          cidade?: string | null;
          estado?: string | null;
          cep?: string | null;
          responsavel_tecnico?: string | null;
          documento_responsavel?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          tenant_id?: string;
          tipo?: string;
          nome_razao_social?: string;
          nome_fantasia?: string | null;
          documento?: string;
          inscricao_estadual?: string | null;
          email?: string | null;
          telefone?: string | null;
          endereco?: string | null;
          numero?: string | null;
          complemento?: string | null;
          bairro?: string | null;
          cidade?: string | null;
          estado?: string | null;
          cep?: string | null;
          responsavel_tecnico?: string | null;
          documento_responsavel?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      profiles: {
        Row: {
          avatar_url: string | null;
          created_at: string;
          email: string | null;
          full_name: string | null;
          id: string;
          tenant_id: string | null;
          updated_at: string | null;
        };
        Insert: {
          avatar_url?: string | null;
          created_at?: string;
          email?: string | null;
          full_name?: string | null;
          id: string;
          tenant_id?: string | null;
          updated_at?: string | null;
        };
        Update: {
          avatar_url?: string | null;
          created_at?: string;
          email?: string | null;
          full_name?: string | null;
          id?: string;
          tenant_id?: string | null;
          updated_at?: string | null;
        };
        Relationships: [];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      calcular_desvios_todas_obras: {
        Args: Record<PropertyKey, never>;
        Returns: {
          obra_id: string;
          nome_obra: string;
          orcamento_total: number;
          total_gasto: number;
          desvio_percentual: number;
          status_obra: string;
        }[];
      };
    };
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
        | "OUTROS"
        | "DEMOLICAO_REMOCAO"
        | "PROTECAO_ESTRUTURAL"
        | "AQUISICAO_TERRENO_AREA"
        | "AQUISICAO_IMOVEL_REFORMA_LEILAO";
      insumo_enum:
        | "CIMENTO"
        | "AREIA"
        | "BRITA"
        | "FERRO"
        | "MADEIRA"
        | "TIJOLO"
        | "TELHA"
        | "TINTA"
        | "OUTROS";
      etapa_enum:
        | "FUNDACAO"
        | "ESTRUTURA"
        | "ALVENARIA"
        | "COBERTURA"
        | "INSTALACOES"
        | "ACABAMENTO"
        | "OUTROS";
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
}

type PublicSchema = Database[keyof Database];

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (
      & Database[PublicTableNameOrOptions["schema"]]["Tables"]
      & Database[PublicTableNameOrOptions["schema"]]["Views"]
    )
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database } ? (
    & Database[PublicTableNameOrOptions["schema"]]["Tables"]
    & Database[PublicTableNameOrOptions["schema"]]["Views"]
  )[TableName] extends {
    Row: infer R;
  } ? R
  : never
  : PublicTableNameOrOptions extends keyof (
    & PublicSchema["Tables"]
    & PublicSchema["Views"]
  ) ? (
      & PublicSchema["Tables"]
      & PublicSchema["Views"]
    )[PublicTableNameOrOptions] extends {
      Row: infer R;
    } ? R
    : never
  : never;

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
    Insert: infer I;
  } ? I
  : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
      Insert: infer I;
    } ? I
    : never
  : never;

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
    Update: infer U;
  } ? U
  : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
      Update: infer U;
    } ? U
    : never
  : never;

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
  : never;

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database;
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]][
      "CompositeTypes"
    ]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][
    CompositeTypeName
  ]
  : PublicCompositeTypeNameOrOptions extends
    keyof PublicSchema["CompositeTypes"]
    ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
  : never;

// Constants object for accessing enums
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
        "OUTROS",
        "DEMOLICAO_REMOCAO",
        "PROTECAO_ESTRUTURAL",
        "AQUISICAO_TERRENO_AREA",
        "AQUISICAO_IMOVEL_REFORMA_LEILAO",
      ] as const,
      insumo_enum: [
        "CIMENTO",
        "AREIA",
        "BRITA",
        "FERRO",
        "MADEIRA",
        "TIJOLO",
        "TELHA",
        "TINTA",
        "OUTROS",
      ] as const,
      etapa_enum: [
        "FUNDACAO",
        "ESTRUTURA",
        "ALVENARIA",
        "COBERTURA",
        "INSTALACOES",
        "ACABAMENTO",
        "OUTROS",
      ] as const,
    },
  },
} as const;
