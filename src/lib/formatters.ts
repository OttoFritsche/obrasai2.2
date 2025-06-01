
// Função para formatar CNPJ: 00000000000000 -> 00.000.000/0000-00
export function formatCNPJ(cnpj: string): string {
  // Remove caracteres não numéricos
  cnpj = cnpj.replace(/\D/g, '');
  
  // Garante que o CNPJ tenha 14 dígitos
  if (cnpj.length !== 14) return cnpj;
  
  // Aplica a formatação do CNPJ
  return cnpj.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
}

// Função para formatar CPF: 00000000000 -> 000.000.000-00
export function formatCPF(cpf: string): string {
  // Remove caracteres não numéricos
  cpf = cpf.replace(/\D/g, '');
  
  // Garante que o CPF tenha 11 dígitos
  if (cpf.length !== 11) return cpf;
  
  // Aplica a formatação do CPF
  return cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
}

// Função para formatar CEP: 00000000 -> 00000-000
export function formatCEP(cep: string): string {
  // Remove caracteres não numéricos
  cep = cep.replace(/\D/g, '');
  
  // Garante que o CEP tenha 8 dígitos
  if (cep.length !== 8) return cep;
  
  // Aplica a formatação do CEP
  return cep.replace(/(\d{5})(\d{3})/, '$1-$2');
}

// Função para formatar telefone: 00000000000 -> (00) 00000-0000 ou (00) 0000-0000
export function formatPhone(phone: string): string {
  // Remove caracteres não numéricos
  phone = phone.replace(/\D/g, '');
  
  // Formata o telefone dependendo da quantidade de dígitos
  if (phone.length === 11) {
    // Celular com 9 dígitos: (00) 00000-0000
    return phone.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
  } else if (phone.length === 10) {
    // Fixo com 8 dígitos: (00) 0000-0000
    return phone.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
  }
  
  return phone;
}

// Função para formatar valores monetários
export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(value);
}

// Função para formatar datas
export function formatDate(date: Date | string | null | undefined): string {
  if (!date) return '';
  
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  }).format(dateObj);
}

// Função para calcular a diferença em dias entre duas datas
export function daysBetweenDates(startDate: Date | string, endDate: Date | string): number {
  const start = typeof startDate === 'string' ? new Date(startDate) : startDate;
  const end = typeof endDate === 'string' ? new Date(endDate) : endDate;
  
  // Retorna a diferença em dias
  const diffTime = Math.abs(end.getTime() - start.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  return diffDays;
}

// Função para converter string para slug
export function slugify(text: string): string {
  return text
    .toString()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w-]+/g, '')
    .replace(/--+/g, '-');
}
