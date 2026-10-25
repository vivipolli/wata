/**
 * Imports INEA measurements into the measurements table, from the canonical CSV produced by the dMRV
 * data engine. Only the given stations are imported; every record is validated, and re-running the
 * same file stores nothing twice (the source ref is the spreadsheet hash, sheet and row).
 *
 * Usage (from backend/, with DATABASE_URL set):
 *   npx tsx src/scripts/importIneaMeasurements.ts <canonical.csv> <spreadsheet-sha256> <STATION,STATION,...>
 */
import fs from 'fs'
import { PrismaDatabase } from '../services/orm/prismaDatabase'
import { parseCsv } from '../score/csv'
import { ineaRowsToMeasurementInputs, type IneaRow } from '../score/inea'
import { validateMeasurementInput, STATION_CODE } from '../score/measurements'

const SHA256 = /^[0-9a-f]{64}$/
const CHUNK = 500

async function main(): Promise<void> {
  const [csvPath, sha, stationList] = process.argv.slice(2)
  const stations = (stationList ?? '').split(',').filter(Boolean)
  if (!csvPath || !SHA256.test(sha ?? '') || stations.length === 0 || !stations.every(s => STATION_CODE.test(s))) {
    throw new Error('usage: importIneaMeasurements.ts <canonical.csv> <spreadsheet-sha256> <STATION,STATION,...>')
  }

  const rows = parseCsv(fs.readFileSync(csvPath, 'utf8')) as unknown as IneaRow[]
  const wanted = new Set(stations)
  const inputs = ineaRowsToMeasurementInputs(rows.filter(r => wanted.has(r.estacao)), sha)
  const valid = inputs.filter(m => validateMeasurementInput(m).length === 0)

  const database = new PrismaDatabase()
  await database.initialize()
  let inserted = 0
  let duplicates = 0
  for (let i = 0; i < valid.length; i += CHUNK) {
    const result = await database.insertMeasurements(valid.slice(i, i + CHUNK))
    inserted += result.inserted
    duplicates += result.duplicates
  }
  await database.close()
  console.log(JSON.stringify({ rowsRead: rows.length, mapped: inputs.length, invalid: inputs.length - valid.length, inserted, duplicates }))
}

main().catch(error => {
  console.error('Import failed:', error instanceof Error ? error.message : error)
  process.exit(1)
})
