import { NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { payoutForTrigger } from "@/lib/trigger-engine";
import { RAJAN, SEED_POLICY } from "@/lib/seed-data";
import { computeFw } from "@/lib/fraud-engine";
import { razorpayUpiPayoutSandbox } from "@/lib/upi-utils";
import { sendPayoutNotification } from "@/lib/notifications";
import { demoCleanFraudSignals } from "@/lib/fraud-signals";
import { getSubFromAuthHeader, isUuid } from "@/lib/auth-request";
import { getPolicyByWorker, insertClaimRow } from "@/lib/db-queries";
import { hasSupabaseService } from "@/lib/supabase-server";
import {
  syncClaimToGuidewire,
  triggerGuidewirePayout,
} from "@/lib/guidewire-client";

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const trigger = (body.trigger as "RAINFALL") ?? "RAINFALL";
  const sub = await getSubFromAuthHeader(req);

  const providedComponents =
    body.components &&
    typeof body.components === "object" &&
    Number.isFinite(Number(body.components.B)) &&
    Number.isFinite(Number(body.components.G)) &&
    Number.isFinite(Number(body.components.L))
      ? {
          B: Number(body.components.B),
          G: Number(body.components.G),
          L: Number(body.components.L),
          flags: Array.isArray(body.components.flags) ? body.components.flags : [],
          narrative: Array.isArray(body.components.narrative)
            ? body.components.narrative
            : [],
        }
      : null;

  const fraud = providedComponents ?? demoCleanFraudSignals();
  const fw = computeFw({ B: fraud.B, G: fraud.G, L: fraud.L });
  const dailyBaseline = RAJAN.dailyBaseline;
  const amount = payoutForTrigger(trigger, dailyBaseline);

  const fraudPayload = {
    B: fraud.B,
    G: fraud.G,
    L: fraud.L,
    flags: fraud.flags,
    narrative: fraud.narrative,
    formula: "F_w = 0.40×B + 0.35×G + 0.25×L",
  };

  let workerId = RAJAN.id;
  if (sub && isUuid(sub)) workerId = sub;

  const activePolicy =
    hasSupabaseService() && isUuid(workerId)
      ? await getPolicyByWorker(workerId)
      : null;
  const policyNumber = activePolicy?.policy_number ?? SEED_POLICY.policyNumber;

  const guidewireClaim = await syncClaimToGuidewire({
    worker_id: workerId,
    policy_number: policyNumber,
    trigger_type: trigger,
    payout_amount: amount,
    fraud_score: fw,
    status: fw < 0.5 ? "AUTO_APPROVED" : "PENDING_REVIEW",
    fraud_signals: fraudPayload,
  });

  const claimNumber = guidewireClaim?.claim_number ?? `CLM-SR-${Date.now()}`;
  const claimcenterId =
    guidewireClaim?.claimcenter_id ?? `CC-${randomUUID().slice(0, 8)}`;

  const guidewirePayout = await triggerGuidewirePayout({
    claim_id: guidewireClaim?.id ?? claimcenterId,
    claim_number: claimNumber,
    payout_amount: amount,
    currency: "INR",
    destination: RAJAN.upiVpa,
    status: fw < 0.5 ? "PAID" : "PENDING_REVIEW",
  });

  const payout = await razorpayUpiPayoutSandbox({
    amountPaise: Math.round(amount * 100),
    vpa: RAJAN.upiVpa,
    reference: `sim_${Date.now()}`,
  });
  const notif = await sendPayoutNotification({
    workerName: RAJAN.name,
    amount,
  });

  if (hasSupabaseService() && isUuid(workerId)) {
    await insertClaimRow({
      workerId,
      policyId: activePolicy?.id ?? null,
      claimNumber,
      triggerType: trigger,
      payoutAmount: amount,
      fw,
      B: fraud.B,
      G: fraud.G,
      L: fraud.L,
      fraudSignals: fraudPayload,
      processedSeconds: 252,
      claimcenterId,
    });
  }

  return NextResponse.json({
    claim: {
      claimNumber,
      trigger,
      amount,
      fw,
      B: fraud.B,
      G: fraud.G,
      L: fraud.L,
      processedSec: 252,
      policyNumber,
      workerId,
      claimcenterId,
      at: Date.now(),
      fraudSignals: fraudPayload,
    },
    payout,
    guidewire: {
      claim: guidewireClaim,
      payout: guidewirePayout,
    },
    notification: notif,
    message: notif.text,
  });
}
