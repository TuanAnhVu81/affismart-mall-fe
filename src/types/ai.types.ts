export type RecommendationEventAction = "VIEW" | "ADD_TO_CART" | "PURCHASE";

export interface AiRecommendationResult {
  productIds: number[];
  fallbackUsed: boolean;
  modelVersion: string;
  generatedAt?: string;
}

export interface AiChatResult {
  answer: string;
  restrictedTopic: boolean;
  model: string;
  generatedAt?: string;
}

export interface HomepageRecommendationsParams {
  sessionId?: string;
  limit?: number;
}

export interface RelatedRecommendationsParams {
  limit?: number;
}

export interface TrackRecommendationEventPayload {
  action: RecommendationEventAction;
  productId: number;
  sessionId?: string;
}
