import { PrismaClient } from '@prisma/client'

declare global {
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined
}

const getPrismaClient = () => {
  if (process.env.NODE_ENV === 'test') {
    return new PrismaClient({
      datasources: {
        db: {
          url: process.env.DATABASE_URL
        }
      }
    })
  }
  
  return globalThis.prisma || new PrismaClient()
}
import type {
  Prisma,
  agreements,
  readings,
  payments,
  batches,
  oracle_logs,
  investments,
  audit_records,
  users
} from '@prisma/client'

export interface AgreementData {
  agreementHash: string
  producerName: string
  producerAddress: string
  baseValue: number
  hectares: number
  locationLat?: number
  locationLng?: number
  durationDays?: number
}

export interface ReadingData {
  agreementId: number
  turbidityNtu: number
  locationLat?: number
  locationLng?: number
  isSimulated: boolean
  auditHash?: string
}

export interface PaymentData {
  agreementId: number
  batchId?: number | null
  amount: number
  transactionHash?: string | null
  status: 'pending' | 'processing' | 'completed' | 'failed'
  auditHash?: string | null
  score?: number | null
  hcsTransactionId?: string | null
  hfsFileId?: string | null
  investorAddress?: string | null
  nftTokenId?: string | null
  nftSerial?: number | null
  nftTransactionId?: string | null
  nftMetadataUri?: string | null
  investorNftTokenId?: string | null
  investorNftSerial?: number | null
  investorNftTransactionId?: string | null
  investorNftMetadataUri?: string | null
  producerNftTransferred?: boolean
  producerNftTransferTx?: string | null
  investorNftTransferred?: boolean
  investorNftTransferTx?: string | null
}

export interface BatchData {
  agreementId: number
  auditHash: string
  oracleSignature?: string | null
  score: number
  readingsCount: number
  averageTurbidity: number
  medianTurbidity?: number | null
  outliersDetected?: number | null
  validationStatus?: 'pending' | 'validated' | 'rejected'
  oracleAddress?: string | null
  hcsTransactionId?: string | null
  hfsFileId?: string | null
  submittedAt?: Date | null
}

export interface OracleLogData {
  batchId: number
  action: string
  details?: string | null
  oracleAddress?: string | null
  transactionHash?: string | null
}

export interface UserData {
  email: string
  name: string
  password: string
  role: string
  address?: string | null
  isActive: boolean
  lastLogin?: Date | null
  createdAt?: Date
}

type UserSummary = Pick<users, 'id' | 'email' | 'name' | 'role' | 'address' | 'is_active' | 'last_login' | 'created_at'>

export class PrismaDatabase {
  private prisma: PrismaClient

  constructor() {
    this.prisma = getPrismaClient()
  }

  async initialize(): Promise<void> {
    await this.prisma.$queryRaw`SELECT 1`
  }

  async createAgreement(data: AgreementData): Promise<number> {
    const agreement = await this.prisma.agreements.create({
      data: {
        agreement_hash: data.agreementHash,
        producer_name: data.producerName,
        producer_address: data.producerAddress,
        base_value: data.baseValue,
        hectares: data.hectares,
        location_lat: data.locationLat ?? null,
        location_lng: data.locationLng ?? null,
        duration_days: data.durationDays ?? null
      }
    })
    return agreement.id
  }

  async getAgreement(id: number): Promise<agreements | null> {
    return this.prisma.agreements.findUnique({ where: { id } })
  }

  async getAgreementByHash(agreementHash: string): Promise<agreements | null> {
    return this.prisma.agreements.findUnique({ where: { agreement_hash: agreementHash } })
  }

  async updateAgreementBlockchainId(id: number, blockchainId: number): Promise<void> {
    await this.prisma.agreements.update({
      where: { id },
      data: { blockchain_id: blockchainId }
    })
  }

  async updateAgreementTransactionId(id: number, transactionId: string): Promise<void> {
    await this.prisma.agreements.update({
      where: { id },
      data: { transaction_id: transactionId }
    })
  }

  async getAllAgreements(): Promise<agreements[]> {
    return this.prisma.agreements.findMany({
      where: { is_active: true },
      orderBy: { created_at: 'desc' }
    })
  }

  async getAgreementsByProducer(producerAddress: string): Promise<agreements[]> {
    return this.prisma.agreements.findMany({
      where: { producer_address: producerAddress, is_active: true },
      orderBy: { created_at: 'desc' }
    })
  }

  async createReading(data: ReadingData): Promise<number> {
    const reading = await this.prisma.readings.create({
      data: {
        agreement_id: data.agreementId,
        turbidity_ntu: data.turbidityNtu,
        location_lat: data.locationLat ?? null,
        location_lng: data.locationLng ?? null,
        is_simulated: data.isSimulated,
        audit_hash: data.auditHash ?? null
      }
    })
    return reading.id
  }

  async getReadingsByAgreement(agreementId: number, limit = 50): Promise<readings[]> {
    return this.prisma.readings.findMany({
      where: { agreement_id: agreementId },
      orderBy: { timestamp: 'desc' },
      take: limit
    })
  }

  async getRecentReadings(limit = 100): Promise<(readings & { agreement: { id: number; agreement_hash: string; producer_name: string; producer_address: string; created_at: Date } })[]> {
    return this.prisma.readings.findMany({
      include: { 
        agreement: {
          select: {
            id: true,
            producer_name: true,
            producer_address: true,
            agreement_hash: true,
            created_at: true
          }
        }
      },
      orderBy: { timestamp: 'desc' },
      take: limit
    })
  }

  async getReadingsForValidation(agreementId: number, cutoffDate: Date): Promise<readings[]> {
    return this.prisma.readings.findMany({
      where: {
        agreement_id: agreementId,
        timestamp: { gte: cutoffDate },
        is_validated: false
      },
      orderBy: { timestamp: 'asc' }
    })
  }

  async countReadingsForAgreement(agreementId: number): Promise<number> {
    return this.prisma.readings.count({ where: { agreement_id: agreementId } })
  }

  async countValidatedReadingsForAgreement(agreementId: number): Promise<number> {
    return this.prisma.readings.count({ where: { agreement_id: agreementId, is_validated: true } })
  }

  async markReadingsAsValidated(batchId: number, readingIds: number[]): Promise<void> {
    if (readingIds.length === 0) return
    await this.prisma.readings.updateMany({
      where: { id: { in: readingIds } },
      data: {
        is_validated: true,
        batch_id: batchId
      }
    })
  }

  async createPayment(data: PaymentData): Promise<number> {
    const payment = await this.prisma.payments.create({
      data: {
        agreement_id: data.agreementId,
        batch_id: data.batchId ?? null,
        amount: data.amount,
        transaction_hash: data.transactionHash ?? null,
        status: data.status,
        audit_hash: data.auditHash ?? null,
        score: data.score ?? null,
        hcs_transaction_id: data.hcsTransactionId ?? null,
        hfs_file_id: data.hfsFileId ?? null,
        investor_address: data.investorAddress ?? null,
        nft_token_id: data.nftTokenId ?? null,
        nft_serial: data.nftSerial ?? null,
        nft_transaction_id: data.nftTransactionId ?? null,
        nft_metadata_uri: data.nftMetadataUri ?? null,
        investor_nft_token_id: data.investorNftTokenId ?? null,
        investor_nft_serial: data.investorNftSerial ?? null,
        investor_nft_transaction_id: data.investorNftTransactionId ?? null,
        investor_nft_metadata_uri: data.investorNftMetadataUri ?? null,
        producer_nft_transferred: data.producerNftTransferred ?? false,
        producer_nft_transfer_tx: data.producerNftTransferTx ?? null,
        investor_nft_transferred: data.investorNftTransferred ?? false,
        investor_nft_transfer_tx: data.investorNftTransferTx ?? null
      }
    })
    return payment.id
  }

  async updatePaymentStatus(paymentId: number, status: string, transactionHash?: string): Promise<void> {
    await this.prisma.payments.update({
      where: { id: paymentId },
      data: {
        status,
        transaction_hash: transactionHash ?? undefined,
        processed_at: status === 'completed' ? new Date() : undefined
      }
    })
  }

  async getPaymentsByAgreement(agreementId: number): Promise<payments[]> {
    return this.prisma.payments.findMany({
      where: { agreement_id: agreementId },
      orderBy: { created_at: 'desc' },
      select: {
        id: true,
        agreement_id: true,
        batch_id: true,
        amount: true,
        transaction_hash: true,
        status: true,
        created_at: true,
        processed_at: true,
        audit_hash: true,
        score: true,
        hcs_transaction_id: true,
        hfs_file_id: true,
        investor_address: true,
        nft_token_id: true,
        nft_serial: true,
        nft_transaction_id: true,
        nft_metadata_uri: true,
        investor_nft_token_id: true,
        investor_nft_serial: true,
        investor_nft_transaction_id: true,
        investor_nft_metadata_uri: true,
        producer_nft_transferred: true,
        producer_nft_transfer_tx: true,
        investor_nft_transferred: true,
        investor_nft_transfer_tx: true
      }
    })
  }

  async getPendingPayments(): Promise<payments[]> {
    return this.prisma.payments.findMany({
      where: { status: 'pending' },
      orderBy: { created_at: 'asc' }
    })
  }

  async getPayment(paymentId: number): Promise<payments | null> {
    return this.prisma.payments.findUnique({ where: { id: paymentId } })
  }

  async getPaymentHistory(params: { limit: number; status?: string }): Promise<payments[]> {
    const { limit, status } = params
    return this.prisma.payments.findMany({
      where: status ? { status } : undefined,
      orderBy: { created_at: 'desc' },
      take: limit
    })
  }

  async getPaymentsByProducerAddress(params: { producerAddress: string; limit: number; status?: string }): Promise<payments[]> {
    const { producerAddress, limit, status } = params
    return this.prisma.payments.findMany({
      where: {
        agreement: {
          producer_address: producerAddress
        },
        ...(status ? { status } : {})
      },
      include: { agreement: true },
      orderBy: { created_at: 'desc' },
      take: limit
    })
  }

  async getPaymentsWithBlockchainData(params: { producerAddress: string; limit: number }): Promise<payments[]> {
    const { producerAddress, limit } = params
    return this.prisma.payments.findMany({
      where: {
        agreement: {
          producer_address: producerAddress
        },
        audit_hash: { not: null }
      },
      include: { agreement: true },
      orderBy: { created_at: 'desc' },
      take: limit
    })
  }

  async createBatch(data: BatchData): Promise<number> {
    const batch = await this.prisma.batches.create({
      data: {
        agreement_id: data.agreementId,
        audit_hash: data.auditHash,
        oracle_signature: data.oracleSignature ?? null,
        score: data.score,
        readings_count: data.readingsCount,
        average_turbidity: data.averageTurbidity,
        median_turbidity: data.medianTurbidity ?? null,
        outliers_detected: data.outliersDetected ?? 0,
        validation_status: data.validationStatus ?? 'pending',
        oracle_address: data.oracleAddress ?? null,
        hcs_transaction_id: data.hcsTransactionId ?? null,
        hfs_file_id: data.hfsFileId ?? null,
        submitted_at: data.submittedAt ?? null
      }
    })
    return batch.id
  }

  async attachBatchLedgerReferences(batchId: number, info: { hfsFileId?: string | null; hcsTransactionId?: string | null }): Promise<void> {
    await this.prisma.batches.update({
      where: { id: batchId },
      data: {
        hfs_file_id: info.hfsFileId ?? undefined,
        hcs_transaction_id: info.hcsTransactionId ?? undefined
      }
    })
  }

  async getBatch(batchId: number): Promise<batches | null> {
    return this.prisma.batches.findUnique({ where: { id: batchId } })
  }

  async getBatchByAuditHash(auditHash: string): Promise<batches | null> {
    return this.prisma.batches.findUnique({ where: { audit_hash: auditHash } })
  }

  async getBatchesByAgreement(agreementId: number, limit = 50): Promise<batches[]> {
    return this.prisma.batches.findMany({
      where: { agreement_id: agreementId },
      orderBy: { created_at: 'desc' },
      take: limit
    })
  }

  async updateBatchStatus(batchId: number, status: string, submittedAt?: Date): Promise<void> {
    await this.prisma.batches.update({
      where: { id: batchId },
      data: {
        validation_status: status,
        submitted_at: submittedAt ?? undefined
      }
    })
  }

  async getPendingBatches(): Promise<batches[]> {
    return this.prisma.batches.findMany({
      where: { validation_status: 'pending' },
      orderBy: { created_at: 'asc' }
    })
  }

  async createOracleLog(data: OracleLogData): Promise<number> {
    const log = await this.prisma.oracle_logs.create({
      data: {
        batch_id: data.batchId,
        action: data.action,
        details: data.details ?? null,
        oracle_address: data.oracleAddress ?? null,
        transaction_hash: data.transactionHash ?? null
      }
    })
    return log.id
  }

  async getOracleLogsByBatch(batchId: number): Promise<oracle_logs[]> {
    return this.prisma.oracle_logs.findMany({
      where: { batch_id: batchId },
      orderBy: { timestamp: 'desc' }
    })
  }

  async getRecentOracleLogs(limit = 100): Promise<oracle_logs[]> {
    return this.prisma.oracle_logs.findMany({
      orderBy: { timestamp: 'desc' },
      take: limit
    })
  }

  async getOracleLogForBatchAction(batchId: number, action: string): Promise<oracle_logs | null> {
    return this.prisma.oracle_logs.findFirst({
      where: { batch_id: batchId, action },
      orderBy: { timestamp: 'desc' }
    })
  }

  async getWeeklyReadings(agreementId: number, weekStart: Date, weekEnd: Date): Promise<readings[]> {
    return this.prisma.readings.findMany({
      where: {
        agreement_id: agreementId,
        timestamp: {
          gte: weekStart,
          lte: weekEnd
        }
      },
      orderBy: { timestamp: 'asc' }
    })
  }

  async getAgreementsWithRecentActivity(days = 7): Promise<agreements[]> {
    const cutoff = new Date()
    cutoff.setDate(cutoff.getDate() - days)

    return this.prisma.agreements.findMany({
      where: {
        is_active: true,
        readings: {
          some: {
            timestamp: {
              gte: cutoff
            }
          }
        }
      },
      orderBy: { created_at: 'desc' }
    })
  }

  async createInvestment(data: { agreementId: number; investorAddress: string; amount: number; transactionHash?: string | null }): Promise<number> {
    const investment = await this.prisma.investments.create({
      data: {
        agreement_id: data.agreementId,
        investor_address: data.investorAddress,
        amount: data.amount,
        transaction_hash: data.transactionHash ?? null
      }
    })
    return investment.id
  }

  async getInvestmentsByAgreement(agreementId: number): Promise<investments[]> {
    return this.prisma.investments.findMany({
      where: { agreement_id: agreementId },
      orderBy: { created_at: 'desc' }
    })
  }

  async getInvestmentsByUser(userAddress: string): Promise<(investments & { agreement: agreements })[]> {
    return this.prisma.investments.findMany({
      where: { investor_address: userAddress },
      include: { agreement: true },
      orderBy: { created_at: 'desc' }
    })
  }

  async updateInvestmentTransactionHash(investmentId: number, transactionHash: string): Promise<void> {
    await this.prisma.investments.update({
      where: { id: investmentId },
      data: { transaction_hash: transactionHash }
    })
  }

  async deleteInvestment(investmentId: number): Promise<void> {
    await this.prisma.investments.delete({ where: { id: investmentId } })
  }

  async getInvestment(investmentId: number): Promise<investments | null> {
    return this.prisma.investments.findUnique({ where: { id: investmentId } })
  }

  async createAuditRecord(data: {
    agreementId: number
    batchId?: number | null
    auditHash: string
    score?: number | null
    transactionHash?: string | null
    producerAddress?: string | null
    investorAddress?: string | null
    hcsTransactionId?: string | null
    hfsFileId?: string | null
  }): Promise<number> {
    const record = await this.prisma.audit_records.create({
      data: {
        agreement_id: data.agreementId,
        batch_id: data.batchId ?? null,
        audit_hash: data.auditHash,
        score: data.score ?? null,
        transaction_hash: data.transactionHash ?? null,
        producer_address: data.producerAddress ?? null,
        investor_address: data.investorAddress ?? null,
        hcs_transaction_id: data.hcsTransactionId ?? null,
        hfs_file_id: data.hfsFileId ?? null
      }
    })
    return record.id
  }

  async getAuditRecordsByAgreement(agreementId: number): Promise<audit_records[]> {
    return this.prisma.audit_records.findMany({
      where: { agreement_id: agreementId },
      orderBy: { timestamp: 'desc' }
    })
  }

  async getAuditRecord(auditId: number): Promise<audit_records | null> {
    return this.prisma.audit_records.findUnique({ where: { id: auditId } })
  }

  async createUser(data: UserData): Promise<number> {
    const user = await this.prisma.users.create({
      data: {
        email: data.email,
        name: data.name,
        password: data.password,
        role: data.role,
        address: data.address ?? null,
        is_active: data.isActive,
        last_login: data.lastLogin ?? null
      }
    })
    return user.id
  }

  async getUserByEmail(email: string): Promise<users | null> {
    return this.prisma.users.findFirst({ where: { email, is_active: true } })
  }

  async getUserById(id: number): Promise<users | null> {
    return this.prisma.users.findFirst({ where: { id, is_active: true } })
  }

  async updateUserLastLogin(id: number): Promise<void> {
    await this.prisma.users.update({
      where: { id },
      data: { last_login: new Date() }
    })
  }

  async updateUserPassword(id: number, hashedPassword: string): Promise<void> {
    await this.prisma.users.update({
      where: { id },
      data: {
        password: hashedPassword,
        updated_at: new Date()
      }
    })
  }

  async updateUserAddress(id: number, address: string): Promise<void> {
    await this.prisma.users.update({
      where: { id },
      data: {
        address,
        updated_at: new Date()
      }
    })
  }

  async deactivateUser(id: number): Promise<void> {
    await this.prisma.users.update({
      where: { id },
      data: {
        is_active: false,
        updated_at: new Date()
      }
    })
  }

  async getAllUsers(): Promise<UserSummary[]> {
    return this.prisma.users.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        address: true,
        is_active: true,
        last_login: true,
        created_at: true
      },
      orderBy: { created_at: 'desc' }
    }) as Promise<UserSummary[]>
  }

  async updateUser(id: number, updateData: { name?: string; address?: string }): Promise<void> {
    const data: Prisma.usersUpdateInput = {}
    if (updateData.name) {
      data.name = updateData.name
    }
    if (updateData.address) {
      data.address = updateData.address
    }
    if (Object.keys(data).length === 0) {
      throw new Error('No fields to update')
    }

    data.updated_at = new Date()

    await this.prisma.users.update({
      where: { id },
      data
    })
  }

  async close(): Promise<void> {
    await this.prisma.$disconnect()
  }
}

export { getPrismaClient }
