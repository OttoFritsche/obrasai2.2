import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.29.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Configurações de validação
const ALLOWED_MIME_TYPES = [
  'application/pdf',
  'text/xml',
  'application/xml',
  'image/jpeg',
  'image/png',
  'image/jpg',
  'image/webp'
];

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

// Interfaces para dados processados
interface ProcessedPDFData {
  type: 'pdf';
  pages: number | null;
  text_extracted: boolean;
}

interface ProcessedImageData {
  type: 'image';
  original_dimensions: { width: number; height: number } | null;
  optimized: boolean;
}

type ProcessedFileData = ProcessedPDFData | ProcessedImageData | null;

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Obter o usuário autenticado
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Token de autorização necessário' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Criar cliente do Supabase
    const supabaseUrl = Deno.env.get('SUPABASE_URL') as string;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') as string;
    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      global: {
        headers: { Authorization: authHeader },
      },
    });

    // Obter dados do usuário
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: 'Usuário não autenticado' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Processar FormData
    const formData = await req.formData();
    const file = formData.get('file') as File;
    const categoria = formData.get('categoria') as string; // 'nota_fiscal', 'documento', etc.
    const entity_id = formData.get('entity_id') as string; // ID da obra, despesa, etc.

    if (!file) {
      return new Response(
        JSON.stringify({ error: 'Arquivo não fornecido' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Validações de segurança
    const validationResult = await validateFile(file);
    if (!validationResult.valid) {
      return new Response(
        JSON.stringify({ error: validationResult.error }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Gerar nome único para o arquivo
    const fileExtension = file.name.split('.').pop()?.toLowerCase();
    const fileName = `${crypto.randomUUID()}.${fileExtension}`;
    const folderPath = getFolderPath(categoria, user.id);
    const filePath = `${folderPath}/${fileName}`;

    // Upload para storage do Supabase
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('uploads')
      .upload(filePath, file, {
        contentType: file.type,
        upsert: false
      });

    if (uploadError) {
      console.error('❌ Erro no upload:', uploadError);
      return new Response(
        JSON.stringify({ error: 'Erro ao fazer upload do arquivo' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Obter URL pública
    const { data: publicUrlData } = supabase.storage
      .from('uploads')
      .getPublicUrl(filePath);

    // Metadados do arquivo
    const fileMetadata = {
      original_name: file.name,
      file_path: filePath,
      file_url: publicUrlData.publicUrl,
      mime_type: file.type,
      file_size: file.size,
      categoria,
      entity_id: entity_id || null,
      uploaded_by: user.id,
    };

    // Salvar metadados no banco (opcional - pode ser usado para auditoria)
    const { data: dbData, error: dbError } = await supabase
      .from('file_uploads')
      .insert(fileMetadata)
      .select()
      .single();

    if (dbError) {
      console.error('⚠️ Erro ao salvar metadados (não crítico):', dbError);
    }

    // Processar arquivo se necessário
    let processedData = null;
    if (file.type === 'application/pdf') {
      processedData = await processPDF(file, filePath);
    } else if (file.type.startsWith('image/')) {
      processedData = await processImage(file, filePath);
    }

    return new Response(
      JSON.stringify({
        success: true,
        file: {
          id: dbData?.id,
          original_name: file.name,
          file_path: filePath,
          file_url: publicUrlData.publicUrl,
          mime_type: file.type,
          file_size: file.size,
          processed_data: processedData
        }
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('❌ Erro no processamento do upload:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

// Função para validar arquivo
async function validateFile(file: File): Promise<{ valid: boolean; error?: string }> {
  // Verificar tipo MIME
  if (!ALLOWED_MIME_TYPES.includes(file.type)) {
    return {
      valid: false,
      error: `Tipo de arquivo não permitido: ${file.type}. Tipos permitidos: ${ALLOWED_MIME_TYPES.join(', ')}`
    };
  }

  // Verificar tamanho
  if (file.size > MAX_FILE_SIZE) {
    return {
      valid: false,
      error: `Arquivo muito grande: ${(file.size / 1024 / 1024).toFixed(2)}MB. Máximo permitido: ${MAX_FILE_SIZE / 1024 / 1024}MB`
    };
  }

  // Verificar se o arquivo está corrompido (verificação básica)
  const buffer = await file.arrayBuffer();
  if (buffer.byteLength === 0) {
    return {
      valid: false,
      error: 'Arquivo está vazio ou corrompido'
    };
  }

  // Verificar magic numbers para alguns tipos de arquivo
  const uint8Array = new Uint8Array(buffer);
  if (file.type === 'application/pdf' && !isPDF(uint8Array)) {
    return {
      valid: false,
      error: 'Arquivo não é um PDF válido'
    };
  }

  return { valid: true };
}

// Função para determinar caminho da pasta
function getFolderPath(categoria: string, userId: string): string {
  const baseFolder = `${userId}`;
  switch (categoria) {
    case 'nota_fiscal':
      return `${baseFolder}/notas_fiscais`;
    case 'documento':
      return `${baseFolder}/documentos`;
    case 'foto_obra':
      return `${baseFolder}/fotos_obras`;
    default:
      return `${baseFolder}/outros`;
  }
}

// Verificar se é PDF válido (magic number)
function isPDF(uint8Array: Uint8Array): boolean {
  const pdfSignature = [0x25, 0x50, 0x44, 0x46]; // %PDF
  return uint8Array.slice(0, 4).every((byte, index) => byte === pdfSignature[index]);
}

// Processar PDF (extrair metadados básicos)
async function processPDF(file: File, filePath: string): Promise<ProcessedPDFData | null> {
  try {
    // Aqui você pode adicionar processamento de PDF
    // - Extrair texto
    // - Contar páginas
    // - Extrair metadados
    return {
      type: 'pdf',
      pages: null, // Implementar contagem de páginas se necessário
      text_extracted: false // Implementar extração de texto se necessário
    };
  } catch (error) {
    console.error('❌ Erro ao processar PDF:', error);
    return null;
  }
}

// Processar imagem (otimização básica)
async function processImage(file: File, filePath: string): Promise<ProcessedImageData | null> {
  try {
    // Criar uma versão da imagem
    const img = new Image();
    const canvas = new OffscreenCanvas(800, 600);
    const ctx = canvas.getContext('2d');
    
    // Aqui você pode adicionar processamento de imagem
    // - Redimensionamento
    // - Compressão
    // - Extração de metadados EXIF
    
    return {
      type: 'image',
      original_dimensions: null, // Implementar se necessário
      optimized: false // Implementar otimização se necessário
    };
  } catch (error) {
    console.error('❌ Erro ao processar imagem:', error);
    return null;
  }
} 