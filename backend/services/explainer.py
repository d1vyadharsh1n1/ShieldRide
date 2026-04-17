from typing import Any


def generate_explanation(features: dict[str, Any], fraud_score: float) -> str:
    ranked = sorted(
        (
            (key, float(value))
            for key, value in features.items()
            if isinstance(value, (int, float))
        ),
        key=lambda item: abs(item[1]),
        reverse=True,
    )[:3]

    labels = ", ".join(name.replace("_", " ") for name, _ in ranked) or "stable signals"
    risk_band = "high" if fraud_score >= 0.65 else "medium" if fraud_score >= 0.35 else "low"

    return "\n".join(
        [
            f"Fraud score {fraud_score:.2f} falls in the {risk_band} band.",
            f"Top contributing features: {labels}.",
            "Behavior, geo consistency, and linkage signals are combined for the final decision.",
            "Weather or outage context can soften geo-risk when disruption looks genuine.",
        ]
    )
