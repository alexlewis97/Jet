/**
 * Validates email format according to basic RFC 5322 rules
 * Requirements:
 * - Contains exactly one @ symbol
 * - Has non-empty local part (before @)
 * - Has non-empty domain part (after @)
 * - Domain contains at least one dot
 */
export declare function validateEmail(email: string): boolean;
//# sourceMappingURL=emailValidator.d.ts.map