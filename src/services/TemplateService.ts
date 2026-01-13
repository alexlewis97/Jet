import { Template, ValidationResult } from '../models';
import { randomUUID } from 'crypto';

export class TemplateService {
  private templates: Map<string, Template> = new Map();

  createTemplate(content: string): Template {
    const validation = this.validateTemplate(content);
    if (!validation.isValid) {
      throw new Error(validation.errors.join(', '));
    }

    const now = new Date();
    const template: Template = {
      id: randomUUID(),
      content,
      createdAt: now,
      updatedAt: now,
    };

    this.templates.set(template.id, template);
    return template;
  }

  getTemplate(id: string): Template {
    const template = this.templates.get(id);
    if (!template) {
      throw new Error(`Template not found: ${id}`);
    }
    return template;
  }

  updateTemplate(id: string, content: string): Template {
    const existing = this.templates.get(id);
    if (!existing) {
      throw new Error(`Template not found: ${id}`);
    }

    const validation = this.validateTemplate(content);
    if (!validation.isValid) {
      throw new Error(validation.errors.join(', '));
    }

    const updated: Template = {
      ...existing,
      content,
      updatedAt: new Date(),
    };

    this.templates.set(id, updated);
    return updated;
  }

  deleteTemplate(id: string): void {
    if (!this.templates.has(id)) {
      throw new Error(`Template not found: ${id}`);
    }
    this.templates.delete(id);
  }

  validateTemplate(content: string): ValidationResult {
    const errors: string[] = [];

    if (!content || content.trim().length === 0) {
      errors.push('Template content cannot be empty');
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }
}
