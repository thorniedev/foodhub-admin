export type AiProvider = "GOOGLE_GENAI" | "OPENAI";

export interface AiProviderKey {
  uuid: string;
  provider: AiProvider;
  label: string;
  maskedKey: string;
  active: boolean;
  enabled: boolean;
  lastUsedAt: string | null;
  lastErrorAt: string | null;
  lastErrorMessage: string | null;
  createdAt: string;
}

export interface CreateAiProviderKeyPayload {
  provider: AiProvider;
  label: string;
  apiKey: string;
  activate: boolean;
}

export interface UpdateAiProviderKeyPayload {
  label?: string | null;
  enabled?: boolean | null;
}
