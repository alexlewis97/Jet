import { ReportConfig, TableReference, ColumnInfo } from '../models';
export declare class ReportService {
    private configs;
    private mockTables;
    setReportSource(configId: string, tableRef: TableReference): ReportConfig;
    getReportSource(configId: string): ReportConfig;
    validateTableExists(tableRef: TableReference): Promise<boolean>;
    getTableColumns(tableRef: TableReference): Promise<ColumnInfo[]>;
    generateCsv(tableRef: TableReference): Promise<Buffer>;
}
//# sourceMappingURL=ReportService.d.ts.map