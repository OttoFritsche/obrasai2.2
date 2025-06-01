import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Função para formatar um objeto Date ou string/number de data para dd/MM/yyyy
export function formatDate(date: Date | string | number | null | undefined): string {
  // Verifica se a data é nula ou indefinida, retorna string vazia
  if (!date) {
    return "";
  }
  
  // Tenta criar um objeto Date
  const dateObj = new Date(date);
  
  // Verifica se a data é inválida
  if (isNaN(dateObj.getTime())) {
    return "Data inválida"; // Retorna uma mensagem de erro ou string vazia
  }

  // Obtém o dia, mês e ano
  const day = String(dateObj.getDate()).padStart(2, '0'); // Garante dois dígitos para o dia
  const month = String(dateObj.getMonth() + 1).padStart(2, '0'); // getMonth() é 0-indexado, adiciona 1 e garante dois dígitos
  const year = dateObj.getFullYear(); // Obtém o ano completo

  // Retorna a data formatada
  return `${day}/${month}/${year}`;
}
