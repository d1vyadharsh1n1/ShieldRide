import asyncio
import logging
import random
from datetime import datetime, timezone
from typing import Any
from uuid import uuid4

from fastapi import FastAPI, Request
from pydantic import BaseModel, Field


logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [mock-guidewire] %(levelname)s %(message)s",
)
logger = logging.getLogger("mock-guidewire")

app = FastAPI(title="ShieldRide Mock Guidewire", version="1.0.0")

POLICIES: dict[str, dict[str, Any]] = {}
CLAIMS: dict[str, dict[str, Any]] = {}
PAYOUTS: dict[str, dict[str, Any]] = {}


class PolicyPayload(BaseModel):
    worker_id: str | None = None
    name: str | None = None
    city: str | None = None
    platform: str | None = None
    vehicle_type: str | None = None
    weekly_premium: float | None = None
    rw: float | None = None
    alpha: float | None = None
    daily_baseline_income: float | None = None
    coverage_limit: float | None = None
    upi_vpa: str | None = None


class ClaimPayload(BaseModel):
    worker_id: str | None = None
    policy_number: str | None = None
    trigger_type: str = "RAINFALL"
    payout_amount: float = Field(default=0)
    fraud_score: float = Field(default=0)
    status: str | None = None
    fraud_signals: dict[str, Any] | None = None


class PayoutPayload(BaseModel):
    claim_id: str
    claim_number: str | None = None
    payout_amount: float = Field(default=0)
    currency: str = "INR"
    destination: str | None = None
    status: str | None = None


async def simulate_delay() -> None:
    await asyncio.sleep(random.uniform(0.2, 0.5))


def now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()


async def log_request(request: Request, body: Any) -> None:
    logger.info(
        "%s %s body=%s",
        request.method,
        request.url.path,
        body,
    )


@app.get("/health")
async def health() -> dict[str, str]:
    return {"status": "ok"}


@app.post("/policy")
async def create_policy(payload: PolicyPayload, request: Request) -> dict[str, Any]:
    await log_request(request, payload.model_dump())
    await simulate_delay()

    policy_number = f"GW-SR-{int(datetime.now().timestamp() * 1000)}"
    policycenter_id = f"PC-{uuid4().hex[:8]}"
    record = {
        "id": policycenter_id,
        "policy_number": policy_number,
        "policycenter_id": policycenter_id,
        "status": "ACTIVE",
        "guidewire_sync": True,
        "coverage_limit": payload.coverage_limit
        if payload.coverage_limit is not None
        else 5 * float(payload.daily_baseline_income or 650),
        "created_at": now_iso(),
        **payload.model_dump(),
    }
    POLICIES[policy_number] = record
    return record


@app.post("/claim")
async def create_claim(payload: ClaimPayload, request: Request) -> dict[str, Any]:
    await log_request(request, payload.model_dump())
    await simulate_delay()

    claim_id = f"CC-{uuid4().hex[:8]}"
    claim_number = f"CLM-SR-{int(datetime.now().timestamp() * 1000)}"
    record = {
        "id": claim_id,
        "claimcenter_id": claim_id,
        "claim_number": claim_number,
        "status": payload.status or "AUTO_APPROVED",
        "guidewire_sync": True,
        "settlement_time_minutes": 4 if payload.fraud_score < 0.3 else 30,
        "created_at": now_iso(),
        **payload.model_dump(),
    }
    CLAIMS[claim_id] = record
    CLAIMS[claim_number] = record
    return record


@app.get("/claim/{claim_id}")
async def get_claim(claim_id: str, request: Request) -> dict[str, Any]:
    await log_request(request, {"claim_id": claim_id})
    await simulate_delay()
    return CLAIMS.get(claim_id, {"error": "claim_not_found", "claim_id": claim_id})


@app.post("/payout")
async def create_payout(payload: PayoutPayload, request: Request) -> dict[str, Any]:
    await log_request(request, payload.model_dump())
    await simulate_delay()

    payout_id = f"PO-{uuid4().hex[:8]}"
    record = {
        "id": payout_id,
        "payout_id": payout_id,
        "status": payload.status or "PAID",
        "guidewire_sync": True,
        "processed_at": now_iso(),
        **payload.model_dump(),
    }
    PAYOUTS[payout_id] = record
    return record

