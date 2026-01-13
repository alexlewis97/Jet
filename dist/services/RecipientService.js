"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RecipientService = void 0;
const validators_1 = require("../validators");
class RecipientService {
    constructor() {
        this.configs = new Map();
    }
    setManualRecipients(configId, emails) {
        // Validate all emails
        const invalidEmails = emails.filter(email => !(0, validators_1.validateEmail)(email));
        if (invalidEmails.length > 0) {
            throw new Error(`Invalid email format: ${invalidEmails.join(', ')}`);
        }
        const config = {
            id: configId,
            type: 'manual',
            manualEmails: emails,
        };
        this.configs.set(configId, config);
        return config;
    }
    setDatalakeRecipients(configId, tableRef) {
        if (!tableRef.emailColumn) {
            throw new Error('Email column must be specified for datalake recipients');
        }
        const config = {
            id: configId,
            type: 'datalake',
            tableReference: tableRef,
        };
        this.configs.set(configId, config);
        return config;
    }
    getRecipients(configId) {
        const config = this.configs.get(configId);
        if (!config) {
            throw new Error(`Recipient config not found: ${configId}`);
        }
        return config;
    }
    validateEmail(email) {
        return (0, validators_1.validateEmail)(email);
    }
    async resolveRecipients(configId) {
        const config = this.getRecipients(configId);
        if (config.type === 'manual') {
            return config.manualEmails || [];
        }
        // For datalake type, this would query the datalake
        // For now, return mock data
        if (config.type === 'datalake' && config.tableReference) {
            // Mock implementation - in real system would query datalake
            return ['user1@example.com', 'user2@example.com'];
        }
        return [];
    }
}
exports.RecipientService = RecipientService;
//# sourceMappingURL=RecipientService.js.map