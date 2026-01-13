import { RecipientConfig, TableReference } from '../models';
export declare class RecipientService {
    private configs;
    setManualRecipients(configId: string, emails: string[]): RecipientConfig;
    setDatalakeRecipients(configId: string, tableRef: TableReference): RecipientConfig;
    getRecipients(configId: string): RecipientConfig;
    validateEmail(email: string): boolean;
    resolveRecipients(configId: string): Promise<string[]>;
}
//# sourceMappingURL=RecipientService.d.ts.map