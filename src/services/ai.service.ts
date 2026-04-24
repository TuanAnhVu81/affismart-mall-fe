import api from "@/services/api";
import { useAuthStore } from "@/store/auth.store";
import type {
  AiChatResult,
  AiRecommendationResult,
  HomepageRecommendationsParams,
  RecommendationEventAction,
  RelatedRecommendationsParams,
  TrackRecommendationEventPayload,
} from "@/types/ai.types";

interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
}

interface AiRecommendationPayload {
  product_ids: number[];
  fallback_used: boolean;
  model_version: string;
  generated_at?: string;
}

interface AiChatPayload {
  answer: string;
  restricted_topic: boolean;
  model: string;
  generated_at?: string;
}

const AI_SESSION_STORAGE_KEY = "session_id";

const unwrapData = <T>(payload: ApiResponse<T> | T, errorMessage: string): T => {
  const data =
    payload && typeof payload === "object" && "data" in payload
      ? payload.data
      : payload;

  if (data === undefined || data === null) {
    throw new Error(errorMessage);
  }

  return data as T;
};

const normalizeRecommendationResult = (
  payload: AiRecommendationPayload,
): AiRecommendationResult => ({
  productIds: Array.isArray(payload.product_ids) ? payload.product_ids : [],
  fallbackUsed: Boolean(payload.fallback_used),
  modelVersion: payload.model_version,
  generatedAt: payload.generated_at,
});

const normalizeChatResult = (payload: AiChatPayload): AiChatResult => ({
  answer: payload.answer,
  restrictedTopic: Boolean(payload.restricted_topic),
  model: payload.model,
  generatedAt: payload.generated_at,
});

const sanitizeParams = (params: Record<string, unknown>) =>
  Object.fromEntries(
    Object.entries(params).filter(
      ([, value]) => value !== undefined && value !== null && value !== "",
    ),
  );

export const getSessionId = () => {
  if (typeof window === "undefined") {
    return "";
  }

  const existingSessionId = window.localStorage.getItem(AI_SESSION_STORAGE_KEY);
  if (existingSessionId) {
    return existingSessionId;
  }

  const generatedSessionId =
    window.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random()}`;
  window.localStorage.setItem(AI_SESSION_STORAGE_KEY, generatedSessionId);
  return generatedSessionId;
};

const resolveGuestSessionId = (sessionId?: string) => {
  const authenticatedUser = useAuthStore.getState().user;

  if (authenticatedUser) {
    return undefined;
  }

  return sessionId?.trim() || getSessionId();
};

export const getHomepageRecommendations = async (
  params: HomepageRecommendationsParams = {},
) => {
  const resolvedSessionId = resolveGuestSessionId(params.sessionId);
  const { data } = await api.get<ApiResponse<AiRecommendationPayload>>("/ai/recommendations", {
    params: sanitizeParams({
      session_id: resolvedSessionId,
      limit: params.limit,
    }),
  });
  const payload = unwrapData(data, "Invalid homepage recommendations response payload.");

  return normalizeRecommendationResult(payload);
};

export const getRelatedProducts = async (
  productId: number,
  params: RelatedRecommendationsParams = {},
) => {
  const { data } = await api.get<ApiResponse<AiRecommendationPayload>>(
    `/ai/recommendations/product/${productId}`,
    {
      params: sanitizeParams({
        limit: params.limit,
      }),
    },
  );
  const payload = unwrapData(data, "Invalid related recommendations response payload.");

  return normalizeRecommendationResult(payload);
};

export const sendChatMessage = async (message: string, sessionId?: string) => {
  const resolvedSessionId = resolveGuestSessionId(sessionId);
  const { data } = await api.post<ApiResponse<AiChatPayload>>("/ai/chat", {
    message: message.trim(),
    session_id: resolvedSessionId,
  });
  const payload = unwrapData(data, "Invalid AI chat response payload.");

  return normalizeChatResult(payload);
};

export const trackEvent = async (
  action: RecommendationEventAction,
  productId: number,
  sessionId?: string,
) => {
  const resolvedSessionId = resolveGuestSessionId(sessionId);

  await api.post<ApiResponse<void>>("/ai/events", {
    action,
    product_id: productId,
    session_id: resolvedSessionId,
  });
};

export const trackRecommendationEvent = async (
  payload: TrackRecommendationEventPayload,
) => trackEvent(payload.action, payload.productId, payload.sessionId);

export const trackEventInBackground = (
  action: RecommendationEventAction,
  productId: number,
  sessionId?: string,
) => {
  void trackEvent(action, productId, sessionId).catch(() => undefined);
};
