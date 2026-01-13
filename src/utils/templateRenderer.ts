import { ComputedAggregation } from '../models';

/**
 * Renders a template by replacing aggregation placeholders with computed values
 * Placeholder format: {{aggregation.label}}
 */
export function renderTemplate(template: string, aggregations: ComputedAggregation[]): string {
  let rendered = template;

  // Create a map of label to value for quick lookup
  const aggregationMap = new Map<string, number | string>();
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
export function detectPlaceholders(template: string): string[] {
  const regex = /\{\{aggregation\.([^}]+)\}\}/g;
  const matches: string[] = [];
  let match;

  while ((match = regex.exec(template)) !== null) {
    matches.push(match[1]);
  }

  return matches;
}

/**
 * Checks if template has any unresolved placeholders
 */
export function hasUnresolvedPlaceholders(template: string): boolean {
  return /\{\{aggregation\.[^}]+\}\}/.test(template);
}
