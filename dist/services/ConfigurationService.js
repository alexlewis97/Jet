"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConfigurationService = void 0;
const crypto_1 = require("crypto");
class ConfigurationService {
    constructor(templateService, recipientService, reportService, aggregationService) {
        this.templateService = templateService;
        this.recipientService = recipientService;
        this.reportService = reportService;
        this.aggregationService = aggregationService;
        this.configurations = new Map();
    }
    createConfiguration(label) {
        if (!label || label.trim().length === 0) {
            throw new Error('Configuration label is required');
        }
        const id = (0, crypto_1.randomUUID)();
        const now = new Date();
        // Create empty template
        const template = this.templateService.createTemplate('<html><body></body></html>');
        // Create recipient config
        const recipientConfig = {
            id,
            type: 'manual',
            manualEmails: [],
        };
        // Register recipient config with service
        this.recipientService.setManualRecipients(id, []);
        const config = {
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
    getConfiguration(id) {
        const config = this.configurations.get(id);
        if (!config) {
            throw new Error(`Configuration not found: ${id}`);
        }
        return config;
    }
    listConfigurations() {
        return Array.from(this.configurations.values());
    }
    searchConfigurations(labelFilter) {
        const filter = labelFilter.toLowerCase();
        return Array.from(this.configurations.values()).filter(config => config.label.toLowerCase().includes(filter));
    }
    updateConfiguration(id, updates) {
        const existing = this.getConfiguration(id);
        const updated = {
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
    deleteConfiguration(id) {
        if (!this.configurations.has(id)) {
            throw new Error(`Configuration not found: ${id}`);
        }
        this.configurations.delete(id);
    }
    exportForAirflow(id) {
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
        };
    }
}
exports.ConfigurationService = ConfigurationService;
//# sourceMappingURL=ConfigurationService.js.map