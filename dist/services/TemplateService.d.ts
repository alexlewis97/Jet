import { Template, ValidationResult } from '../models';
export declare class TemplateService {
    private templates;
    createTemplate(content: string): Template;
    getTemplate(id: string): Template;
    updateTemplate(id: string, content: string): Template;
    deleteTemplate(id: string): void;
    validateTemplate(content: string): ValidationResult;
}
//# sourceMappingURL=TemplateService.d.ts.map