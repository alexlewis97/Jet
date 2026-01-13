"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateEmail = validateEmail;
/**
 * Validates email format according to basic RFC 5322 rules
 * Requirements:
 * - Contains exactly one @ symbol
 * - Has non-empty local part (before @)
 * - Has non-empty domain part (after @)
 * - Domain contains at least one dot
 */
function validateEmail(email) {
    if (!email || typeof email !== 'string') {
        return false;
    }
    // Trim whitespace
    const trimmed = email.trim();
    if (trimmed.length === 0) {
        return false;
    }
    // Check for exactly one @ symbol
    const atCount = (trimmed.match(/@/g) || []).length;
    if (atCount !== 1) {
        return false;
    }
    // Split into local and domain parts
    const parts = trimmed.split('@');
    const localPart = parts[0];
    const domainPart = parts[1];
    // Check local part is non-empty
    if (!localPart || localPart.length === 0) {
        return false;
    }
    // Check domain part is non-empty
    if (!domainPart || domainPart.length === 0) {
        return false;
    }
    // Check domain contains at least one dot
    if (!domainPart.includes('.')) {
        return false;
    }
    // Check domain doesn't start or end with dot
    if (domainPart.startsWith('.') || domainPart.endsWith('.')) {
        return false;
    }
    // Check no consecutive dots in domain
    if (domainPart.includes('..')) {
        return false;
    }
    return true;
}
//# sourceMappingURL=emailValidator.js.map