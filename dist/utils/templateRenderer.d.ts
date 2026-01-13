import { ComputedAggregation } from '../models';
/**
 * Renders a template by replacing aggregation placeholders with computed values
 * Placeholder format: {{aggregation.label}}
 */
export declare function renderTemplate(template: string, aggregations: ComputedAggregation[]): string;
/**
 * Detects all aggregation placeholders in a template
 * Returns array of labels found
 */
export declare function detectPlaceholders(template: string): string[];
/**
 * Checks if template has any unresolved placeholders
 */
export declare function hasUnresolvedPlaceholders(template: string): boolean;
//# sourceMappingURL=templateRenderer.d.ts.map