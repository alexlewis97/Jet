import { EmailConfiguration, AirflowConfig } from '../models';
import { TemplateService } from './TemplateService';
import { RecipientService } from './RecipientService';
import { ReportService } from './ReportService';
import { AggregationService } from './AggregationService';
export declare class ConfigurationService {
    private templateService;
    private recipientService;
    private reportService;
    private aggregationService;
    private configurations;
    constructor(templateService: TemplateService, recipientService: RecipientService, reportService: ReportService, aggregationService: AggregationService);
    createConfiguration(label: string): EmailConfiguration;
    getConfiguration(id: string): EmailConfiguration;
    listConfigurations(): EmailConfiguration[];
    searchConfigurations(labelFilter: string): EmailConfiguration[];
    updateConfiguration(id: string, updates: Partial<EmailConfiguration>): EmailConfiguration;
    deleteConfiguration(id: string): void;
    exportForAirflow(id: string): AirflowConfig;
}
//# sourceMappingURL=ConfigurationService.d.ts.map