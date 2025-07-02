// Função para formatar CNPJ
export const formatCNPJ = (cnpj: string): string => {
  // Remove todos os caracteres não numéricos
  const cleaned = cnpj.replace(/\D/g, '');
  
  // Aplica a máscara do CNPJ: 00.000.000/0000-00
  return cleaned
    .replace(/^(\d{2})(\d)/, '$1.$2')
    .replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3')
    .replace(/\.(\d{3})(\d)/, '.$1/$2')
    .replace(/(\d{4})(\d)/, '$1-$2')
    .substring(0, 18); // Limita ao tamanho máximo do CNPJ formatado
};

// Função para formatar CPF
export const formatCPF = (cpf: string): string => {
  // Remove todos os caracteres não numéricos
  const cleaned = cpf.replace(/\D/g, '');
  
  // Aplica a máscara do CPF: 000.000.000-00
  return cleaned
    .replace(/^(\d{3})(\d)/, '$1.$2')
    .replace(/^(\d{3})\.(\d{3})(\d)/, '$1.$2.$3')
    .replace(/\.(\d{3})(\d)/, '.$1-$2')
    .substring(0, 14); // Limita ao tamanho máximo do CPF formatado
};

// Função para formatar telefone
export const formatPhone = (phone: string): string => {
  // Remove todos os caracteres não numéricos
  const cleaned = phone.replace(/\D/g, '');
  
  // Aplica a máscara do telefone baseado no tamanho
  if (cleaned.length <= 10) {
    // Telefone fixo: (00) 0000-0000
    return cleaned
      .replace(/^(\d{2})(\d)/, '($1) $2')
      .replace(/(\d{4})(\d)/, '$1-$2')
      .substring(0, 14);
  } else {
    // Celular: (00) 00000-0000
    return cleaned
      .replace(/^(\d{2})(\d)/, '($1) $2')
      .replace(/(\d{5})(\d)/, '$1-$2')
      .substring(0, 15);
  }
};

// Função para formatar CEP
export const formatCEP = (cep: string): string => {
  // Remove todos os caracteres não numéricos
  const cleaned = cep.replace(/\D/g, '');
  
  // Aplica a máscara do CEP: 00000-000
  return cleaned
    .replace(/^(\d{5})(\d)/, '$1-$2')
    .substring(0, 9);
};

// Função para formatar Inscrição Estadual
export const formatInscricaoEstadual = (ie: string): string => {
  // Remove todos os caracteres não numéricos
  const cleaned = ie.replace(/\D/g, '');
  
  // Aplica uma formatação básica para IE (pode variar por estado)
  // Formato genérico: 000.000.000.000
  return cleaned
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})\.(\d{3})(\d)/, '$1.$2.$3')
    .replace(/(\d{3})\.(\d{3})\.(\d{3})(\d)/, '$1.$2.$3.$4')
    .substring(0, 15); // Limita ao tamanho máximo
};

// Função para remover formatação (apenas números)
export const unformat = (value: string): string => {
  return value.replace(/\D/g, '');
};

// Função para validar se o valor está completo baseado no tipo
export const isComplete = (value: string, type: 'cnpj' | 'cpf' | 'phone' | 'cep'): boolean => {
  const cleaned = unformat(value);
  
  switch (type) {
    case 'cnpj':
      return cleaned.length === 14;
    case 'cpf':
      return cleaned.length === 11;
    case 'phone':
      return cleaned.length >= 10 && cleaned.length <= 11;
    case 'cep':
      return cleaned.length === 8;
    default:
      return false;
  }
};