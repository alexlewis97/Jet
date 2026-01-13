"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TemplateService = void 0;
const uuid_1 = require("uuid");
class TemplateService {
    constructor() {
        this.templates = new Map();
    }
    createTemplate(content) {
        const validation = this.validateTemplate(content);
        if (!validation.isValid) {
            throw new Error(validation.errors.join(', '));
        }
        const now = new Date();
        const template = {
            id: (0, uuid_1.v4)(),
            content,
            createdAt: now,
            updatedAt: now,
        };
        this.templates.set(template.id, template);
        return template;
    }
    getTemplate(id) {
        const template = this.templates.get(id);
        if (!template) {
            throw new Error(`Template not found: ${id}`);
        }
        return template;
    }
    updateTemplate(id, content) {
        const existing = this.templates.get(id);
        if (!existing) {
            throw new Error(`Template not found: ${id}`);
        }
        const validation = this.validateTemplate(content);
        if (!validation.isValid) {
            throw new Error(validation.errors.join(', '));
        }
        const updated = {
            ...existing,
            content,
            updatedAt: new Date(),
        };
        this.templates.set(id, updated);
        return updated;
    }
    deleteTemplate(id) {
        if (!this.templates.has(id)) {
            throw new Error(`Template not found: ${id}`);
        }
        this.templates.delete(id);
    }
    validateTemplate(content) {
        const errors = [];
        if (!content || content.trim().length === 0) {
            errors.push('Template content cannot be empty');
        }
        return {
            isValid: errors.length === 0,
            errors,
        };
    }
}
exports.TemplateService = TemplateService;
//# sourceMappingURL=TemplateService.js.map