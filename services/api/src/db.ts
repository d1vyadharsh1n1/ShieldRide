import { config } from 'dotenv'
import { existsSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { PrismaClient } from '@prisma/client'

// This file lives in `src/`; `.env` is one level up (services/api).
const apiDir = dirname(fileURLToPath(import.meta.url))
const envPath = join(apiDir, '..', '.env')

// Local dev / Docker Compose: shell may set DATABASE_URL (e.g. host `postgres`); `.env` should win.
// Vercel / production: platform env must win — never let a stray `.env` override DATABASE_URL with localhost.
const dotenvOverride =
  process.env['VERCEL'] !== '1' && process.env['NODE_ENV'] !== 'production'
const parsed = config({ path: envPath, override: dotenvOverride })
if (parsed.error) {
  console.error('[shieldride] dotenv failed:', envPath, parsed.error.message)
} else if (!existsSync(envPath)) {
  console.error('[shieldride] missing env file:', envPath)
}

export const prisma = new PrismaClient()

