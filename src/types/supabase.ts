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
      despesas: {
        Row: {
          id: string
          obra_id: string
          usuario_id: string
          fornecedor_pj_id: string | null
          fornecedor_pf_id: string | null
          descricao: string
          data_despesa: string
          insumo: Database["public"]["Enums"]["insumo_enum"] | null
          etapa: Database["public"]["Enums"]["etapa_enum"] | null
          categoria: Database["public"]["Enums"]["categoria_enum"] | null
          unidade: string | null
          quantidade: number
          valor_unitario: number
          custo: number
          numero_nf: string | null
          observacoes: string | null
          pago: boolean | null
          data_pagamento: string | null
          forma_pagamento: Database["public"]["Enums"]["forma_pagamento_enum"] | null
          created_at: string
          updated_at: string
          // Novos campos SINAPI
          codigo_sinapi: string | null
          valor_referencia_sinapi: number | null
          variacao_sinapi: number | null
          fonte_sinapi: string | null
          estado_referencia: string | null
        }
        Insert: {
          id?: string
          obra_id: string
          usuario_id: string
          fornecedor_pj_id?: string | null
          fornecedor_pf_id?: string | null
          descricao: string
          data_despesa: string
          insumo?: Database["public"]["Enums"]["insumo_enum"] | null
          etapa?: Database["public"]["Enums"]["etapa_enum"] | null
          categoria?: Database["public"]["Enums"]["categoria_enum"] | null
          unidade?: string | null
          quantidade: number
          valor_unitario: number
          custo: number
          numero_nf?: string | null
          observacoes?: string | null
          pago?: boolean | null
          data_pagamento?: string | null
          forma_pagamento?: Database["public"]["Enums"]["forma_pagamento_enum"] | null
          created_at?: string
          updated_at?: string
          // Novos campos SINAPI
          codigo_sinapi?: string | null
          valor_referencia_sinapi?: number | null
          variacao_sinapi?: number | null
          fonte_sinapi?: string | null
          estado_referencia?: string | null
        }
        Update: {
          id?: string
          obra_id?: string
          usuario_id?: string
          fornecedor_pj_id?: string | null
          fornecedor_pf_id?: string | null
          descricao?: string
          data_despesa?: string
          insumo?: Database["public"]["Enums"]["insumo_enum"] | null
          etapa?: Database["public"]["Enums"]["etapa_enum"] | null
          categoria?: Database["public"]["Enums"]["categoria_enum"] | null
          unidade?: string | null
          quantidade?: number
          valor_unitario?: number
          custo?: number
          numero_nf?: string | null
          observacoes?: string | null
          pago?: boolean | null
          data_pagamento?: string | null
          forma_pagamento?: Database["public"]["Enums"]["forma_pagamento_enum"] | null
          created_at?: string
          updated_at?: string
          // Novos campos SINAPI
          codigo_sinapi?: string | null
          valor_referencia_sinapi?: number | null
          variacao_sinapi?: number | null
          fonte_sinapi?: string | null
          estado_referencia?: string | null
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
          }
        ]
      }
      // Outras tabelas...
    }
    Views: {
      // Views...
    }
    Functions: {
      buscar_sinapi_unificado: {
        Args: {
          termo_busca?: string
          limite?: number
          offset_param?: number
        }
        Returns: {
          codigo: string
          descricao: string
          unidade: string
          preco_unitario: number
          fonte: string
          estado: string | null
          data_referencia: string | null
        }[]
      }
      buscar_sinapi_por_codigo: {
        Args: {
          codigo_param: string
        }
        Returns: {
          codigo: string
          descricao: string
          unidade: string
          preco_unitario: number
          fonte: string
          estado: string | null
          data_referencia: string | null
        }[]
      }
    }
    Enums: {
      categoria_enum: "material" | "mao_de_obra" | "equipamento" | "servico" | "outros"
      etapa_enum: "fundacao" | "estrutura" | "alvenaria" | "cobertura" | "instalacoes" | "acabamento" | "outros"
      forma_pagamento_enum: "dinheiro" | "pix" | "cartao_credito" | "cartao_debito" | "transferencia" | "boleto" | "cheque" | "outros"
      insumo_enum: "cimento" | "areia" | "brita" | "ferro" | "madeira" | "ceramica" | "tinta" | "eletrico" | "hidraulico" | "outros"
      padrao_obra_enum: "popular" | "normal" | "alto"
      tipo_obra_enum: "residencial" | "comercial" | "industrial" | "publica"
    }
    CompositeTypes: {
      // Composite types...
    }
  }
}

// Tipos auxiliares para SINAPI
export interface SinapiItem {
  codigo: string
  descricao: string
  unidade: string
  preco_unitario: number
  fonte: string
  estado?: string | null
  data_referencia?: string | null
}

export interface SinapiSearchResult {
  items: SinapiItem[]
  total: number
  hasMore: boolean
}