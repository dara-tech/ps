import { MarketItem, MarketBuyingGoal, DealEvaluation } from '../../../../shared';

export interface MarketSearchParams {
  q?: string;
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  limit?: number;
  offset?: number;
  location?: string;
}

export interface MarketSearchResponse {
  items: MarketItem[];
  total: number;
  query: string;
  category?: string;
  timestamp: string;
}

export interface EvaluateItemRequest {
  item: MarketItem;
  targetGoalId?: string;
  budgetCap?: number;
}
