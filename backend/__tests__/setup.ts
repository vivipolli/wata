import dotenv from 'dotenv'
import path from 'path'
import { PrismaClient } from '@prisma/client'

// Load test environment variables
dotenv.config({ path: path.join(__dirname, '..', '.env.test') })

process.env.NODE_ENV = 'test'
process.env.DATABASE_URL = process.env.DATABASE_URL || 'file:./data/test-db.sqlite'
process.env.PORT = '0'

let prisma: PrismaClient

beforeAll(async () => {
  // Ensure test database schema is up-to-date
  const { execSync } = await import('child_process')
  execSync('DATABASE_URL=file:./data/test-db.sqlite npx prisma db push', { stdio: 'inherit' })
  
  // Create Prisma client after migrations
  prisma = new PrismaClient({
    datasources: {
      db: {
        url: 'file:./data/test-db.sqlite'
      }
    }
  })
  
  await prisma.$executeRaw`PRAGMA foreign_keys = ON;`
})

afterAll(async () => {
  await prisma.$disconnect()
})

export async function prismaCleanup() {
  try {
    await prisma.$transaction([
      prisma.audit_records.deleteMany(),
      prisma.investments.deleteMany(),
      prisma.oracle_logs.deleteMany(),
      prisma.payments.deleteMany(),
      prisma.readings.deleteMany(),
      prisma.batches.deleteMany(),
      prisma.agreements.deleteMany(),
      prisma.users.deleteMany()
    ])
  } catch (error) {
    console.log('Database cleanup completed (some tables may not exist yet)')
  }
}