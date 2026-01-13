import { EmailPreview, ComputedAggregation, EmailConfiguration } from '../models';
import { renderTemplate, hasUnresolvedPlaceholders } from '../utils';
import { RecipientService } from './RecipientService';
import { AggregationService } from './AggregationService';

export class PreviewService {
  constructor(
    private recipientService: RecipientService,
    private aggregationService: AggregationService
  ) {}

  async generatePreview(config: EmailConfiguration): Promise<EmailPreview> {
    const errors: string[] = [];

    try {
      // Get template content from config
      const templateContent = config.template.content;
      
      // Get and compute aggregations
      const aggregations = await this.aggregationService.computeAggregations(config.id);
      
      // Render template with aggregations
      const renderedHtml = this.renderTemplate(templateContent, aggregations);
      
      // Check for unresolved placeholders
      if (hasUnresolvedPlaceholders(renderedHtml)) {
        errors.push('Template contains unresolved placeholders');
      }
      
      // Get recipients
      const recipients = await this.recipientService.resolveRecipients(config.id);
      
      return {
        renderedHtml,
        recipientCount: recipients.length,
        recipients,
        aggregations,
        errors,
      };
    } catch (error) {
      errors.push(error instanceof Error ? error.message : 'Unknown error');
      
      return {
        renderedHtml: '',
        recipientCount: 0,
        recipients: [],
        aggregations: [],
        errors,
      };
    }
  }

  renderTemplate(template: string, aggregations: ComputedAggregation[]): string {
    return renderTemplate(template, aggregations);
  }
}
