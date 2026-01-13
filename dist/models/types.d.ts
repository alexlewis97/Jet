export interface Template {
    id: string;
    content: string;
    createdAt: Date;
    updatedAt: Date;
}
export interface ValidationResult {
    isValid: boolean;
    errors: string[];
}
export interface TableReference {
    database: string;
    table: string;
    emailColumn?: string;
}
export interface RecipientConfig {
    id: string;
    type: 'manual' | 'datalake';
    manualEmails?: string[];
    tableReference?: TableReference;
}
export interface ReportConfig {
    id: string;
    tableReference: TableReference;
}
export interface ColumnInfo {
    name: string;
    type: string;
}
export type AggregationType = 'sum' | 'average' | 'count' | 'min' | 'max';
export interface AggregationDef {
    column: string;
    type: AggregationType;
    label: string;
}
export interface AggregationConfig {
    id: string;
    configId: string;
    column: string;
    type: AggregationType;
    label: string;
}
export interface ComputedAggregation {
    label: string;
    value: number | string;
}
export interface EmailConfiguration {
    id: string;
    label: string;
    template: Template;
    recipientConfig: RecipientConfig;
    reportConfig: ReportConfig;
    aggregations: AggregationConfig[];
    createdAt: Date;
    updatedAt: Date;
}
export interface EmailPreview {
    renderedHtml: string;
    recipientCount: number;
    recipients: string[];
    aggregations: ComputedAggregation[];
    errors: string[];
}
export interface AirflowConfig {
    configId: string;
    label: string;
    templateContent: string;
    recipientSource: RecipientConfig;
    reportTable: TableReference;
    aggregations: AggregationDef[];
}
//# sourceMappingURL=types.d.ts.map