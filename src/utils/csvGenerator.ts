/**
 * Escapes a CSV field value
 * - Wraps in quotes if contains comma, quote, or newline
 * - Doubles any quotes inside the value
 */
export function escapeCsvField(value: string): string {
  if (value.includes(',') || value.includes('"') || value.includes('\n')) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

/**
 * Converts a 2D array to CSV format
 */
export function arrayToCsv(data: string[][]): string {
  return data.map(row => row.map(escapeCsvField).join(',')).join('\n');
}
