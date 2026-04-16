# ShieldRide Demo Runbook

## What is already done

- Standalone mock Guidewire service exists with `POST /policy`, `POST /claim`, `GET /claim/{id}`, and `POST /payout`.
- Existing Next backend now calls the mock Guidewire service during policy activation and claim simulation payout flow.
- New `POST /api/fraud-score` endpoint returns `fraud_score`, `risk_band`, `explanation`, and contribution details.
- New `/fraud-demo` page provides live sliders, score updates, explanation text, and automatic claim triggering on high risk.
- Docker packaging exists for `frontend`, `backend`, `mock_guidewire`, and `postgres`.

## Startup

1. Start Docker Desktop or your local Docker daemon.
2. From the repo root, run:

```bash
docker compose up --build
```

3. Wait for these services to become healthy:

- `frontend` on `http://localhost:3000`
- `backend` on `http://localhost:3001/health`
- `mock_guidewire` on `http://localhost:8010/health`

## Judge flow

1. Open `http://localhost:3000/fraud-demo`.
2. Click `Load high-risk preset`.
3. Click `Compute Risk`.
4. Point out:

- the live fraud score
- the color-coded risk band
- the short explanation
- the feature contribution list

5. When the result is high risk, show that the page auto-triggers the claim flow.
6. In Docker logs for `mock_guidewire`, show the visible `POST /claim` and `POST /payout` requests.

## Quick checks

- Frontend page loads: `http://localhost:3000/fraud-demo`
- Backend health responds: `http://localhost:3001/health`
- Mock Guidewire health responds: `http://localhost:8010/health`
- High-risk preset triggers claim creation and Guidewire request logs

## Troubleshooting

- If Docker fails immediately, verify Docker Desktop is running.
- If `frontend` is up but the fraud page errors, check `frontend` logs for Next startup errors.
- If the claim hook runs without Guidewire logs, check the `GUIDEWIRE_MOCK_URL` wiring in compose.
- If `backend` is unhealthy, inspect Postgres startup and Prisma boot logs first.
