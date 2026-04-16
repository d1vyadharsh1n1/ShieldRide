import { PrismaClient } from "@prisma/client";
import { computeRiskScore } from "@shieldride/shared";

const prisma = new PrismaClient();

async function main() {
  const worker = await prisma.worker.upsert({
    where: { phone: "9876543210" },
    update: {
      name: "Rajan Kumar",
      city: "Chennai",
      platform: "zepto",
      status: "active",
    },
    create: {
      phone: "9876543210",
      name: "Rajan Kumar",
      city: "Chennai",
      pincode: "600001",
      platform: "zepto",
      upiHandle: "rajan@upi",
      aadhaarLast4: "1234",
      baselineIncomePaise: 65000,
      deviceFingerprint: "demo-device",
      status: "active",
    },
  });

  const sensor = await prisma.sensorReading.create({
    data: {
      city: "Chennai",
      pincode: "600001",
      rainfallMmHr: 41,
      heatIndexC: 34,
      aqiScore: 168,
      cancelRatePct: 31,
      platformStatus: "degraded",
      orderDensity: 0.63,
      source: "platform",
    },
  });

  const risk = computeRiskScore({
    rainfallMmHr: sensor.rainfallMmHr,
    heatIndexC: sensor.heatIndexC,
    aqiScore: sensor.aqiScore,
    cancelRatePct: sensor.cancelRatePct,
    platformStatus: sensor.platformStatus,
  });

  const latestPolicy = await prisma.policy.findFirst({
    where: { workerId: worker.id, status: "active" },
    orderBy: { createdAt: "desc" },
  });

  const policy =
    latestPolicy ??
    (await prisma.policy.create({
      data: {
        workerId: worker.id,
        weekStart: new Date(),
        weekEnd: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        premiumAmountPaise: risk.premiumPaise,
        riskScore: risk.riskScore,
        status: "active",
        premiumPaidAt: new Date(),
      },
    }));

  const existingPayout = await prisma.payout.findFirst({
    where: { workerId: worker.id },
  });

  const payout =
    existingPayout ??
    (await prisma.payout.create({
      data: {
        workerId: worker.id,
        triggerType: "rainfall",
        triggerValue: sensor.rainfallMmHr,
        payoutAmountPaise: 52000,
        status: "credited",
        fraudScore: 0.22,
        fraudComponents: {
          policyId: policy.id,
          B: 0.18,
          G: 0.24,
          L: 0.2,
        },
        creditedAt: new Date(),
      },
    }));

  const existingFlag = await prisma.fraudFlag.findFirst({
    where: { payoutId: payout.id },
  });

  if (!existingFlag) {
    await prisma.fraudFlag.create({
      data: {
        workerId: worker.id,
        payoutId: payout.id,
        type: "behavioral",
        scoreB: 0.34,
        scoreG: 0.29,
        scoreL: 0.18,
        scoreTotal: 0.28,
        reviewStatus: "pending",
      },
    });
  }
}

main()
  .catch((error) => {
    console.error("[seed] failed", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
