import { supabase } from "@/integrations/supabase/client";
import { sanitizeFormData } from "@/lib/input-sanitizer";
import { secureLogger } from "@/lib/secure-logger";
import { unformat } from "@/lib/utils/formatters";
import type { DespesaFormValues } from "@/lib/validations/despesa";
import type {
  FornecedorPFFormValues,
  FornecedorPJFormValues,
} from "@/lib/validations/fornecedor";
import type { NotaFiscalFormValues } from "@/lib/validations/nota-fiscal";
import type { ObraFormValues } from "@/lib/validations/obra";

// Obras API
export const obrasApi = {
  getAll: async (tenantId?: string) => {
    try {
      const { data, error } = await supabase
        .from("obras")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        secureLogger.error("Failed to fetch obras", error, { tenantId });
        throw error;
      }

      return data || [];
    } catch (_error) {
      secureLogger.error("Error in obrasApi.getAll", error, { tenantId });
      throw error;
    }
  },

  getById: async (id: string, tenantId?: string) => {
    try {
      const { data, error } = await supabase
        .from("obras")
        .select("*")
        .eq("id", id)
        .single();

      if (error) {
        secureLogger.error("Failed to fetch obra by ID", error, {
          obraId: id,
          tenantId,
        });
        throw error;
      }

      return data;
    } catch (_error) {
      secureLogger.error("Error in obrasApi.getById", error, {
        obraId: id,
        tenantId,
      });
      throw error;
    }
  },

  create: async (obra: ObraFormValues) => {
    try {
      // Get the current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error("User not authenticated");
      }

      // Buscar o tenant_id do perfil do usuário
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("tenant_id")
        .eq("id", user.id)
        .single();
      if (profileError || !profile?.tenant_id) {
        secureLogger.error("Tenant ID não encontrado ao criar obra", {
          userId: user.id,
          error: profileError,
        });
        throw new Error("Tenant ID não encontrado");
      }

      // ✅ Sanitizar dados de entrada
      const sanitizedObra = sanitizeFormData(obra);

      // ✅ Função auxiliar para converter data para string ISO ou null
      const formatDateForDB = (date: unknown) => {
        if (!date) return null;
        try {
          if (date instanceof Date && !isNaN(date.getTime())) {
            return date.toISOString().split("T")[0];
          }
          if (typeof date === "string" && date.trim() !== "") {
            const dateObj = new Date(date);
            if (!isNaN(dateObj.getTime())) {
              return dateObj.toISOString().split("T")[0];
            }
          }
          if (
            typeof date === "number" ||
            (typeof date === "object" && date !== null)
          ) {
            const dateObj = new Date(date as string | number | Date);
            if (!isNaN(dateObj.getTime())) {
              return dateObj.toISOString().split("T")[0];
            }
          }
          return null;
        } catch (_error) {
          console.warn("❌ Erro ao formatar data (create):", error);
          return null;
        }
      };

      // Preparar dados para inserção
      const dataParaInserir = {
        nome: sanitizedObra.nome,
        endereco: sanitizedObra.endereco,
        cidade: sanitizedObra.cidade,
        estado: sanitizedObra.estado,
        cep: sanitizedObra.cep,
        orcamento_total: sanitizedObra.orcamento,
        data_inicio: formatDateForDB(sanitizedObra.data_inicio),
        data_fim: formatDateForDB(
          sanitizedObra.data_prevista_termino,
        ),
        usuario_id: user.id,
        construtora_id: sanitizedObra.construtora_id,
        tenant_id: profile.tenant_id,
      };

      const { data, error } = await supabase
        .from("obras")
        .insert(dataParaInserir)
        .select()
        .single();

      if (error) {
        secureLogger.error("Failed to create obra", error, {
          userId: user.id,
          tenantId: profile.tenant_id,
        });
        throw error;
      }

      // ✅ Log de sucesso
      secureLogger.info("Obra created successfully", {
        obraId: data.id,
        userId: user.id,
      });

      return data;
    } catch (_error) {
      secureLogger.error("Error in obrasApi.create", _error);
      throw _error;
    }
  },

  update: async (id: string, obra: Partial<ObraFormValues>) => {
    try {
      // ✅ Sanitizar dados de entrada
      const sanitizedObra = sanitizeFormData(obra);

      // ✅ Função auxiliar para converter data para string ISO ou null
      const formatDateForDB = (date: unknown) => {
        if (!date) return null;

        try {
          // Se já for um objeto Date válido
          if (date instanceof Date && !isNaN(date.getTime())) {
            return date.toISOString().split("T")[0];
          }

          // Se for string, tenta converter para Date
          if (typeof date === "string" && date.trim() !== "") {
            const dateObj = new Date(date);
            if (!isNaN(dateObj.getTime())) {
              return dateObj.toISOString().split("T")[0];
            }
          }

          // Se for objeto que pode ser convertido para Date (timestamp, etc)
          if (
            typeof date === "number" ||
            (typeof date === "object" && date !== null)
          ) {
            const dateObj = new Date(date as string | number | Date);
            if (!isNaN(dateObj.getTime())) {
              return dateObj.toISOString().split("T")[0];
            }
          }

          return null;
        } catch (_error) {
          console.warn("❌ Erro ao formatar data (update):", error);
          return null;
        }
      };

      // Mapear campos do formulário para os campos do banco de dados
      const formattedObra = {
        nome: sanitizedObra.nome,
        endereco: sanitizedObra.endereco,
        cidade: sanitizedObra.cidade,
        estado: sanitizedObra.estado,
        cep: sanitizedObra.cep,
        orcamento_total: sanitizedObra.orcamento,
        construtora_id: sanitizedObra.construtora_id,
        data_inicio: formatDateForDB(sanitizedObra.data_inicio),
        data_fim: formatDateForDB(
          sanitizedObra.data_prevista_termino,
        ),
      };

      const { data, error } = await supabase
        .from("obras")
        .update(formattedObra)
        .eq("id", id)
        .select()
        .single();

      if (error) {
        secureLogger.error("Failed to update obra", error, { obraId: id });
        throw error;
      }

      // ✅ Log de sucesso
      secureLogger.info("Obra updated successfully", { obraId: data.id });

      return data;
    } catch (_error) {
      secureLogger.error("Error in obrasApi.update", _error, { obraId: id });
      throw _error;
    }
  },

  delete: async (id: string) => {
    try {
      const { error } = await supabase
        .from("obras")
        .delete()
        .eq("id", id);

      if (error) {
        secureLogger.error("Failed to delete obra", error, { obraId: id });
        throw error;
      }

      // ✅ Log de sucesso
      secureLogger.info("Obra deleted successfully", { obraId: id });

      return true;
    } catch (_error) {
      secureLogger.error("Error in obrasApi.delete", _error, { obraId: id });
      throw _error;
    }
  },
};

// Fornecedores PJ API
export const fornecedoresPJApi = {
  getAll: async (tenantId: string) => {
    try {
      const { data, error } = await supabase
        .from("fornecedores_pj")
        .select("*")
        .eq("tenant_id", tenantId)
        .order("created_at", { ascending: false });

      if (error) {
        secureLogger.error("Failed to fetch fornecedores PJ", error, {
          tenantId,
        });
        throw error;
      }

      return data || [];
    } catch (_error) {
      secureLogger.error("Error in fornecedoresPJApi.getAll", _error, {
        tenantId,
      });
      throw _error;
    }
  },

  getById: async (id: string, tenantId: string) => {
    try {
      const { data, error } = await supabase
        .from("fornecedores_pj")
        .select("*")
        .eq("id", id)
        .eq("tenant_id", tenantId)
        .single();

      if (error) {
        secureLogger.error("Failed to fetch fornecedor PJ by ID", error, {
          fornecedorId: id,
          tenantId,
        });
        throw error;
      }

      return data;
    } catch (_error) {
      secureLogger.error("Error in fornecedoresPJApi.getById", _error, {
        fornecedorId: id,
        tenantId,
      });
      throw _error;
    }
  },

  create: async (fornecedor: FornecedorPJFormValues, tenantId: string) => {
    try {
      // Get the current user
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        throw new Error("User not authenticated");
      }

      // ✅ Sanitizar dados de entrada
      const sanitizedFornecedor = sanitizeFormData(fornecedor);

      // Ensure required fields are present
      if (!sanitizedFornecedor.cnpj || !sanitizedFornecedor.razao_social) {
        throw new Error("CNPJ and Razão Social are required");
      }

      // Remove formatação dos campos antes de salvar no banco
      const unformattedFornecedor = {
        ...sanitizedFornecedor,
        cnpj: unformat(sanitizedFornecedor.cnpj),
        telefone_principal: sanitizedFornecedor.telefone_principal
          ? unformat(sanitizedFornecedor.telefone_principal)
          : null,
        telefone_secundario: sanitizedFornecedor.telefone_secundario
          ? unformat(sanitizedFornecedor.telefone_secundario)
          : null,
        cep: sanitizedFornecedor.cep ? unformat(sanitizedFornecedor.cep) : null,
      };

      const { data, error } = await supabase
        .from("fornecedores_pj")
        .insert({
          ...unformattedFornecedor,
          usuario_id: user.id,
          tenant_id: tenantId,
        })
        .select()
        .single();

      if (error) {
        secureLogger.error("Failed to create fornecedor PJ", error, {
          userId: user.id,
          tenantId,
        });
        throw error;
      }

      // ✅ Log de sucesso
      secureLogger.info("Fornecedor PJ created successfully", {
        fornecedorId: data.id,
        userId: user.id,
      });

      return data;
    } catch (_error) {
      secureLogger.error("Error in fornecedoresPJApi.create", _error, {
        tenantId,
      });
      throw _error;
    }
  },

  update: async (id: string, fornecedor: Partial<FornecedorPJFormValues>) => {
    try {
      // ✅ Sanitizar dados de entrada
      const sanitizedFornecedor = sanitizeFormData(fornecedor);

      // Remove formatação dos campos antes de salvar no banco
      const unformattedFornecedor = {
        ...sanitizedFornecedor,
        cnpj: sanitizedFornecedor.cnpj
          ? unformat(sanitizedFornecedor.cnpj)
          : undefined,
        telefone_principal: sanitizedFornecedor.telefone_principal
          ? unformat(sanitizedFornecedor.telefone_principal)
          : undefined,
        telefone_secundario: sanitizedFornecedor.telefone_secundario
          ? unformat(sanitizedFornecedor.telefone_secundario)
          : undefined,
        cep: sanitizedFornecedor.cep
          ? unformat(sanitizedFornecedor.cep)
          : undefined,
      };

      const { data, error } = await supabase
        .from("fornecedores_pj")
        .update(unformattedFornecedor)
        .eq("id", id)
        .select()
        .single();

      if (error) {
        secureLogger.error("Failed to update fornecedor PJ", error, {
          fornecedorId: id,
        });
        throw error;
      }

      // ✅ Log de sucesso
      secureLogger.info("Fornecedor PJ updated successfully", {
        fornecedorId: data.id,
      });

      return data;
    } catch (_error) {
      secureLogger.error("Error in fornecedoresPJApi.update", _error, {
        fornecedorId: id,
      });
      throw _error;
    }
  },

  delete: async (id: string) => {
    try {
      const { error } = await supabase
        .from("fornecedores_pj")
        .delete()
        .eq("id", id);

      if (error) {
        secureLogger.error("Failed to delete fornecedor PJ", error, {
          fornecedorId: id,
        });
        throw error;
      }

      // ✅ Log de sucesso
      secureLogger.info("Fornecedor PJ deleted successfully", {
        fornecedorId: id,
      });

      return true;
    } catch (_error) {
      secureLogger.error("Error in fornecedoresPJApi.delete", _error, {
        fornecedorId: id,
      });
      throw _error;
    }
  },
};

// Fornecedores PF API
export const fornecedoresPFApi = {
  getAll: async (tenantId: string) => {
    try {
      const { data, error } = await supabase
        .from("fornecedores_pf")
        .select("*")
        .eq("tenant_id", tenantId)
        .order("created_at", { ascending: false });

      if (error) {
        secureLogger.error("Failed to fetch fornecedores PF", error, {
          tenantId,
        });
        throw error;
      }

      return data || [];
    } catch (_error) {
      secureLogger.error("Error in fornecedoresPFApi.getAll", _error, {
        tenantId,
      });
      throw _error;
    }
  },

  getById: async (id: string, tenantId: string) => {
    try {
      const { data, error } = await supabase
        .from("fornecedores_pf")
        .select("*")
        .eq("id", id)
        .eq("tenant_id", tenantId)
        .single();

      if (error) {
        secureLogger.error("Failed to fetch fornecedor PF by ID", error, {
          fornecedorId: id,
          tenantId,
        });
        throw error;
      }

      return data;
    } catch (_error) {
      secureLogger.error("Error in fornecedoresPFApi.getById", _error, {
        fornecedorId: id,
        tenantId,
      });
      throw _error;
    }
  },

  create: async (fornecedor: FornecedorPFFormValues, tenantId: string) => {
    try {
      // Get the current user
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        throw new Error("User not authenticated");
      }

      // ✅ Sanitizar dados de entrada
      const sanitizedFornecedor = sanitizeFormData(fornecedor);

      // Ensure required fields are present
      if (!sanitizedFornecedor.cpf || !sanitizedFornecedor.nome) {
        throw new Error("CPF and Nome are required");
      }

      // ✅ Função auxiliar para converter data para string ISO ou null
      const formatDateForDB = (date: unknown) => {
        if (!date) return null;

        try {
          // Se já for um objeto Date
          if (date instanceof Date) {
            return date.toISOString().split("T")[0];
          }

          // Se for string, tenta converter para Date
          if (typeof date === "string") {
            const dateObj = new Date(date);
            if (!isNaN(dateObj.getTime())) {
              return dateObj.toISOString().split("T")[0];
            }
          }

          return null;
        } catch (_error) {
          console.warn("❌ Erro ao formatar data:", date, _error);
          return null;
        }
      };

      // Remove formatação dos campos antes de salvar no banco
      const unformattedFornecedor = {
        ...sanitizedFornecedor,
        cpf: unformat(sanitizedFornecedor.cpf),
        telefone_principal: sanitizedFornecedor.telefone_principal
          ? unformat(sanitizedFornecedor.telefone_principal)
          : null,
        telefone_secundario: sanitizedFornecedor.telefone_secundario
          ? unformat(sanitizedFornecedor.telefone_secundario)
          : null,
        cep: sanitizedFornecedor.cep ? unformat(sanitizedFornecedor.cep) : null,
        data_nascimento: formatDateForDB(sanitizedFornecedor.data_nascimento),
      };

      // Convert date to ISO string if it exists
      const formattedFornecedor = {
        ...unformattedFornecedor,
        usuario_id: user.id,
        tenant_id: tenantId,
      };

      const { data, error } = await supabase
        .from("fornecedores_pf")
        .insert(formattedFornecedor)
        .select()
        .single();

      if (error) {
        secureLogger.error("Failed to create fornecedor PF", error, {
          userId: user.id,
          tenantId,
        });
        throw error;
      }

      // ✅ Log de sucesso
      secureLogger.info("Fornecedor PF created successfully", {
        fornecedorId: data.id,
        userId: user.id,
      });

      return data;
    } catch (_error) {
      secureLogger.error("Error in fornecedoresPFApi.create", _error, {
        tenantId,
      });
      throw _error;
    }
  },

  update: async (id: string, fornecedor: Partial<FornecedorPFFormValues>) => {
    try {
      // ✅ Sanitizar dados de entrada
      const sanitizedFornecedor = sanitizeFormData(fornecedor);

      // ✅ Função auxiliar para converter data para string ISO ou null
      const formatDateForDB = (date: unknown) => {
        if (!date) return null;

        try {
          // Se já for um objeto Date
          if (date instanceof Date) {
            return date.toISOString().split("T")[0];
          }

          // Se for string, tenta converter para Date
          if (typeof date === "string") {
            const dateObj = new Date(date);
            if (!isNaN(dateObj.getTime())) {
              return dateObj.toISOString().split("T")[0];
            }
          }

          return null;
        } catch (_error) {
          console.warn("❌ Erro ao formatar data:", date, _error);
          return null;
        }
      };

      // Remove formatação dos campos antes de salvar no banco
      const unformattedFornecedor = {
        ...sanitizedFornecedor,
        cpf: sanitizedFornecedor.cpf
          ? unformat(sanitizedFornecedor.cpf)
          : undefined,
        telefone_principal: sanitizedFornecedor.telefone_principal
          ? unformat(sanitizedFornecedor.telefone_principal)
          : undefined,
        telefone_secundario: sanitizedFornecedor.telefone_secundario
          ? unformat(sanitizedFornecedor.telefone_secundario)
          : undefined,
        cep: sanitizedFornecedor.cep
          ? unformat(sanitizedFornecedor.cep)
          : undefined,
        data_nascimento: formatDateForDB(sanitizedFornecedor.data_nascimento),
      };

      const { data, error } = await supabase
        .from("fornecedores_pf")
        .update(unformattedFornecedor)
        .eq("id", id)
        .select()
        .single();

      if (error) {
        secureLogger.error("Failed to update fornecedor PF", error, {
          fornecedorId: id,
        });
        throw error;
      }

      // ✅ Log de sucesso
      secureLogger.info("Fornecedor PF updated successfully", {
        fornecedorId: data.id,
      });

      return data;
    } catch (_error) {
      secureLogger.error("Error in fornecedoresPFApi.update", _error, {
        fornecedorId: id,
      });
      throw _error;
    }
  },

  delete: async (id: string) => {
    try {
      const { error } = await supabase
        .from("fornecedores_pf")
        .delete()
        .eq("id", id);

      if (error) {
        secureLogger.error("Failed to delete fornecedor PF", error, {
          fornecedorId: id,
        });
        throw error;
      }

      // ✅ Log de sucesso
      secureLogger.info("Fornecedor PF deleted successfully", {
        fornecedorId: id,
      });

      return true;
    } catch (_error) {
      secureLogger.error("Error in fornecedoresPFApi.delete", _error, {
        fornecedorId: id,
      });
      throw _error;
    }
  },
};

// Despesas API
export const despesasApi = {
  getAll: async (tenantId: string) => {
    try {
      // ✅ Validação robusta do tenantId para evitar [object Object]
      if (!tenantId || typeof tenantId !== "string" || tenantId.trim() === "") {
        throw new Error("Tenant ID inválido ou ausente");
      }

      const { data, error } = await supabase
        .from("despesas")
        .select(`
          *,
          obras(nome),
          fornecedores_pj(razao_social, cnpj),
          fornecedores_pf(nome, cpf)
        `)
        .eq("tenant_id", tenantId.trim())
        .order("created_at", { ascending: false });

      if (error) {
        secureLogger.error("Failed to fetch despesas", error, { tenantId });
        throw error;
      }

      return data || [];
    } catch (_error) {
      secureLogger.error("Error in despesasApi.getAll", _error, { tenantId });
      throw _error;
    }
  },

  getById: async (id: string, tenantId: string) => {
    try {
      // ✅ Validação robusta do tenantId
      if (!tenantId || typeof tenantId !== "string" || tenantId.trim() === "") {
        throw new Error("Tenant ID inválido ou ausente");
      }

      if (!id || typeof id !== "string" || id.trim() === "") {
        throw new Error("ID da despesa inválido ou ausente");
      }

      const { data, error } = await supabase
        .from("despesas")
        .select(`
          *,
          obras(nome),
          fornecedores_pj(razao_social, cnpj),
          fornecedores_pf(nome, cpf)
        `)
        .eq("id", id.trim())
        .eq("tenant_id", tenantId.trim())
        .single();

      if (error) {
        secureLogger.error("Failed to fetch despesa by ID", error, {
          despesaId: id,
          tenantId,
        });
        throw error;
      }

      return data;
    } catch (_error) {
      secureLogger.error("Error in despesasApi.getById", _error, {
        despesaId: id,
        tenantId,
      });
      throw _error;
    }
  },

  create: async (despesa: DespesaFormValues, tenantId: string) => {
    try {
      // ✅ Validação robusta do tenantId
      if (!tenantId || typeof tenantId !== "string" || tenantId.trim() === "") {
        throw new Error("Tenant ID inválido ou ausente");
      }

      // Get the current user
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        throw new Error("User not authenticated");
      }

      // ✅ Sanitizar dados de entrada
      const sanitizedDespesa = sanitizeFormData(despesa);

      // 🌐 Mapeamento de categoria legacy → enum atual do banco
      const categoriaMapping: Record<string, string> = {
        "MATERIAL": "MATERIAL_CONSTRUCAO",
        "MATERIAL_CONSTRUCAO": "MATERIAL_CONSTRUCAO",
        "MAO_DE_OBRA": "MAO_DE_OBRA",
        "EQUIPAMENTO": "ALUGUEL_EQUIPAMENTOS",
        "ALUGUEL_EQUIPAMENTOS": "ALUGUEL_EQUIPAMENTOS",
        "SERVICO": "SERVICOS_TERCEIRIZADOS",
        "SERVICOS_TERCEIRIZADOS": "SERVICOS_TERCEIRIZADOS",
        "TRANSPORTE": "TRANSPORTE_FRETE",
        "TRANSPORTE_FRETE": "TRANSPORTE_FRETE",
        "TAXAS": "TAXAS_LICENCAS",
        "TAXAS_LICENCAS": "TAXAS_LICENCAS",
        "ADMINISTRATIVO": "ADMINISTRATIVO",
        "IMPREVISTOS": "IMPREVISTOS",
        "OUTROS": "OUTROS",
        "DEMOLICAO": "DEMOLICAO_REMOCAO",
        "DEMOLICAO_REMOCAO": "DEMOLICAO_REMOCAO",
        "PROTECAO": "PROTECAO_ESTRUTURAL",
        "PROTECAO_ESTRUTURAL": "PROTECAO_ESTRUTURAL",
        "TERRENO": "AQUISICAO_TERRENO_AREA",
        "AQUISICAO_TERRENO_AREA": "AQUISICAO_TERRENO_AREA",
        "IMOVEL": "AQUISICAO_IMOVEL_REFORMA_LEILAO",
        "AQUISICAO_IMOVEL_REFORMA_LEILAO": "AQUISICAO_IMOVEL_REFORMA_LEILAO",
      };

      // Aplicar mapeamento se necessário
      if (
        sanitizedDespesa.categoria &&
        categoriaMapping[sanitizedDespesa.categoria]
      ) {
        const categoriaMapeada = categoriaMapping[sanitizedDespesa.categoria];
        sanitizedDespesa.categoria = categoriaMapeada;
      }

      // ✅ Calcular o custo total (quantidade * valor_unitario)
      const custoTotal = sanitizedDespesa.quantidade *
        sanitizedDespesa.valor_unitario;

      // ✅ Função auxiliar para converter data para string ISO ou null
      const formatDateToISO = (date: Date | string | null): string | null => {
        if (!date) return null;
        if (date instanceof Date) {
          return date.toISOString().split("T")[0];
        }
        // Se for string, tentar converter para Date primeiro
        const dateObj = new Date(date);
        return isNaN(dateObj.getTime())
          ? null
          : dateObj.toISOString().split("T")[0];
      };

      // ✅ Formatar as datas para o formato do banco de dados com tratamento seguro
      const formattedDespesa = {
        ...sanitizedDespesa,
        custo: custoTotal, // Adicionar o campo custo calculado
        data_despesa: formatDateToISO(sanitizedDespesa.data_despesa),
        data_pagamento: formatDateToISO(sanitizedDespesa.data_pagamento),
        usuario_id: user.id,
        tenant_id: tenantId.trim(),
      };

      const { data, error } = await supabase
        .from("despesas")
        .insert(formattedDespesa)
        .select()
        .single();

      if (error) {
        secureLogger.error("Failed to create despesa", error, {
          userId: user.id,
          tenantId,
        });
        throw error;
      }

      // ✅ Log de sucesso
      secureLogger.info("Despesa created successfully", {
        despesaId: data.id,
        userId: user.id,
      });

      return data;
    } catch (_error) {
      secureLogger.error("Error in despesasApi.create", _error, { tenantId });
      throw _error;
    }
  },

  update: async (id: string, despesa: Partial<DespesaFormValues>) => {
    try {
      // ✅ Validação do ID
      if (!id || typeof id !== "string" || id.trim() === "") {
        throw new Error("ID da despesa inválido ou ausente");
      }

      // 🔒 Forçar datas para Date após sanitização
      if (despesa.data_despesa && !(despesa.data_despesa instanceof Date)) {
        despesa.data_despesa = new Date(despesa.data_despesa as string);
      }
      if (
        despesa.data_pagamento && !(despesa.data_pagamento instanceof Date)
      ) {
        despesa.data_pagamento = new Date(despesa.data_pagamento as string);
      }
      console.log(
        "Tipo de data_despesa antes do sanitize:",
        typeof despesa.data_despesa,
        despesa.data_despesa,
      );
      console.log("É Date?", despesa.data_despesa instanceof Date);

      // ✅ Sanitizar dados de entrada
      const sanitizedDespesa = sanitizeFormData(despesa);

      // 🔧 DEBUG: Log dos dados recebidos
      console.log("🔧 API - Dados recebidos:", sanitizedDespesa);
      console.log(
        "🔧 API - Tipo data_despesa antes sanitização:",
        typeof sanitizedDespesa.data_despesa,
        sanitizedDespesa.data_despesa,
      );
      console.log(
        "🔧 API - É Date antes sanitização?:",
        sanitizedDespesa.data_despesa instanceof Date,
      );

      // ✅ Função auxiliar para converter data para string ISO ou null
      const formatDateToISO = (date: Date | string | null): string | null => {
        if (!date) return null;
        if (date instanceof Date) {
          return date.toISOString().split("T")[0];
        }
        // Se for string, tentar converter para Date primeiro
        const dateObj = new Date(date);
        return isNaN(dateObj.getTime())
          ? null
          : dateObj.toISOString().split("T")[0];
      };

      // Calculate the total cost if we have both quantidade and valor_unitario
      const updates: Record<string, unknown> = { ...sanitizedDespesa };

      if (
        sanitizedDespesa.quantidade !== undefined &&
        sanitizedDespesa.valor_unitario !== undefined
      ) {
        updates.custo = sanitizedDespesa.quantidade *
          sanitizedDespesa.valor_unitario;
      }

      // ✅ Formatação segura das datas
      if (sanitizedDespesa.data_despesa) {
        let dataDespesa = sanitizedDespesa.data_despesa;
        if (!(dataDespesa instanceof Date)) {
          dataDespesa = new Date(dataDespesa);
        }
        updates.data_despesa = formatDateToISO(dataDespesa);
      }

      if (sanitizedDespesa.data_pagamento) {
        let dataPagamento = sanitizedDespesa.data_pagamento;
        if (!(dataPagamento instanceof Date)) {
          dataPagamento = new Date(dataPagamento);
        }
        updates.data_pagamento = formatDateToISO(dataPagamento);
      } else if (sanitizedDespesa.data_pagamento === null) {
        updates.data_pagamento = null;
      }

      // Make sure enum fields are properly formatted
      // We don't need to modify the categoria, etapa, or insumo - they're already
      // validated by the Zod schema to match the expected database enum types

      const { data, error } = await supabase
        .from("despesas")
        .update(updates)
        .eq("id", id.trim())
        .select()
        .single();

      if (error) {
        secureLogger.error("Failed to update despesa", error, {
          despesaId: id,
        });
        throw error;
      }

      // ✅ Log de sucesso
      secureLogger.info("Despesa updated successfully", { despesaId: data.id });

      return data;
    } catch (_error) {
      secureLogger.error("Error in despesasApi.update", _error, {
        despesaId: id,
      });
      throw _error;
    }
  },

  delete: async (id: string) => {
    try {
      // ✅ Validação do ID
      if (!id || typeof id !== "string" || id.trim() === "") {
        throw new Error("ID da despesa inválido ou ausente");
      }

      const { error } = await supabase
        .from("despesas")
        .delete()
        .eq("id", id.trim());

      if (error) {
        secureLogger.error("Failed to delete despesa", error, {
          despesaId: id,
        });
        throw error;
      }

      // ✅ Log de sucesso
      secureLogger.info("Despesa deleted successfully", { despesaId: id });

      return true;
    } catch (_error) {
      secureLogger.error("Error in despesasApi.delete", _error, {
        despesaId: id,
      });
      throw _error;
    }
  },
};

// Notas Fiscais API
export const notasFiscaisApi = {
  getAll: async (tenantId: string) => {
    const { data, error } = await supabase
      .from("notas_fiscais")
      .select(`
        *,
        obras:obra_id(nome),
        fornecedores_pj:fornecedor_pj_id(razao_social),
        fornecedores_pf:fornecedor_pf_id(nome),
        despesas:despesa_id(descricao)
      `)
      .eq("tenant_id", tenantId)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching notas fiscais:", error);
      throw error;
    }

    return data || [];
  },

  getById: async (id: string, tenantId: string) => {
    const { data, error } = await supabase
      .from("notas_fiscais")
      .select(`
        *,
        obras:obra_id(nome),
        fornecedores_pj:fornecedor_pj_id(razao_social),
        fornecedores_pf:fornecedor_pf_id(nome),
        despesas:despesa_id(descricao)
      `)
      .eq("id", id)
      .eq("tenant_id", tenantId)
      .single();

    if (error) {
      console.error(`Error fetching nota fiscal ${id}:`, error);
      throw error;
    }

    return data;
  },

  create: async (notaFiscal: NotaFiscalFormValues, file?: File) => {
    // Validação de campos obrigatórios
    if (
      !notaFiscal.obra_id || !notaFiscal.data_emissao ||
      notaFiscal.valor_total === undefined || notaFiscal.valor_total <= 0
    ) {
      throw new Error("Campos obrigatórios não preenchidos");
    }

    let arquivo_url = null;
    let arquivo_path = null;

    // Handle file upload if a file is provided
    if (file) {
      // Obter tenant_id antes do upload para estruturar o path
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) {
        throw new Error("Usuário não autenticado");
      }

      // Buscar o tenant_id do profile do usuário
      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select("tenant_id")
        .eq("id", userData.user.id)
        .single();

      if (profileError || !profileData?.tenant_id) {
        throw new Error("Tenant ID não encontrado");
      }

      const fileExt = file.name.split(".").pop();
      const fileName = `${crypto.randomUUID()}.${fileExt}`;
      // Estrutura do path: tenant_id/filename para isolamento multi-tenant
      const filePath = `${profileData.tenant_id}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("notas_fiscais")
        .upload(filePath, file);

      if (uploadError) {
        console.error("Error uploading file:", uploadError);
        throw uploadError;
      }

      // Get the public URL for the uploaded file
      const { data: publicUrlData } = supabase.storage
        .from("notas_fiscais")
        .getPublicUrl(filePath);

      arquivo_path = filePath;
      arquivo_url = publicUrlData.publicUrl;
    }

    // Obter tenant_id do usuário atual (reutilizando se já foi obtido para upload)
    let userData, profileData;
    if (!file) {
      const result = await supabase.auth.getUser();
      userData = result.data;
      if (!userData.user) {
        throw new Error("Usuário não autenticado");
      }

      // Buscar o tenant_id do profile do usuário
      const profileResult = await supabase
        .from("profiles")
        .select("tenant_id")
        .eq("id", userData.user.id)
        .single();

      if (profileResult.error || !profileResult.data?.tenant_id) {
        throw new Error("Tenant ID não encontrado");
      }
      profileData = profileResult.data;
    } else {
      // Reutilizar dados já obtidos no upload
      const result = await supabase.auth.getUser();
      userData = result.data;
      const profileResult = await supabase
        .from("profiles")
        .select("tenant_id")
        .eq("id", userData.user.id)
        .single();
      profileData = profileResult.data;
    }

    // Format the data_emissao date
    const formattedNotaFiscal = {
      obra_id: notaFiscal.obra_id,
      fornecedor_pj_id: notaFiscal.fornecedor_pj_id || null,
      fornecedor_pf_id: notaFiscal.fornecedor_pf_id || null,
      despesa_id: notaFiscal.despesa_id || null,
      numero: notaFiscal.numero || null,
      data_emissao: notaFiscal.data_emissao.toISOString().split("T")[0],
      valor_total: notaFiscal.valor_total,
      chave_acesso: notaFiscal.chave_acesso || null,
      descricao: notaFiscal.descricao || null,
      arquivo_path,
      arquivo_url,
      usuario_upload_id: userData.user.id,
      tenant_id: profileData.tenant_id,
    };

    const { data, error } = await supabase
      .from("notas_fiscais")
      .insert(formattedNotaFiscal)
      .select(`
        *,
        obras:obra_id(nome),
        fornecedores_pj:fornecedor_pj_id(razao_social),
        fornecedores_pf:fornecedor_pf_id(nome)
      `)
      .single();

    if (error) {
      console.error("Error creating nota fiscal:", error);
      throw error;
    }

    // ✅ Log de sucesso
    secureLogger.info("Nota Fiscal created successfully", {
      notaFiscalId: data.id,
      userId: data.usuario_upload_id,
    });

    return data;
  },

  update: async (
    id: string,
    notaFiscal: Partial<NotaFiscalFormValues>,
    file?: File,
  ) => {
    let arquivo_url = undefined;
    let arquivo_path = undefined;

    // Handle file upload if a new file is provided
    if (file) {
      // Obter tenant_id antes do upload
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) {
        throw new Error("Usuário não autenticado");
      }

      // Buscar o tenant_id do profile do usuário
      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select("tenant_id")
        .eq("id", userData.user.id)
        .single();

      if (profileError || !profileData?.tenant_id) {
        throw new Error("Tenant ID não encontrado");
      }

      // First, get the existing nota fiscal to delete the old file
      const { data: existingNota, error: fetchError } = await supabase
        .from("notas_fiscais")
        .select("arquivo_path")
        .eq("id", id)
        .single();

      if (!fetchError && existingNota?.arquivo_path) {
        // Delete the old file from the correct bucket
        await supabase.storage
          .from("notas_fiscais")
          .remove([existingNota.arquivo_path]);
      }

      // Upload the new file
      const fileExt = file.name.split(".").pop();
      const fileName = `${crypto.randomUUID()}.${fileExt}`;
      // Estrutura do path: tenant_id/filename para isolamento multi-tenant
      const filePath = `${profileData.tenant_id}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("notas_fiscais")
        .upload(filePath, file);

      if (uploadError) {
        console.error("Error uploading file:", uploadError);
        throw uploadError;
      }

      // Get the public URL for the uploaded file
      const { data: publicUrlData } = supabase.storage
        .from("notas_fiscais")
        .getPublicUrl(filePath);

      arquivo_path = filePath;
      arquivo_url = publicUrlData.publicUrl;
    }

    // Prepare the update object
    const updates: Record<string, unknown> = { ...notaFiscal };

    // Format the data_emissao date if provided
    if (notaFiscal.data_emissao) {
      updates.data_emissao =
        notaFiscal.data_emissao.toISOString().split("T")[0];
    }

    // Add file URLs if a new file was uploaded
    if (arquivo_path) {
      updates.arquivo_path = arquivo_path;
      updates.arquivo_url = arquivo_url;
    }

    const { data, error } = await supabase
      .from("notas_fiscais")
      .update(updates)
      .eq("id", id)
      .select(`
        *,
        obras:obra_id(nome),
        fornecedores_pj:fornecedor_pj_id(razao_social),
        fornecedores_pf:fornecedor_pf_id(nome)
      `)
      .single();

    if (error) {
      console.error(`Error updating nota fiscal ${id}:`, error);
      throw error;
    }

    // ✅ Log de sucesso
    secureLogger.info("Nota Fiscal updated successfully", {
      notaFiscalId: data.id,
    });

    return data;
  },

  delete: async (id: string) => {
    // First, get the nota fiscal to check if it has an associated file
    const { data, error: fetchError } = await supabase
      .from("notas_fiscais")
      .select("arquivo_path")
      .eq("id", id)
      .single();

    if (fetchError) {
      console.error(`Error fetching nota fiscal ${id}:`, fetchError);
      throw fetchError;
    }

    // If there's an associated file, delete it from storage
    if (data?.arquivo_path) {
      const { error: deleteFileError } = await supabase.storage
        .from("notas_fiscais")
        .remove([data.arquivo_path]);

      if (deleteFileError) {
        console.error(
          `Error deleting file for nota fiscal ${id}:`,
          deleteFileError,
        );
        // Continue even if file deletion fails
      }
    }

    // Delete the nota fiscal record from the database
    const { error } = await supabase
      .from("notas_fiscais")
      .delete()
      .eq("id", id);

    if (error) {
      console.error(`Error deleting nota fiscal ${id}:`, error);
      throw error;
    }

    // ✅ Log de sucesso
    secureLogger.info("Nota Fiscal deleted successfully", { notaFiscalId: id });

    return true;
  },
};
