/**
 * Grants the MANAGER role to an existing user.
 *
 * MANAGER is the operational role (creates agreements, submits readings, triggers oracle
 * processing and payouts). Self-registration only allows PRODUCER and INVESTOR, so the
 * first MANAGER must be promoted by someone with database access.
 *
 * Usage: npx tsx src/scripts/promoteManager.ts <email>
 *
 * The email must match the stored value exactly. Registration normalizes emails
 * (express-validator normalizeEmail), e.g. lowercases them.
 */
import { PrismaClient } from '@prisma/client'

async function main(): Promise<void> {
  const email = process.argv[2]?.trim()
  if (!email) {
    console.error('Usage: npx tsx src/scripts/promoteManager.ts <email>')
    process.exitCode = 1
    return
  }

  const prisma = new PrismaClient()
  try {
    const user = await prisma.users.findUnique({ where: { email } })
    if (!user) {
      console.error(`No user found with email ${email} (it must match the stored, normalized value)`)
      process.exitCode = 1
      return
    }
    if (user.role === 'MANAGER') {
      console.log(`${email} is already MANAGER`)
      return
    }
    await prisma.users.update({
      where: { id: user.id },
      data: { role: 'MANAGER', updated_at: new Date() }
    })
    console.log(`${email}: ${user.role} → MANAGER`)
  } finally {
    await prisma.$disconnect()
  }
}

main().catch((error) => {
  console.error('Failed to promote user:', error)
  process.exitCode = 1
})
