import { EmailConfiguration, AirflowConfig, RecipientConfig } from '../models';
import { randomUUID } from 'crypto';
import { TemplateService } from './TemplateService';
import { RecipientService } from './RecipientService';
import { ReportService } from './ReportService';
import { AggregationService } from './AggregationService';

export class ConfigurationService {
  private configurations: Map<string, EmailConfiguration> = new Map();

  constructor(
    private templateService: TemplateService,
    private recipientService: RecipientService,
    private reportService: ReportService,
    private aggregationService: AggregationService
  ) {}

  createConfiguration(label: string): EmailConfiguration {
    if (!label || label.trim().length === 0) {
      throw new Error('Configuration label is required');
    }

    const id = randomUUID();
    const now = new Date();

    // Create empty template
    const template = this.templateService.createTemplate('<html><body></body></html>');

    // Create recipient config
    const recipientConfig: RecipientConfig = {
      id,
      type: 'manual',
      manualEmails: [],
    };

    // Register recipient config with service
    this.recipientService.setManualRecipients(id, []);

    const config: EmailConfiguration = {
      id,
      label: label.trim(),
      template,
      recipientConfig,
      reportConfig: {
        id,
        tableReference: {
          database: '',
          table: '',
        },
      },
      aggregations: [],
      createdAt: now,
      updatedAt: now,
    };

    this.configurations.set(id, config);
    return config;
  }

  getConfiguration(id: string): EmailConfiguration {
    const config = this.configurations.get(id);
    if (!config) {
      throw new Error(`Configuration not found: ${id}`);
    }
    return config;
  }

  listConfigurations(): EmailConfiguration[] {
    return Array.from(this.configurations.values());
  }

  searchConfigurations(labelFilter: string): EmailConfiguration[] {
    const filter = labelFilter.toLowerCase();
    return Array.from(this.configurations.values()).filter(config =>
      config.label.toLowerCase().includes(filter)
    );
  }

  updateConfiguration(id: string, updates: Partial<EmailConfiguration>): EmailConfiguration {
    const existing = this.getConfiguration(id);

    const updated: EmailConfiguration = {
      ...existing,
      ...updates,
      id: existing.id, // Preserve ID
      createdAt: existing.createdAt, // Preserve creation date
      updatedAt: new Date(),
    };

    // Validate label if provided
    if (updates.label !== undefined && updates.label.trim().length === 0) {
      throw new Error('Configuration label is required');
    }

    this.configurations.set(id, updated);
    return updated;
  }

  deleteConfiguration(id: string): void {
    if (!this.configurations.has(id)) {
      throw new Error(`Configuration not found: ${id}`);
    }
    this.configurations.delete(id);
  }

  exportForAirflow(id: string): AirflowConfig {
    const config = this.getConfiguration(id);

    return {
      configId: config.id,
      label: config.label,
      templateContent: config.template.content,
      recipientSource: config.recipientConfig,
      reportTable: config.reportConfig.tableReference,
      aggregations: config.aggregations.map(agg => ({
        column: agg.column,
        type: agg.type,
        label: agg.label,
      })),
      schedule: config.schedule,
    };
  }
}
