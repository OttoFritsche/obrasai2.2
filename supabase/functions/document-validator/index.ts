import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';

interface CepData {
  cep: string;
  logradouro: string;
  complemento: string;
  bairro: string;
  localidade: string;
  uf: string;
  ibge: string;
  gia: string;
  ddd: string;
  siafi: string;
}

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { documento, tipo } = await req.json();

    if (!documento || !tipo) {
      return new Response(
        JSON.stringify({ error: 'Documento e tipo são obrigatórios' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    let resultado;

    switch (tipo.toLowerCase()) {
      case 'cpf':
        resultado = validarCPF(documento);
        break;
      case 'cnpj':
        resultado = validarCNPJ(documento);
        break;
      case 'cep':
        resultado = await validarCEP(documento);
        break;
      default:
        return new Response(
          JSON.stringify({ error: 'Tipo de documento não suportado. Use: cpf, cnpj ou cep' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
    }

    return new Response(
      JSON.stringify(resultado),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('❌ Erro na validação:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

// Validar CPF
function validarCPF(cpf: string): { valido: boolean; formatado?: string; erro?: string } {
  try {
    // Remover caracteres não numéricos
    const cpfLimpo = cpf.replace(/\D/g, '');

    // Verificar se tem 11 dígitos
    if (cpfLimpo.length !== 11) {
      return { valido: false, erro: 'CPF deve ter 11 dígitos' };
    }

    // Verificar se todos os dígitos são iguais
    if (/^(\d)\1+$/.test(cpfLimpo)) {
      return { valido: false, erro: 'CPF não pode ter todos os dígitos iguais' };
    }

    // Validar dígitos verificadores
    let soma = 0;
    let resto;

    // Primeiro dígito verificador
    for (let i = 1; i <= 9; i++) {
      soma += parseInt(cpfLimpo.substring(i - 1, i)) * (11 - i);
    }
    resto = (soma * 10) % 11;
    if (resto === 10 || resto === 11) resto = 0;
    if (resto !== parseInt(cpfLimpo.substring(9, 10))) {
      return { valido: false, erro: 'CPF inválido - primeiro dígito verificador' };
    }

    // Segundo dígito verificador
    soma = 0;
    for (let i = 1; i <= 10; i++) {
      soma += parseInt(cpfLimpo.substring(i - 1, i)) * (12 - i);
    }
    resto = (soma * 10) % 11;
    if (resto === 10 || resto === 11) resto = 0;
    if (resto !== parseInt(cpfLimpo.substring(10, 11))) {
      return { valido: false, erro: 'CPF inválido - segundo dígito verificador' };
    }

    // Formatar CPF
    const cpfFormatado = cpfLimpo.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');

    return { 
      valido: true, 
      formatado: cpfFormatado,
      tipo: 'cpf'
    };

  } catch (error) {
    return { valido: false, erro: 'Erro ao validar CPF' };
  }
}

// Validar CNPJ
function validarCNPJ(cnpj: string): { valido: boolean; formatado?: string; erro?: string } {
  try {
    // Remover caracteres não numéricos
    const cnpjLimpo = cnpj.replace(/\D/g, '');

    // Verificar se tem 14 dígitos
    if (cnpjLimpo.length !== 14) {
      return { valido: false, erro: 'CNPJ deve ter 14 dígitos' };
    }

    // Verificar se todos os dígitos são iguais
    if (/^(\d)\1+$/.test(cnpjLimpo)) {
      return { valido: false, erro: 'CNPJ não pode ter todos os dígitos iguais' };
    }

    // Validar primeiro dígito verificador
    let tamanho = cnpjLimpo.length - 2;
    let numeros = cnpjLimpo.substring(0, tamanho);
    const digitos = cnpjLimpo.substring(tamanho);
    let soma = 0;
    let pos = tamanho - 7;

    for (let i = tamanho; i >= 1; i--) {
      soma += parseInt(numeros.charAt(tamanho - i)) * pos--;
      if (pos < 2) pos = 9;
    }

    let resultado = soma % 11 < 2 ? 0 : 11 - (soma % 11);
    if (resultado !== parseInt(digitos.charAt(0))) {
      return { valido: false, erro: 'CNPJ inválido - primeiro dígito verificador' };
    }

    // Validar segundo dígito verificador
    tamanho = tamanho + 1;
    numeros = cnpjLimpo.substring(0, tamanho);
    soma = 0;
    pos = tamanho - 7;

    for (let i = tamanho; i >= 1; i--) {
      soma += parseInt(numeros.charAt(tamanho - i)) * pos--;
      if (pos < 2) pos = 9;
    }

    resultado = soma % 11 < 2 ? 0 : 11 - (soma % 11);
    if (resultado !== parseInt(digitos.charAt(1))) {
      return { valido: false, erro: 'CNPJ inválido - segundo dígito verificador' };
    }

    // Formatar CNPJ
    const cnpjFormatado = cnpjLimpo.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');

    return { 
      valido: true, 
      formatado: cnpjFormatado,
      tipo: 'cnpj'
    };

  } catch (error) {
    return { valido: false, erro: 'Erro ao validar CNPJ' };
  }
}

// Validar e buscar CEP
async function validarCEP(cep: string): Promise<{ valido: boolean; dados?: CepData; erro?: string }> {
  try {
    // Remover caracteres não numéricos
    const cepLimpo = cep.replace(/\D/g, '');

    // Verificar se tem 8 dígitos
    if (cepLimpo.length !== 8) {
      return { valido: false, erro: 'CEP deve ter 8 dígitos' };
    }

    // Buscar CEP na API dos Correios (ViaCEP)
    const response = await fetch(`https://viacep.com.br/ws/${cepLimpo}/json/`);
    
    if (!response.ok) {
      return { valido: false, erro: 'Erro ao consultar CEP' };
    }

    const dados = await response.json();

    if (dados.erro) {
      return { valido: false, erro: 'CEP não encontrado' };
    }

    // Formatar CEP
    const cepFormatado = cepLimpo.replace(/(\d{5})(\d{3})/, '$1-$2');

    return {
      valido: true,
      formatado: cepFormatado,
      dados: {
        cep: cepFormatado,
        logradouro: dados.logradouro,
        complemento: dados.complemento,
        bairro: dados.bairro,
        localidade: dados.localidade,
        uf: dados.uf,
        ibge: dados.ibge,
        gia: dados.gia,
        ddd: dados.ddd,
        siafi: dados.siafi
      },
      tipo: 'cep'
    };

  } catch (error) {
    return { valido: false, erro: 'Erro ao validar CEP' };
  }
} 