import { PreviewService } from './PreviewService';
import { RecipientService } from './RecipientService';
import { AggregationService } from './AggregationService';
import { TemplateService } from './TemplateService';
import { EmailConfiguration } from '../models';

// Mock uuid
jest.mock('uuid', () => ({
  v4: jest.fn(() => 'test-uuid-123')
}));

describe('PreviewService', () => {
  let previewService: PreviewService;
  let recipientService: RecipientService;
  let aggregationService: AggregationService;
  let templateService: TemplateService;

  beforeEach(() => {
    recipientService = new RecipientService();
    aggregationService = new AggregationService();
    templateService = new TemplateService();
    previewService = new PreviewService(recipientService, aggregationService);
  });

  describe('generatePreview', () => {
    it('should generate preview with template content', async () => {
      // Create a template
      const template = templateService.createTemplate('<html><body>Test Email</body></html>');
      
      // Create a config
      const config: EmailConfiguration = {
        id: 'test-config-1',
        label: 'Test Config',
        template,
        recipientConfig: {
          id: 'test-config-1',
          type: 'manual',
          manualEmails: ['test@example.com'],
        },
        reportConfig: {
          id: 'test-config-1',
          tableReference: {
            database: 'test',
            table: 'test',
          },
        },
        aggregations: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      // Set up recipients
      recipientService.setManualRecipients(config.id, ['test@example.com']);

      const preview = await previewService.generatePreview(config);

      expect(preview.renderedHtml).toBe('<html><body>Test Email</body></html>');
      expect(preview.recipientCount).toBe(1);
      expect(preview.recipients).toEqual(['test@example.com']);
      expect(preview.errors).toEqual([]);
    });

    it('should render aggregations in template', async () => {
      const template = templateService.createTemplate(
        '<html><body>Total: {{aggregation.Total Revenue}}</body></html>'
      );

      const config: EmailConfiguration = {
        id: 'test-config-2',
        label: 'Test Config',
        template,
        recipientConfig: {
          id: 'test-config-2',
          type: 'manual',
          manualEmails: ['test@example.com'],
        },
        reportConfig: {
          id: 'test-config-2',
          tableReference: {
            database: 'test',
            table: 'test',
          },
        },
        aggregations: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      // Add aggregation
      aggregationService.addAggregation(config.id, {
        column: 'revenue',
        type: 'sum',
        label: 'Total Revenue',
      });

      recipientService.setManualRecipients(config.id, ['test@example.com']);

      const preview = await previewService.generatePreview(config);

      expect(preview.renderedHtml).toContain('Total: ');
      expect(preview.renderedHtml).not.toContain('{{aggregation.Total Revenue}}');
      expect(preview.aggregations.length).toBe(1);
      expect(preview.aggregations[0].label).toBe('Total Revenue');
    });

    it('should show multiple recipients count', async () => {
      const template = templateService.createTemplate('<html><body>Test</body></html>');

      const config: EmailConfiguration = {
        id: 'test-config-3',
        label: 'Test Config',
        template,
        recipientConfig: {
          id: 'test-config-3',
          type: 'manual',
          manualEmails: ['user1@example.com', 'user2@example.com', 'user3@example.com'],
        },
        reportConfig: {
          id: 'test-config-3',
          tableReference: {
            database: 'test',
            table: 'test',
          },
        },
        aggregations: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      recipientService.setManualRecipients(config.id, [
        'user1@example.com',
        'user2@example.com',
        'user3@example.com',
      ]);

      const preview = await previewService.generatePreview(config);

      expect(preview.recipientCount).toBe(3);
      expect(preview.recipients).toHaveLength(3);
    });

    it('should detect unresolved placeholders', async () => {
      const template = templateService.createTemplate(
        '<html><body>Total: {{aggregation.Missing}}</body></html>'
      );

      const config: EmailConfiguration = {
        id: 'test-config-4',
        label: 'Test Config',
        template,
        recipientConfig: {
          id: 'test-config-4',
          type: 'manual',
          manualEmails: ['test@example.com'],
        },
        reportConfig: {
          id: 'test-config-4',
          tableReference: {
            database: 'test',
            table: 'test',
          },
        },
        aggregations: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      recipientService.setManualRecipients(config.id, ['test@example.com']);

      const preview = await previewService.generatePreview(config);

      expect(preview.errors).toContain('Template contains unresolved placeholders');
      expect(preview.renderedHtml).toContain('{{aggregation.Missing}}');
    });

    it('should handle empty template', async () => {
      const template = templateService.createTemplate('<html><body></body></html>');

      const config: EmailConfiguration = {
        id: 'test-config-5',
        label: 'Test Config',
        template,
        recipientConfig: {
          id: 'test-config-5',
          type: 'manual',
          manualEmails: [],
        },
        reportConfig: {
          id: 'test-config-5',
          tableReference: {
            database: 'test',
            table: 'test',
          },
        },
        aggregations: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      recipientService.setManualRecipients(config.id, []);

      const preview = await previewService.generatePreview(config);

      expect(preview.renderedHtml).toBe('<html><body></body></html>');
      expect(preview.recipientCount).toBe(0);
    });
  });
});
