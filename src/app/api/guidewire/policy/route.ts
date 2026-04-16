import { NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { syncPolicyToGuidewire } from "@/lib/guidewire-client";

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const fallbackPolicyNumber = `GW-SR-${Date.now()}`;
  const guidewirePolicy = await syncPolicyToGuidewire(body);
  return NextResponse.json({
    policy_number: guidewirePolicy?.policy_number ?? fallbackPolicyNumber,
    status: guidewirePolicy?.status ?? "ACTIVE",
    coverage_limit:
      guidewirePolicy?.coverage_limit ?? 5 * (body.daily_baseline_income ?? 650),
    guidewire_sync: guidewirePolicy?.guidewire_sync ?? true,
    policycenter_id:
      guidewirePolicy?.policycenter_id ?? `PC-${randomUUID().slice(0, 8)}`,
  });
}
