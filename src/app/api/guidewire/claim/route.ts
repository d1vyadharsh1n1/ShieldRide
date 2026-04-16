import { NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { fraudDecision } from "@/lib/fraud-engine";
import { syncClaimToGuidewire } from "@/lib/guidewire-client";

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const fw = Number(body.F_w_score ?? body.fw_score ?? 0.1);
  const d = fraudDecision(fw);
  const auto = fw < 0.5;
  const guidewireClaim = await syncClaimToGuidewire({
    ...body,
    fraud_score: fw,
    status: auto ? "AUTO_APPROVED" : "PENDING_REVIEW",
  });
  const claimNumber = guidewireClaim?.claim_number ?? `CLM-SR-${Date.now()}`;
  return NextResponse.json({
    claim_number: claimNumber,
    status: guidewireClaim?.status ?? (auto ? "AUTO_APPROVED" : "PENDING_REVIEW"),
    settlement_time_minutes: guidewireClaim?.settlement_time_minutes ?? (fw < 0.3 ? 4 : 30),
    guidewire_sync: guidewireClaim?.guidewire_sync ?? true,
    claimcenter_id:
      guidewireClaim?.claimcenter_id ?? `CC-${randomUUID().slice(0, 8)}`,
    decision: d.label,
  });
}
