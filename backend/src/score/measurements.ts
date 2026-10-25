import { CONAMA_357 } from './conama357'
import { isAcceptedUnit } from './units'

/** A measurement as received for storage, before it is scored. */
export interface MeasurementInput {
  stationCode: string
  // ISO date (YYYY-MM-DD) or date-time of the sampling
  sampledAt: string
  parameter: string
  value: number
  unit: string
  qualifier: '<' | '>' | '?' | null
  // Official source (e.g. INEA) and the locator of the record in it
  source: string
  sourceRef: string
}

export const STATION_CODE = /^[0-9A-Z]{6,20}$/
const ISO_DATE = /^\d{4}-\d{2}-\d{2}(T\d{2}:\d{2}(:\d{2}(\.\d+)?)?(Z|[+-]\d{2}:\d{2})?)?$/
const QUALIFIERS = new Set(['<', '>', '?'])

export function validateMeasurementInput(m: MeasurementInput): string[] {
  const errors: string[] = []
  if (typeof m.stationCode !== 'string' || !STATION_CODE.test(m.stationCode)) errors.push('stationCode must be 6-20 upper-case letters or digits')
  if (typeof m.sampledAt !== 'string' || !ISO_DATE.test(m.sampledAt) || Number.isNaN(Date.parse(m.sampledAt))) errors.push('sampledAt must be an ISO date')
  const spec = CONAMA_357[m.parameter]
  if (!spec) errors.push(`unknown parameter: ${m.parameter}`)
  else if (typeof m.unit !== 'string' || !isAcceptedUnit(m.parameter, m.unit, spec.unit)) errors.push(`unit ${m.unit} is not accepted for ${m.parameter}`)
  if (typeof m.value !== 'number' || !Number.isFinite(m.value)) errors.push('value must be a finite number')
  if (m.qualifier !== null && !QUALIFIERS.has(m.qualifier as string)) errors.push('qualifier must be <, >, ? or null')
  if (typeof m.source !== 'string' || m.source.length === 0 || m.source.length > 40) errors.push('source is required')
  if (typeof m.sourceRef !== 'string' || m.sourceRef.length === 0 || m.sourceRef.length > 200) errors.push('sourceRef is required')
  return errors
}
