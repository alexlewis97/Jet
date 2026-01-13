"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.renderTemplate = renderTemplate;
exports.detectPlaceholders = detectPlaceholders;
exports.hasUnresolvedPlaceholders = hasUnresolvedPlaceholders;
/**
 * Renders a template by replacing aggregation placeholders with computed values
 * Placeholder format: {{aggregation.label}}
 */
function renderTemplate(template, aggregations) {
    let rendered = template;
    // Create a map of label to value for quick lookup
    const aggregationMap = new Map();
    aggregations.forEach(agg => {
        aggregationMap.set(agg.label, agg.value);
    });
    // Replace all placeholders
    aggregations.forEach(agg => {
        const placeholder = `{{aggregation.${agg.label}}}`;
        const regex = new RegExp(placeholder.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g');
        rendered = rendered.replace(regex, String(agg.value));
    });
    return rendered;
}
/**
 * Detects all aggregation placeholders in a template
 * Returns array of labels found
 */
function detectPlaceholders(template) {
    const regex = /\{\{aggregation\.([^}]+)\}\}/g;
    const matches = [];
    let match;
    while ((match = regex.exec(template)) !== null) {
        matches.push(match[1]);
    }
    return matches;
}
/**
 * Checks if template has any unresolved placeholders
 */
function hasUnresolvedPlaceholders(template) {
    return /\{\{aggregation\.[^}]+\}\}/.test(template);
}
//# sourceMappingURL=templateRenderer.js.map