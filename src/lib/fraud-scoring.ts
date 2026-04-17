import { clamp01, computeFw, fraudDecision } from "./fraud-engine";

export type FraudDemoInput = {
  gps_variance: number;
  session_duration: number;
  tap_pressure: number;
  swipe_speed: number;
  cancellation_rate: number;
  outage_flag: number;
  rain_intensity: number;
  device_switch: number;
  claim_frequency: number;
};

export type FraudContribution = {
  feature: keyof FraudDemoInput;
  label: string;
  value: number;
  impact: number;
  direction: "risk_up" | "risk_down";
};

export type FraudScoreResult = {
  features: FraudDemoInput;
  fraud_score: number;
  risk_band: "low" | "medium" | "high";
  B: number;
  G: number;
  L: number;
  contributions: FraudContribution[];
  top_contributors: FraudContribution[];
  decision_label: string;
};

const FEATURE_LABELS: Record<keyof FraudDemoInput, string> = {
  gps_variance: "GPS variance",
  session_duration: "Session duration",
  tap_pressure: "Tap pressure drift",
  swipe_speed: "Swipe speed",
  cancellation_rate: "Cancellation rate",
  outage_flag: "Platform outage flag",
  rain_intensity: "Rain intensity",
  device_switch: "Device switching",
  claim_frequency: "Claim frequency",
};

function normalize(input: Partial<FraudDemoInput>): FraudDemoInput {
  return {
    gps_variance: clamp01(Number(input.gps_variance ?? 0)),
    session_duration: clamp01(Number(input.session_duration ?? 0)),
    tap_pressure: clamp01(Number(input.tap_pressure ?? 0)),
    swipe_speed: clamp01(Number(input.swipe_speed ?? 0)),
    cancellation_rate: clamp01(Number(input.cancellation_rate ?? 0)),
    outage_flag: clamp01(Number(input.outage_flag ?? 0)),
    rain_intensity: clamp01(Number(input.rain_intensity ?? 0)),
    device_switch: clamp01(Number(input.device_switch ?? 0)),
    claim_frequency: clamp01(Number(input.claim_frequency ?? 0)),
  };
}

export function scoreFraudDemo(
  input: Partial<FraudDemoInput>
): FraudScoreResult {
  const features = normalize(input);

  const B = clamp01(
    0.28 * features.session_duration +
      0.22 * features.tap_pressure +
      0.18 * features.swipe_speed +
      0.32 * features.cancellation_rate
  );

  const geoRelief = 0.18 * features.outage_flag + 0.12 * features.rain_intensity;
  const G = clamp01(0.72 * features.gps_variance - geoRelief + 0.12 * features.swipe_speed);

  const L = clamp01(
    0.58 * features.device_switch + 0.42 * features.claim_frequency
  );

  const fraud_score = Number(computeFw({ B, G, L }).toFixed(3));
  const risk_band =
    fraud_score < 0.35 ? "low" : fraud_score < 0.65 ? "medium" : "high";

  const baseContributions: FraudContribution[] = [
    {
      feature: "gps_variance",
      label: FEATURE_LABELS.gps_variance,
      value: features.gps_variance,
      impact: 0.252 * features.gps_variance,
      direction: "risk_up",
    },
    {
      feature: "session_duration",
      label: FEATURE_LABELS.session_duration,
      value: features.session_duration,
      impact: 0.112 * features.session_duration,
      direction: "risk_up",
    },
    {
      feature: "tap_pressure",
      label: FEATURE_LABELS.tap_pressure,
      value: features.tap_pressure,
      impact: 0.088 * features.tap_pressure,
      direction: "risk_up",
    },
    {
      feature: "swipe_speed",
      label: FEATURE_LABELS.swipe_speed,
      value: features.swipe_speed,
      impact: 0.114 * features.swipe_speed,
      direction: "risk_up",
    },
    {
      feature: "cancellation_rate",
      label: FEATURE_LABELS.cancellation_rate,
      value: features.cancellation_rate,
      impact: 0.128 * features.cancellation_rate,
      direction: "risk_up",
    },
    {
      feature: "outage_flag",
      label: FEATURE_LABELS.outage_flag,
      value: features.outage_flag,
      impact: -0.063 * features.outage_flag,
      direction: "risk_down",
    },
    {
      feature: "rain_intensity",
      label: FEATURE_LABELS.rain_intensity,
      value: features.rain_intensity,
      impact: -0.042 * features.rain_intensity,
      direction: "risk_down",
    },
    {
      feature: "device_switch",
      label: FEATURE_LABELS.device_switch,
      value: features.device_switch,
      impact: 0.145 * features.device_switch,
      direction: "risk_up",
    },
    {
      feature: "claim_frequency",
      label: FEATURE_LABELS.claim_frequency,
      value: features.claim_frequency,
      impact: 0.105 * features.claim_frequency,
      direction: "risk_up",
    },
  ];

  const contributions = baseContributions.map((row) => ({
    ...row,
    impact: Number(row.impact.toFixed(3)),
  }));
  const top_contributors = [...contributions]
    .sort((a, b) => Math.abs(b.impact) - Math.abs(a.impact))
    .slice(0, 3);
  const decision_label = fraudDecision(fraud_score).label;

  return {
    features,
    fraud_score,
    risk_band,
    B: Number(B.toFixed(3)),
    G: Number(G.toFixed(3)),
    L: Number(L.toFixed(3)),
    contributions,
    top_contributors,
    decision_label,
  };
}
