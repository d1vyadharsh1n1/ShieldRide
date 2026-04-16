"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { FraudDemoInput } from "@/lib/fraud-scoring";

type FraudApiResponse = {
  fraud_score: number;
  risk_band: "low" | "medium" | "high";
  explanation: string;
  components: { B: number; G: number; L: number };
  contributions: {
    feature: keyof FraudDemoInput;
    label: string;
    impact: number;
    direction: "risk_up" | "risk_down";
  }[];
  top_contributors: {
    feature: keyof FraudDemoInput;
    label: string;
    impact: number;
    direction: "risk_up" | "risk_down";
  }[];
  decision_label: string;
};

type ClaimResponse = {
  claim?: {
    claimNumber: string;
    amount: number;
    fw: number;
    claimcenterId: string;
  };
  guidewire?: {
    claim?: { claim_number?: string; claimcenter_id?: string; status?: string } | null;
    payout?: { payout_id?: string; status?: string } | null;
  };
};

const INITIAL_VALUES: FraudDemoInput = {
  gps_variance: 0.28,
  session_duration: 0.42,
  tap_pressure: 0.3,
  swipe_speed: 0.36,
  cancellation_rate: 0.22,
  outage_flag: 0.45,
  rain_intensity: 0.61,
  device_switch: 0.12,
  claim_frequency: 0.18,
};

const HIGH_RISK_PRESET: FraudDemoInput = {
  gps_variance: 0.91,
  session_duration: 0.82,
  tap_pressure: 0.71,
  swipe_speed: 0.86,
  cancellation_rate: 0.88,
  outage_flag: 0.04,
  rain_intensity: 0.12,
  device_switch: 0.93,
  claim_frequency: 0.87,
};

const FIELD_META: Array<{
  key: keyof FraudDemoInput;
  label: string;
  hint: string;
}> = [
  { key: "gps_variance", label: "GPS variance", hint: "Location jitter across the trip" },
  { key: "session_duration", label: "Session duration", hint: "Short erratic sessions raise suspicion" },
  { key: "tap_pressure", label: "Tap pressure", hint: "Interaction pressure drift" },
  { key: "swipe_speed", label: "Swipe speed", hint: "Gesture velocity anomaly" },
  { key: "cancellation_rate", label: "Cancellation rate", hint: "Unusual cancel spikes" },
  { key: "outage_flag", label: "Outage flag", hint: "External outage lowers fraud suspicion" },
  { key: "rain_intensity", label: "Rain intensity", hint: "Real weather softens geo-risk" },
  { key: "device_switch", label: "Device switch", hint: "Fresh device changes raise risk" },
  { key: "claim_frequency", label: "Claim frequency", hint: "Recent claims concentration" },
];

function riskVariant(riskBand: "low" | "medium" | "high") {
  if (riskBand === "high") return "danger" as const;
  if (riskBand === "medium") return "warning" as const;
  return "success" as const;
}

function SliderRow({
  label,
  hint,
  value,
  onChange,
}: {
  label: string;
  hint: string;
  value: number;
  onChange: (value: number) => void;
}) {
  return (
    <div className="space-y-2 rounded-xl border border-slate-200 bg-slate-50 p-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-slate-900">{label}</p>
          <p className="text-xs text-slate-500">{hint}</p>
        </div>
        <span className="min-w-12 rounded-md bg-white px-2 py-1 text-right font-mono text-sm text-slate-700">
          {value.toFixed(2)}
        </span>
      </div>
      <input
        type="range"
        min={0}
        max={1}
        step={0.01}
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
        className="w-full accent-blue-600"
      />
    </div>
  );
}

export function FraudDemoClient() {
  const [values, setValues] = useState<FraudDemoInput>(INITIAL_VALUES);
  const [result, setResult] = useState<FraudApiResponse | null>(null);
  const [claimResult, setClaimResult] = useState<ClaimResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [claimLoading, setClaimLoading] = useState(false);

  const orderedContributions = useMemo(
    () =>
      [...(result?.contributions ?? [])].sort(
        (a, b) => Math.abs(b.impact) - Math.abs(a.impact)
      ),
    [result]
  );

  function setField(key: keyof FraudDemoInput, nextValue: number) {
    setValues((current) => ({ ...current, [key]: nextValue }));
  }

  async function computeRisk() {
    setLoading(true);
    setClaimResult(null);
    const response = await fetch("/api/fraud-score", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values),
    });
    const data = (await response.json()) as FraudApiResponse;
    setResult(data);
    setLoading(false);

    if (data.risk_band === "high") {
      setClaimLoading(true);
      const claimResponse = await fetch("/api/claims/simulate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          trigger: "RAINFALL",
          components: data.components,
        }),
      });
      setClaimResult((await claimResponse.json()) as ClaimResponse);
      setClaimLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <Card className="overflow-hidden border-slate-200 bg-white">
        <div className="bg-gradient-to-r from-blue-600 via-cyan-500 to-emerald-500 px-6 py-5 text-white">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-white/80">
            Live ML Demo
          </p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight">
            Fraud score, explanation, and claim trigger in one loop
          </h1>
          <p className="mt-2 max-w-3xl text-sm text-white/90">
            Tune the rider behavior and device signals, compute risk live, and if
            the score comes back high we automatically trigger the existing claim
            flow so Guidewire logs light up in the mock service.
          </p>
        </div>
        <CardContent className="grid gap-4 pt-6 md:grid-cols-3">
          <div className="rounded-xl border border-blue-100 bg-blue-50 p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-blue-700">
              Demo Flow
            </p>
            <p className="mt-2 text-sm text-blue-950">
              Frontend sliders to fraud API to explanation to claim trigger to mock Guidewire
            </p>
          </div>
          <div className="rounded-xl border border-amber-100 bg-amber-50 p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-amber-700">
              Model Path
            </p>
            <p className="mt-2 text-sm text-amber-950">
              Deterministic fallback scorer with explicit feature contributions.
            </p>
          </div>
          <div className="rounded-xl border border-emerald-100 bg-emerald-50 p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-emerald-700">
              Judge Friendly
            </p>
            <p className="mt-2 text-sm text-emerald-950">
              Clear score, color-coded band, short explanation, and visible claim sync.
            </p>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-[1.3fr_0.9fr]">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-3">
            <div>
              <CardTitle>FraudDemo controls</CardTitle>
              <p className="text-sm text-slate-500">
                All inputs are normalized between 0 and 1 for the demo path.
              </p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => setValues(INITIAL_VALUES)}>
                Reset
              </Button>
              <Button variant="outline" size="sm" onClick={() => setValues(HIGH_RISK_PRESET)}>
                Load high-risk preset
              </Button>
            </div>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
            {FIELD_META.map((field) => (
              <SliderRow
                key={field.key}
                label={field.label}
                hint={field.hint}
                value={values[field.key]}
                onChange={(nextValue) => setField(field.key, nextValue)}
              />
            ))}
            <div className="md:col-span-2 flex flex-wrap gap-3">
              <Button onClick={computeRisk} disabled={loading || claimLoading}>
                {loading ? "Computing..." : "Compute Risk"}
              </Button>
              <Button asChild variant="outline">
                <Link href="/claims">Open claims pipeline</Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Live output</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {result ? (
                <>
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-xs uppercase tracking-wide text-slate-500">
                        Fraud score
                      </p>
                      <p className="text-5xl font-bold text-slate-900">
                        {result.fraud_score.toFixed(2)}
                      </p>
                    </div>
                    <Badge variant={riskVariant(result.risk_band)} className="text-sm">
                      {result.risk_band.toUpperCase()}
                    </Badge>
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    <div className="rounded-lg border border-slate-200 p-3">
                      <p className="text-xs text-slate-500">Behavior</p>
                      <p className="font-mono text-lg">{result.components.B.toFixed(2)}</p>
                    </div>
                    <div className="rounded-lg border border-slate-200 p-3">
                      <p className="text-xs text-slate-500">Geo</p>
                      <p className="font-mono text-lg">{result.components.G.toFixed(2)}</p>
                    </div>
                    <div className="rounded-lg border border-slate-200 p-3">
                      <p className="text-xs text-slate-500">Linkage</p>
                      <p className="font-mono text-lg">{result.components.L.toFixed(2)}</p>
                    </div>
                  </div>
                  <p className="whitespace-pre-line rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-800">
                    {result.explanation}
                  </p>
                </>
              ) : (
                <p className="text-sm text-slate-500">
                  Compute a score to see the live explanation and decision band.
                </p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Feature contributions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {orderedContributions.length ? (
                orderedContributions.map((item) => (
                  <div
                    key={item.feature}
                    className="flex items-center justify-between rounded-lg border border-slate-200 px-3 py-2"
                  >
                    <div>
                      <p className="text-sm font-medium text-slate-900">{item.label}</p>
                      <p className="text-xs text-slate-500">
                        {item.direction === "risk_up" ? "Raises risk" : "Lowers risk"}
                      </p>
                    </div>
                    <span className="font-mono text-sm text-slate-700">
                      {item.impact >= 0 ? "+" : ""}
                      {item.impact.toFixed(3)}
                    </span>
                  </div>
                ))
              ) : (
                <p className="text-sm text-slate-500">
                  Contributions appear after the first score request.
                </p>
              )}
            </CardContent>
          </Card>

          <Card className={result?.risk_band === "high" ? "border-red-200 bg-red-50/50" : ""}>
            <CardHeader>
              <CardTitle>Claim hook</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-slate-700">
              {!result && <p>High-risk results automatically trigger the claim simulation.</p>}
              {result && result.risk_band !== "high" && (
                <p>
                  Current result is not high risk, so no claim was triggered yet.
                </p>
              )}
              {claimLoading && <p>Triggering claim and syncing to mock Guidewire...</p>}
              {claimResult?.claim && (
                <div className="space-y-2 rounded-xl border border-slate-200 bg-white p-4">
                  <p className="font-medium text-slate-900">
                    Claim created: {claimResult.claim.claimNumber}
                  </p>
                  <p>Amount: Rs {claimResult.claim.amount}</p>
                  <p>Stored F_w: {claimResult.claim.fw.toFixed(2)}</p>
                  <p>
                    Guidewire claim: {claimResult.guidewire?.claim?.claim_number || "mock fallback"}
                  </p>
                  <p>
                    Guidewire payout: {claimResult.guidewire?.payout?.payout_id || "mock fallback"}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
