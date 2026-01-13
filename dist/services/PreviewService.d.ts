import { EmailPreview, ComputedAggregation, EmailConfiguration } from '../models';
import { RecipientService } from './RecipientService';
import { AggregationService } from './AggregationService';
export declare class PreviewService {
    private recipientService;
    private aggregationService;
    constructor(recipientService: RecipientService, aggregationService: AggregationService);
    generatePreview(config: EmailConfiguration): Promise<EmailPreview>;
    renderTemplate(template: string, aggregations: ComputedAggregation[]): string;
}
//# sourceMappingURL=PreviewService.d.ts.map