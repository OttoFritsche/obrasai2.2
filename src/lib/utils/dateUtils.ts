/**
 * Utilitários para formatação de datas
 * Elimina duplicação de formatação de datas em vários componentes
 */

/**
 * Formata data para o padrão brasileiro (dd/mm/aaaa)
 */
export function formatDateBR(date: Date | string | null | undefined): string {
  if (!date) return '';
  
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  if (isNaN(dateObj.getTime())) return '';
  
  return dateObj.toLocaleDateString('pt-BR');
}

/**
 * Formata data e hora para o padrão brasileiro (dd/mm/aaaa às hh:mm)
 */
export function formatDateTimeBR(date: Date | string | null | undefined): string {
  if (!date) return '';
  
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  if (isNaN(dateObj.getTime())) return '';
  
  return dateObj.toLocaleDateString('pt-BR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
}

/**
 * Formata apenas a hora (hh:mm)
 */
export function formatTimeBR(date: Date | string | null | undefined): string {
  if (!date) return '';
  
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  if (isNaN(dateObj.getTime())) return '';
  
  return dateObj.toLocaleTimeString('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
  });
}

/**
 * Verifica se uma data é válida
 */
export function isValidDate(date: unknown): boolean {
  if (!date) return false;
  
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  return dateObj instanceof Date && !isNaN(dateObj.getTime());
}

/**
 * Calcula a diferença em dias entre duas datas
 */
export function daysDifference(date1: Date | string, date2: Date | string): number {
  const d1 = typeof date1 === 'string' ? new Date(date1) : date1;
  const d2 = typeof date2 === 'string' ? new Date(date2) : date2;
  
  const diffTime = Math.abs(d2.getTime() - d1.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  return diffDays;
}

/**
 * Formata data para input do tipo date (yyyy-mm-dd)
 */
export function formatDateForInput(date: Date | string | null | undefined): string {
  if (!date) return '';
  
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  if (isNaN(dateObj.getTime())) return '';
  
  return dateObj.toISOString().split('T')[0];
}