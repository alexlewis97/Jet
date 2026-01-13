/**
 * Escapes a CSV field value
 * - Wraps in quotes if contains comma, quote, or newline
 * - Doubles any quotes inside the value
 */
export declare function escapeCsvField(value: string): string;
/**
 * Converts a 2D array to CSV format
 */
export declare function arrayToCsv(data: string[][]): string;
//# sourceMappingURL=csvGenerator.d.ts.map