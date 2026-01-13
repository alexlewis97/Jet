"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.escapeCsvField = escapeCsvField;
exports.arrayToCsv = arrayToCsv;
/**
 * Escapes a CSV field value
 * - Wraps in quotes if contains comma, quote, or newline
 * - Doubles any quotes inside the value
 */
function escapeCsvField(value) {
    if (value.includes(',') || value.includes('"') || value.includes('\n')) {
        return `"${value.replace(/"/g, '""')}"`;
    }
    return value;
}
/**
 * Converts a 2D array to CSV format
 */
function arrayToCsv(data) {
    return data.map(row => row.map(escapeCsvField).join(',')).join('\n');
}
//# sourceMappingURL=csvGenerator.js.map