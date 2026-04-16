const DEFAULT_GUIDEWIRE_MOCK_URL = "http://127.0.0.1:8010";

function guidewireBaseUrl() {
  return (
    process.env.GUIDEWIRE_MOCK_URL ||
    process.env.NEXT_PUBLIC_GUIDEWIRE_MOCK_URL ||
    DEFAULT_GUIDEWIRE_MOCK_URL
  ).replace(/\/$/, "");
}

async function postGuidewire<T>(
  path: string,
  payload: Record<string, unknown>
): Promise<T | null> {
  try {
    const response = await fetch(`${guidewireBaseUrl()}${path}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(4000),
      cache: "no-store",
    });

    if (!response.ok) {
      console.warn(`[guidewire] ${path} failed with ${response.status}`);
      return null;
    }

    return (await response.json()) as T;
  } catch (error) {
    console.warn(`[guidewire] ${path} unreachable`, error);
    return null;
  }
}

export type GuidewirePolicyResponse = {
  policy_number: string;
  status: string;
  coverage_limit: number;
  guidewire_sync: boolean;
  policycenter_id: string;
};

export type GuidewireClaimResponse = {
  id?: string;
  claim_number: string;
  status: string;
  settlement_time_minutes?: number;
  guidewire_sync: boolean;
  claimcenter_id: string;
};

export type GuidewirePayoutResponse = {
  id: string;
  payout_id: string;
  status: string;
  guidewire_sync: boolean;
  processed_at: string;
};

export function getGuidewireBaseUrl() {
  return guidewireBaseUrl();
}

export async function syncPolicyToGuidewire(payload: Record<string, unknown>) {
  return postGuidewire<GuidewirePolicyResponse>("/policy", payload);
}

export async function syncClaimToGuidewire(payload: Record<string, unknown>) {
  return postGuidewire<GuidewireClaimResponse>("/claim", payload);
}

export async function triggerGuidewirePayout(payload: Record<string, unknown>) {
  return postGuidewire<GuidewirePayoutResponse>("/payout", payload);
}
