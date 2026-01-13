import { AggregationConfig, AggregationDef, ComputedAggregation } from '../models';
export declare class AggregationService {
    private aggregations;
    addAggregation(configId: string, aggregation: AggregationDef): AggregationConfig;
    removeAggregation(configId: string, aggregationId: string): void;
    getAggregations(configId: string): AggregationConfig[];
    computeAggregations(configId: string): Promise<ComputedAggregation[]>;
    private computeAggregation;
}
//# sourceMappingURL=AggregationService.d.ts.map