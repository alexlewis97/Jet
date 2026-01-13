import { AggregationConfig, AggregationDef, ComputedAggregation, AggregationType } from '../models';
import { randomUUID } from 'crypto';

export class AggregationService {
  private aggregations: Map<string, AggregationConfig[]> = new Map();

  addAggregation(configId: string, aggregation: AggregationDef): AggregationConfig {
    const config: AggregationConfig = {
      id: randomUUID(),
      configId,
      column: aggregation.column,
      type: aggregation.type,
      label: aggregation.label,
    };

    const existing = this.aggregations.get(configId) || [];
    existing.push(config);
    this.aggregations.set(configId, existing);

    return config;
  }

  removeAggregation(configId: string, aggregationId: string): void {
    const existing = this.aggregations.get(configId) || [];
    const filtered = existing.filter(agg => agg.id !== aggregationId);
    
    if (filtered.length === existing.length) {
      throw new Error(`Aggregation not found: ${aggregationId}`);
    }
    
    this.aggregations.set(configId, filtered);
  }

  getAggregations(configId: string): AggregationConfig[] {
    return this.aggregations.get(configId) || [];
  }

  async computeAggregations(configId: string): Promise<ComputedAggregation[]> {
    const aggregations = this.getAggregations(configId);
    
    // Mock data for computation - in real system would query datalake
    const mockData: Record<string, number[]> = {
      revenue: [1000.50, 2500.75, 750.25],
      count: [10, 25, 5],
      id: [1, 2, 3],
    };

    return aggregations.map(agg => {
      const columnData = mockData[agg.column] || [];
      const value = this.computeAggregation(columnData, agg.type);
      
      return {
        label: agg.label,
        value,
      };
    });
  }

  private computeAggregation(data: number[], type: AggregationType): number {
    if (data.length === 0) {
      return 0;
    }

    switch (type) {
      case 'sum':
        return data.reduce((acc, val) => acc + val, 0);
      
      case 'average':
        const sum = data.reduce((acc, val) => acc + val, 0);
        return sum / data.length;
      
      case 'count':
        return data.length;
      
      case 'min':
        return Math.min(...data);
      
      case 'max':
        return Math.max(...data);
      
      default:
        throw new Error(`Unknown aggregation type: ${type}`);
    }
  }
}
