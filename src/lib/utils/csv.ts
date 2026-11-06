/**
 * Sanitizes a cell value for safe CSV export.
 * Neutralizes CSV Formula Injection (CWE-1236) by prepending a single quote (')
 * if the text starts with formula triggers (=, +, -, @, \t, \r).
 * Also escapes internal double quotes (" -> "").
 */
export function sanitizeCsvField(value: any): string {
  if (value === null || value === undefined) {
    return '""';
  }

  const str = String(value).trim();

  // Check if string begins with dangerous formula execution characters
  const formulaTriggers = ['=', '+', '-', '@', '\t', '\r'];
  const hasTrigger = formulaTriggers.some((char) => str.startsWith(char));

  let safeStr = str.replace(/"/g, '""');

  if (hasTrigger) {
    // Prepend single quote to force spreadsheet software to treat it strictly as text literal
    safeStr = `'${safeStr}`;
  }

  return `"${safeStr}"`;
}

/**
 * Builds a valid RFC-4180 CSV string with UTF-8 BOM so Excel opens special characters (ñ, acentos) correctly.
 */
export function buildSafeCsv(headers: string[], rows: (string | number | boolean | null | undefined)[][]): string {
  const headerLine = headers.map((h) => sanitizeCsvField(h)).join(',');
  const rowLines = rows.map((r) => r.map((cell) => sanitizeCsvField(cell)).join(',')).join('\n');
  return `\uFEFF${headerLine}\n${rowLines}`;
}

