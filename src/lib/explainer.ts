import type { FraudContribution, FraudDemoInput } from "./fraud-scoring";

type ExplanationContext = {
  features: FraudDemoInput;
  fraud_score: number;
  risk_band: "low" | "medium" | "high";
  top_contributors: FraudContribution[];
};

function buildFallbackExplanation(context: ExplanationContext) {
  const top = context.top_contributors;
  const first = top[0];
  const second = top[1];
  const third = top[2];
  const rainRelief =
    context.features.rain_intensity > 0.55 || context.features.outage_flag > 0.5;

  const lines = [
    `Fraud score ${context.fraud_score.toFixed(2)} sits in the ${context.risk_band} risk band.`,
    first
      ? `${first.label} is the biggest signal, pushing the score ${first.direction === "risk_up" ? "up" : "down"} by about ${Math.abs(first.impact).toFixed(2)}.`
      : "No strong feature signal was detected.",
    second
      ? `${second.label}${third ? ` and ${third.label}` : ""} are the next strongest contributors in this decision.`
      : "Other feature contributions are small and stable.",
    rainRelief
      ? "Rain or outage context softened the geo-risk so genuine disruption is less likely to be over-penalized."
      : "No strong external-disruption relief was applied, so behavior and device signals carried more weight.",
  ];

  return lines.join("\n");
}

async function generateWithOpenAI(context: ExplanationContext) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return null;

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: process.env.OPENAI_MODEL || "gpt-4o-mini",
      temperature: 0.2,
      messages: [
        {
          role: "system",
          content:
            "You explain fraud-scoring results for insurance demos. Respond in 3 to 4 short lines, plain English, human-readable, and mention the top contributing features.",
        },
        {
          role: "user",
          content: JSON.stringify(context),
        },
      ],
    }),
  });

  if (!response.ok) return null;
  const data = (await response.json()) as {
    choices?: Array<{ message?: { content?: string } }>;
  };
  return data.choices?.[0]?.message?.content?.trim() || null;
}

async function generateWithGemini(context: ExplanationContext) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${process.env.GEMINI_MODEL || "gemini-1.5-flash"}:generateContent?key=${apiKey}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [
          {
            role: "user",
            parts: [
              {
                text:
                  "Explain this fraud score in 3 to 4 short lines, plain English, and mention the top contributing features.\n" +
                  JSON.stringify(context),
              },
            ],
          },
        ],
      }),
    }
  );

  if (!response.ok) return null;
  const data = (await response.json()) as {
    candidates?: Array<{
      content?: { parts?: Array<{ text?: string }> };
    }>;
  };
  return data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || null;
}

export async function generateExplanation(
  features: FraudDemoInput,
  fraud_score: number,
  risk_band: "low" | "medium" | "high",
  top_contributors: FraudContribution[]
) {
  const context: ExplanationContext = {
    features,
    fraud_score,
    risk_band,
    top_contributors,
  };

  try {
    const llmText =
      (await generateWithOpenAI(context)) || (await generateWithGemini(context));
    if (llmText) return llmText;
  } catch (error) {
    console.warn("[explainer] LLM explanation failed, using fallback", error);
  }

  return buildFallbackExplanation(context);
}
