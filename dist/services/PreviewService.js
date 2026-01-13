"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PreviewService = void 0;
const utils_1 = require("../utils");
class PreviewService {
    constructor(recipientService, aggregationService) {
        this.recipientService = recipientService;
        this.aggregationService = aggregationService;
    }
    async generatePreview(config) {
        const errors = [];
        try {
            // Get template content from config
            const templateContent = config.template.content;
            // Get and compute aggregations
            const aggregations = await this.aggregationService.computeAggregations(config.id);
            // Render template with aggregations
            const renderedHtml = this.renderTemplate(templateContent, aggregations);
            // Check for unresolved placeholders
            if ((0, utils_1.hasUnresolvedPlaceholders)(renderedHtml)) {
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
        }
        catch (error) {
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
    renderTemplate(template, aggregations) {
        return (0, utils_1.renderTemplate)(template, aggregations);
    }
}
exports.PreviewService = PreviewService;
//# sourceMappingURL=PreviewService.js.map