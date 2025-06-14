import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useAuth } from "@/contexts/auth";

interface Contrato {
  id: string;
  numero_contrato: string;
  titulo: string;
  obra_id: string;
  template_id?: string;
  obras?: { 
    id: string;
    nome: string;
    endereco: string;
    cidade: string;
    estado: string;
  };
  templates_contratos?: {
    id: string;
    nome: string;
    template_html: string;
    clausulas_obrigatorias: {
      id: string;
      texto: string;
      obrigatoria: boolean;
    }[];
  };
  // Dados do contratante
  contratante_nome: string;
  contratante_documento: string;
  contratante_endereco?: string;
  contratante_email?: string;
  contratante_telefone?: string;
  // Dados do contratado
  contratado_nome: string;
  contratado_documento: string;
  contratado_endereco?: string;
  contratado_email?: string;
  contratado_telefone?: string;
  // Dados financeiros
  valor_total: number;
  forma_pagamento: string;
  // Prazos
  prazo_execucao: number;
  data_inicio?: string;
  data_fim_prevista?: string;
  // Descrição e conteúdo
  descricao_servicos?: string;
  clausulas_especiais?: string;
  observacoes?: string;
  // Status e progresso
  status: string;
  data_assinatura?: string;
  // Documentos
  hash_documento?: string;
  url_documento?: string;
  variaveis_template?: Record<string, unknown>;
  // Metadados
  criado_por?: string;
  tenant_id?: string;
  created_at: string;
  updated_at: string;
}

interface Template {
  id: string;
  nome: string;
  categoria: string;
  descricao?: string;
  template_html: string;
  clausulas_obrigatorias: {
    id: string;
    texto: string;
    obrigatoria: boolean;
  }[];
  ativo: boolean;
}

export function useContratos() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const {
    data: contratos,
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ["contratos", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("contratos")
        .select(`
          *,
          obras(id, nome, endereco, cidade, estado),
          templates_contratos(id, nome, template_html, clausulas_obrigatorias)
        `)
        .order('created_at', { ascending: false });

      if (error) {
        console.error("Erro ao buscar contratos:", error);
        throw error;
      }

      return data as Contrato[];
    },
    enabled: !!user,
  });

  const createContrato = useMutation({
    mutationFn: async (novoContrato: Partial<Contrato>) => {
      // Gerar número único do contrato
      const numeroContrato = `CTR-${Date.now()}-${Math.random().toString(36).substr(2, 5).toUpperCase()}`;
      
      const { data, error } = await supabase
        .from("contratos")
        .insert([{
          ...novoContrato,
          tenant_id: user?.id,
          numero_contrato: numeroContrato,
          status: 'RASCUNHO',
          progresso_execucao: 0
        }])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["contratos"] });
      toast.success("Contrato criado com sucesso!");
    },
    onError: (error: Error) => {
      console.error("Erro ao criar contrato:", error);
      toast.error("Erro ao criar contrato");
    },
  });

  const updateContrato = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Contrato> & { id: string }) => {
      const { data, error } = await supabase
        .from("contratos")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["contratos"] });
      toast.success("Contrato atualizado com sucesso!");
    },
    onError: (error: Error) => {
      console.error("Erro ao atualizar contrato:", error);
      toast.error("Erro ao atualizar contrato");
    },
  });

  const deleteContrato = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("contratos")
        .delete()
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["contratos"] });
      toast.success("Contrato excluído com sucesso!");
    },
    onError: (error: Error) => {
      console.error("Erro ao excluir contrato:", error);
      toast.error("Erro ao excluir contrato");
    },
  });

  return {
    contratos,
    isLoading,
    error,
    refetch,
    createContrato,
    updateContrato,
    deleteContrato,
  };
}

export function useContrato(id: string) {
  const { user } = useAuth();

  const query = useQuery({
    queryKey: ["contrato", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("contratos")
        .select(`
          *,
          obras(id, nome, endereco, cidade, estado),
          templates_contratos(id, nome, template_html, clausulas_obrigatorias),
          assinaturas_contratos(*)
        `)
        .eq("id", id)
        .single();

      if (error) {
        console.error("Erro ao buscar contrato:", error);
        throw error;
      }

      return data as Contrato & { assinaturas_contratos: {
        id: string;
        assinado_em?: string;
        assinado_por?: string;
        status: string;
      }[] };
    },
    enabled: !!user && !!id,
  });

  return {
    ...query,
    contrato: query.data,
  };
}

export function useTemplatesContratos() {
  return useQuery({
    queryKey: ["templates_contratos"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("templates_contratos")
        .select("*")
        .eq("ativo", true)
        .order("categoria", { ascending: true });

      if (error) {
        console.error("Erro ao buscar templates:", error);
        throw error;
      }

      return data as Template[];
    },
  });
}

export function useGerarPDF(contratoId: string) {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (preview: boolean = false) => {
      const { data, error } = await supabase.functions.invoke('gerar-contrato-pdf', {
        body: { 
          contrato_id: contratoId,
          preview_mode: preview
        }
      });

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      if (!data.preview) {
        queryClient.invalidateQueries({ queryKey: ["contrato", contratoId] });
        
        if (data.erro_upload) {
          toast.warning(data.mensagem || "Documento gerado mas houve erro no upload");
        } else if (data.pdf_url) {
          toast.success("Documento gerado e salvo com sucesso!");
        } else {
          toast.success("Documento gerado com sucesso!");
        }
      }
    },
    onError: (error: Error) => {
      console.error("Erro ao gerar documento:", error);
      toast.error("Erro ao gerar documento");
    },
  });
}

export function useEnviarAssinatura(contratoId: string) {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ email, telefone, mensagem }: { 
      email: string; 
      telefone?: string;
      mensagem?: string;
    }) => {
      const { data, error } = await supabase.functions.invoke('enviar-contrato-assinatura', {
        body: { 
          contrato_id: contratoId,
          email_contratado: email,
          telefone_contratado: telefone,
          mensagem_personalizada: mensagem
        }
      });

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["contrato", contratoId] });
      toast.success("Contrato enviado para assinatura!");
    },
    onError: (error: Error) => {
      console.error("Erro ao enviar para assinatura:", error);
      toast.error("Erro ao enviar contrato");
    },
  });
}