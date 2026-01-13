import { RecipientConfig, TableReference } from '../models';
import { validateEmail } from '../validators';
import { randomUUID } from 'crypto';

export class RecipientService {
  private configs: Map<string, RecipientConfig> = new Map();

  setManualRecipients(configId: string, emails: string[]): RecipientConfig {
    // Validate all emails
    const invalidEmails = emails.filter(email => !validateEmail(email));
    if (invalidEmails.length > 0) {
      throw new Error(`Invalid email format: ${invalidEmails.join(', ')}`);
    }

    const config: RecipientConfig = {
      id: configId,
      type: 'manual',
      manualEmails: emails,
    };

    this.configs.set(configId, config);
    return config;
  }

  setDatalakeRecipients(configId: string, tableRef: TableReference): RecipientConfig {
    if (!tableRef.emailColumn) {
      throw new Error('Email column must be specified for datalake recipients');
    }

    const config: RecipientConfig = {
      id: configId,
      type: 'datalake',
      tableReference: tableRef,
    };

    this.configs.set(configId, config);
    return config;
  }

  getRecipients(configId: string): RecipientConfig {
    const config = this.configs.get(configId);
    if (!config) {
      throw new Error(`Recipient config not found: ${configId}`);
    }
    return config;
  }

  validateEmail(email: string): boolean {
    return validateEmail(email);
  }

  async resolveRecipients(configId: string): Promise<string[]> {
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
