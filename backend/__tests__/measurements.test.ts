import { describe, it, expect, beforeEach, afterEach } from '@jest/globals'
import { PrismaDatabase, getPrismaClient } from '../src/services/orm/prismaDatabase'

// Imports are idempotent: the same source record and parameter is stored once.
describe('Measurement records', () => {
  let database: PrismaDatabase

  beforeEach(async () => {
    process.env.DATABASE_URL = 'file:./data/test-db.sqlite'
    database = new PrismaDatabase()
    await database.initialize()
    await getPrismaClient().measurements.deleteMany()
  })

  afterEach(async () => {
    await database.close()
  })

  const record = (overrides: object = {}) => ({
    stationCode: '00RJ24MC0010', sampledAt: '2025-01-21', parameter: 'turbidez_UNT', value: 12.5, unit: 'NTU',
    qualifier: null, source: 'INEA', sourceRef: 'xlsx:b930b9e0:2025:120', ...overrides
  })

  it('stores each source record once and counts duplicates', async () => {
    await expect(database.insertMeasurements([record(), record({ parameter: 'pH', unit: 'pH', value: 7.1 })])).resolves.toEqual({ inserted: 2, duplicates: 0 })
    await expect(database.insertMeasurements([record(), record({ sourceRef: 'xlsx:b930b9e0:2025:121' })])).resolves.toEqual({ inserted: 1, duplicates: 1 })
  })

  it('returns a station period in sampling order, with qualifiers', async () => {
    await database.insertMeasurements([
      record({ sampledAt: '2025-03-10', sourceRef: 'r2', qualifier: '<', value: 2, parameter: 'DBO_5d_20C_mg_L_O2', unit: 'mg/L O2' }),
      record({ sampledAt: '2025-01-21', sourceRef: 'r1' }),
      record({ sampledAt: '2024-12-01', sourceRef: 'r0' }),
      record({ sampledAt: '2026-02-01', sourceRef: 'r4' }),
      record({ stationCode: '00RJ04MC0002', sourceRef: 'r3' })
    ])
    const rows = await database.getMeasurements('00RJ24MC0010', new Date('2025-01-01'), new Date('2025-12-31'))
    expect(rows.map(r => [r.source_ref, r.qualifier])).toEqual([['r1', null], ['r2', '<']])
  })
})
