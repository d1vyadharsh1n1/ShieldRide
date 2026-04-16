import { NextResponse } from "next/server";
import { generateExplanation } from "@/lib/explainer";
import { scoreFraudDemo } from "@/lib/fraud-scoring";

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const result = scoreFraudDemo(body);
  const explanation = await generateExplanation(
    result.features,
    result.fraud_score,
    result.risk_band,
    result.top_contributors
  );

  console.log("[fraud-score] request", result.features);
  console.log("[fraud-score] contributions", result.contributions);

  return NextResponse.json({
    fraud_score: result.fraud_score,
    risk_band: result.risk_band,
    explanation,
    components: {
      B: result.B,
      G: result.G,
      L: result.L,
    },
    contributions: result.contributions,
    top_contributors: result.top_contributors,
    decision_label: result.decision_label,
  });
}
