export type AISettings = {
  useByok: boolean;
  provider: string;
  model: string;
  baseUrl?: string | null;
  status: 'active' | 'platform-default' | 'invalid-config';
  updatedAt: string;
};

export type AISettingsPayload = {
  use_byok: boolean;
  provider: string;
  model: string;
  api_key?: string;
  base_url?: string;
};

const getApiBaseUrl = () => process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000/api';

export async function fetchAISettings(): Promise<AISettings> {
  const res = await fetch(`${getApiBaseUrl()}/settings/ai/`, {
    cache: 'no-store'
  });
  if (!res.ok) {
    throw new Error(`Failed to fetch AI settings (Status ${res.status})`);
  }
  return res.json();
}

export async function updateAISettings(payload: AISettingsPayload): Promise<AISettings> {
  const res = await fetch(`${getApiBaseUrl()}/settings/ai/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.detail || `Failed to update AI settings (Status ${res.status})`);
  }
  return res.json();
}

export async function resetAISettings(): Promise<AISettings> {
  const res = await fetch(`${getApiBaseUrl()}/settings/ai/`, {
    method: 'DELETE'
  });
  if (!res.ok) {
    throw new Error(`Failed to reset AI settings (Status ${res.status})`);
  }
  return res.json();
}
