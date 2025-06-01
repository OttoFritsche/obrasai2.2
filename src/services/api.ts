import { supabase } from "@/integrations/supabase/client";
import { ObraFormValues } from "@/lib/validations/obra";
import { FornecedorPJFormValues, FornecedorPFFormValues } from "@/lib/validations/fornecedor";
import { DespesaFormValues } from "@/lib/validations/despesa";
import { NotaFiscalFormValues } from "@/lib/validations/nota-fiscal";

// Obras API
export const obrasApi = {
  getAll: async (tenantId: string) => {
    const { data, error } = await supabase
      .from("obras")
      .select("*")
      .eq("tenant_id", tenantId)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching obras:", error);
      throw error;
    }

    return data || [];
  },

  getById: async (id: string, tenantId: string) => {
    const { data, error } = await supabase
      .from("obras")
      .select("*")
      .eq("id", id)
      .eq("tenant_id", tenantId)
      .single();

    if (error) {
      console.error(`Error fetching obra ${id}:`, error);
      throw error;
    }

    return data;
  },

  create: async (obra: ObraFormValues, tenantId: string) => {
    // Get the current user
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error("User not authenticated");
    }

    const { data, error } = await supabase
      .from("obras")
      .insert({
        nome: obra.nome,
        endereco: obra.endereco,
        cidade: obra.cidade,
        estado: obra.estado,
        cep: obra.cep,
        orcamento: obra.orcamento,
        data_inicio: obra.data_inicio ? obra.data_inicio.toISOString().split('T')[0] : null,
        data_prevista_termino: obra.data_prevista_termino ? obra.data_prevista_termino.toISOString().split('T')[0] : null,
        usuario_id: user.id,
        tenant_id: tenantId
      })
      .select()
      .single();

    if (error) {
      console.error("Error creating obra:", error);
      throw error;
    }

    return data;
  },

  update: async (id: string, obra: Partial<ObraFormValues>) => {
    const formattedObra = {
      ...obra,
      data_inicio: obra.data_inicio ? obra.data_inicio.toISOString().split('T')[0] : undefined,
      data_prevista_termino: obra.data_prevista_termino ? obra.data_prevista_termino.toISOString().split('T')[0] : undefined,
    };

    const { data, error } = await supabase
      .from("obras")
      .update(formattedObra)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error(`Error updating obra ${id}:`, error);
      throw error;
    }

    return data;
  },

  delete: async (id: string) => {
    const { error } = await supabase
      .from("obras")
      .delete()
      .eq("id", id);

    if (error) {
      console.error(`Error deleting obra ${id}:`, error);
      throw error;
    }

    return true;
  },
};

// Fornecedores PJ API
export const fornecedoresPJApi = {
  getAll: async (tenantId: string) => {
    const { data, error } = await supabase
      .from("fornecedores_pj")
      .select("*")
      .eq("tenant_id", tenantId)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching fornecedores PJ:", error);
      throw error;
    }

    return data || [];
  },

  getById: async (id: string, tenantId: string) => {
    const { data, error } = await supabase
      .from("fornecedores_pj")
      .select("*")
      .eq("id", id)
      .eq("tenant_id", tenantId)
      .single();

    if (error) {
      console.error(`Error fetching fornecedor PJ ${id}:`, error);
      throw error;
    }

    return data;
  },

  create: async (fornecedor: FornecedorPJFormValues, tenantId: string) => {
    // Get the current user
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error("User not authenticated");
    }

    // Ensure required fields are present
    if (!fornecedor.cnpj || !fornecedor.razao_social) {
      throw new Error("CNPJ and Razão Social are required");
    }

    const { data, error } = await supabase
      .from("fornecedores_pj")
      .insert({
        ...fornecedor,
        usuario_id: user.id,
        tenant_id: tenantId
      })
      .select()
      .single();

    if (error) {
      console.error("Error creating fornecedor PJ:", error);
      throw error;
    }

    return data;
  },

  update: async (id: string, fornecedor: Partial<FornecedorPJFormValues>) => {
    const { data, error } = await supabase
      .from("fornecedores_pj")
      .update(fornecedor)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error(`Error updating fornecedor PJ ${id}:`, error);
      throw error;
    }

    return data;
  },

  delete: async (id: string) => {
    const { error } = await supabase
      .from("fornecedores_pj")
      .delete()
      .eq("id", id);

    if (error) {
      console.error(`Error deleting fornecedor PJ ${id}:`, error);
      throw error;
    }

    return true;
  },
};

// Fornecedores PF API
export const fornecedoresPFApi = {
  getAll: async (tenantId: string) => {
    const { data, error } = await supabase
      .from("fornecedores_pf")
      .select("*")
      .eq("tenant_id", tenantId)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching fornecedores PF:", error);
      throw error;
    }

    return data || [];
  },

  getById: async (id: string, tenantId: string) => {
    const { data, error } = await supabase
      .from("fornecedores_pf")
      .select("*")
      .eq("id", id)
      .eq("tenant_id", tenantId)
      .single();

    if (error) {
      console.error(`Error fetching fornecedor PF ${id}:`, error);
      throw error;
    }

    return data;
  },

  create: async (fornecedor: FornecedorPFFormValues, tenantId: string) => {
    // Get the current user
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error("User not authenticated");
    }

    // Ensure required fields are present
    if (!fornecedor.cpf || !fornecedor.nome) {
      throw new Error("CPF and Nome are required");
    }

    // Convert date to ISO string if it exists
    const formattedFornecedor = {
      ...fornecedor,
      data_nascimento: fornecedor.data_nascimento 
        ? fornecedor.data_nascimento.toISOString().split('T')[0] 
        : null,
      usuario_id: user.id,
      tenant_id: tenantId
    };

    const { data, error } = await supabase
      .from("fornecedores_pf")
      .insert(formattedFornecedor)
      .select()
      .single();

    if (error) {
      console.error("Error creating fornecedor PF:", error);
      throw error;
    }

    return data;
  },

  update: async (id: string, fornecedor: Partial<FornecedorPFFormValues>) => {
    // Convert date to ISO string if it exists
    const formattedFornecedor = {
      ...fornecedor,
      data_nascimento: fornecedor.data_nascimento 
        ? fornecedor.data_nascimento.toISOString().split('T')[0] 
        : undefined,
    };

    const { data, error } = await supabase
      .from("fornecedores_pf")
      .update(formattedFornecedor)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error(`Error updating fornecedor PF ${id}:`, error);
      throw error;
    }

    return data;
  },

  delete: async (id: string) => {
    const { error } = await supabase
      .from("fornecedores_pf")
      .delete()
      .eq("id", id);

    if (error) {
      console.error(`Error deleting fornecedor PF ${id}:`, error);
      throw error;
    }

    return true;
  },
};

// Despesas API
export const despesasApi = {
  getAll: async (tenantId: string) => {
    const { data, error } = await supabase
      .from("despesas")
      .select("*")
      .eq("tenant_id", tenantId)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching despesas:", error);
      throw error;
    }

    return data || [];
  },

  getById: async (id: string, tenantId: string) => {
    const { data, error } = await supabase
      .from("despesas")
      .select("*")
      .eq("id", id)
      .eq("tenant_id", tenantId)
      .single();

    if (error) {
      console.error(`Error fetching despesa ${id}:`, error);
      throw error;
    }

    return data;
  },

  create: async (despesa: DespesaFormValues, tenantId: string) => {
    // Get the current user
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error("User not authenticated");
    }

    const { data, error } = await supabase
      .from("despesas")
      .insert({
        ...despesa,
        usuario_id: user.id,
        tenant_id: tenantId
      })
      .select()
      .single();

    if (error) {
      console.error("Error creating despesa:", error);
      throw error;
    }

    return data;
  },

  update: async (id: string, despesa: Partial<DespesaFormValues>) => {
    // Calculate the total cost if we have both quantidade and valor_unitario
    let updates: any = { ...despesa };
    
    if (despesa.quantidade !== undefined && despesa.valor_unitario !== undefined) {
      updates.custo = despesa.quantidade * despesa.valor_unitario;
    }
    
    // Format the dates
    if (despesa.data_despesa) {
      updates.data_despesa = despesa.data_despesa.toISOString().split('T')[0];
    }
    
    if (despesa.data_pagamento) {
      updates.data_pagamento = despesa.data_pagamento.toISOString().split('T')[0];
    } else if (despesa.data_pagamento === null) {
      updates.data_pagamento = null;
    }

    // Make sure enum fields are properly formatted
    // We don't need to modify the categoria, etapa, or insumo - they're already
    // validated by the Zod schema to match the expected database enum types

    const { data, error } = await supabase
      .from("despesas")
      .update(updates)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error(`Error updating despesa ${id}:`, error);
      throw error;
    }

    return data;
  },

  delete: async (id: string) => {
    const { error } = await supabase
      .from("despesas")
      .delete()
      .eq("id", id);

    if (error) {
      console.error(`Error deleting despesa ${id}:`, error);
      throw error;
    }

    return true;
  },
};

// Notas Fiscais API
export const notasFiscaisApi = {
  getAll: async (tenantId: string) => {
    const { data, error } = await supabase
      .from("notas_fiscais")
      .select("*")
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
      .select("*")
      .eq("id", id)
      .eq("tenant_id", tenantId)
      .single();

    if (error) {
      console.error(`Error fetching nota fiscal ${id}:`, error);
      throw error;
    }

    return data;
  },

  create: async (notaFiscal: NotaFiscalFormValues, tenantId: string) => {
    // Ensure required fields are present
    if (!notaFiscal.obra_id || !notaFiscal.data_emissao || 
        notaFiscal.valor_total === undefined || notaFiscal.valor_total <= 0) {
      throw new Error("Missing required fields");
    }

    let arquivo_url = null;
    let arquivo_path = null;

    // Handle file upload if a file is provided
    if (file) {
      const fileExt = file.name.split('.').pop();
      const fileName = `${crypto.randomUUID()}.${fileExt}`;
      const filePath = `notas_fiscais/${fileName}`;

      const { error: uploadError, data } = await supabase.storage
        .from('uploads')
        .upload(filePath, file);

      if (uploadError) {
        console.error("Error uploading file:", uploadError);
        throw uploadError;
      }

      // Get the public URL for the uploaded file
      const { data: publicUrlData } = supabase.storage
        .from('uploads')
        .getPublicUrl(filePath);

      arquivo_path = filePath;
      arquivo_url = publicUrlData.publicUrl;
    }

    // Format the data_emissao date
    const formattedNotaFiscal = {
      obra_id: notaFiscal.obra_id,
      fornecedor_pj_id: notaFiscal.fornecedor_pj_id || null,
      fornecedor_pf_id: notaFiscal.fornecedor_pf_id || null,
      despesa_id: notaFiscal.despesa_id || null,
      numero: notaFiscal.numero || null,
      data_emissao: notaFiscal.data_emissao.toISOString().split('T')[0],
      valor_total: notaFiscal.valor_total,
      chave_acesso: notaFiscal.chave_acesso || null,
      descricao: notaFiscal.descricao || null,
      arquivo_path,
      arquivo_url,
      tenant_id: tenantId
    };

    const { data, error } = await supabase
      .from("notas_fiscais")
      .insert(formattedNotaFiscal)
      .select()
      .single();

    if (error) {
      console.error("Error creating nota fiscal:", error);
      throw error;
    }

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
        .from('uploads')
        .remove([data.arquivo_path]);

      if (deleteFileError) {
        console.error(`Error deleting file for nota fiscal ${id}:`, deleteFileError);
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

    return true;
  },
};
