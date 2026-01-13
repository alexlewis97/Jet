import { ReportConfig, TableReference, ColumnInfo } from '../models';
import { arrayToCsv } from '../utils';
import { v4 as uuidv4 } from 'uuid';

export class ReportService {
  private configs: Map<string, ReportConfig> = new Map();
  // Mock datalake tables for validation
  private mockTables: Set<string> = new Set([
    'sales.weekly_summary',
    'users.subscribers',
    'analytics.metrics',
  ]);

  setReportSource(configId: string, tableRef: TableReference): ReportConfig {
    const config: ReportConfig = {
      id: configId,
      tableReference: tableRef,
    };

    this.configs.set(configId, config);
    return config;
  }

  getReportSource(configId: string): ReportConfig {
    const config = this.configs.get(configId);
    if (!config) {
      throw new Error(`Report config not found: ${configId}`);
    }
    return config;
  }

  async validateTableExists(tableRef: TableReference): Promise<boolean> {
    const tablePath = `${tableRef.database}.${tableRef.table}`;
    const exists = this.mockTables.has(tablePath);
    
    if (!exists) {
      throw new Error(`Table ${tablePath} does not exist`);
    }
    
    return true;
  }

  async getTableColumns(tableRef: TableReference): Promise<ColumnInfo[]> {
    await this.validateTableExists(tableRef);

    // Mock column data - in real system would query datalake metadata
    return [
      { name: 'id', type: 'integer' },
      { name: 'name', type: 'string' },
      { name: 'revenue', type: 'number' },
      { name: 'count', type: 'integer' },
      { name: 'created_at', type: 'timestamp' },
    ];
  }

  async generateCsv(tableRef: TableReference): Promise<Buffer> {
    await this.validateTableExists(tableRef);

    // Mock CSV generation - in real system would query datalake and format as CSV
    const mockData = [
      ['id', 'name', 'revenue', 'count', 'created_at'],
      ['1', 'Product A', '1000.50', '10', '2024-01-01'],
      ['2', 'Product B', '2500.75', '25', '2024-01-02'],
      ['3', 'Product C', '750.25', '5', '2024-01-03'],
    ];

    const csvContent = arrayToCsv(mockData);
    return Buffer.from(csvContent, 'utf-8');
  }
}
