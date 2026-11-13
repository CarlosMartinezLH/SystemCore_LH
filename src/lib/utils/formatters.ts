/**
 * Utilidades de formateo institucional para LanAhora SystemCore
 */

/**
 * Formatea cantidades de dinero según el estándar institucional:
 * $000,000,000.00 (signo de pesos, comas para miles, punto decimal y exactamente dos decimales).
 * Ejemplo:
 *   150000    -> "$150,000.00"
 *   0         -> "$0.00"
 *   -1250.5   -> "-$1,250.50"
 */
export function formatMoney(amount: number | string | null | undefined): string {
  if (amount === null || amount === undefined || amount === '') return '$0.00';
  const num = typeof amount === 'number' ? amount : Number(amount);
  if (isNaN(num)) return '$0.00';
  const isNegative = num < 0;
  const absFormatted = Math.abs(num).toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  return isNegative ? `-$${absFormatted}` : `$${absFormatted}`;
}

/**
 * Formato numérico para cantidades monetarias sin el prefijo '$'
 * Ejemplo:
 *   150000    -> "150,000.00"
 *   0         -> "0.00"
 *   -1250.5   -> "-1,250.50"
 */
export function formatMoneyNumber(amount: number | string | null | undefined): string {
  if (amount === null || amount === undefined || amount === '') return '0.00';
  const num = typeof amount === 'number' ? amount : Number(amount);
  if (isNaN(num)) return '0.00';
  const isNegative = num < 0;
  const absFormatted = Math.abs(num).toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  return isNegative ? `-${absFormatted}` : absFormatted;
}
