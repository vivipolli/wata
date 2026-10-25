import { CONAMA_357, type ConamaParameter, type PhBand, type PhosphorusEnvironment } from './conama357'
import type { ScoreRule } from './rule'
import { UNIT_ALIASES, AMBIGUOUS_BASE } from './units'

export interface Measurement {
  parameter: string
  // Measured value, or the detection limit when qualifier is set; null when not reported
  value: number | null
  unit: string
  // '<' or '>': the true value is below or above `value` (censored); '?': censored, direction unknown;
  // null: measured
  qualifier: '<' | '>' | '?' | null
  station: string
  sampledAt: string
}

type Outcome = 'compliant' | 'non_compliant' | 'censored_indeterminate' | 'unit_mismatch' | 'unknown_base' | 'invalid_value' | 'no_paired_ph' | 'ambiguous_ph'

export interface ParameterResult {
  id: string
  weight: number
  status: 'evaluated' | 'insufficient' | 'not_evaluable'
  reason?: string
  compliance: number | null
  compliant: number
  nonCompliant: number
  // Samples left out, by reason (only reasons that occurred)
  excluded: Record<string, number>
  limitApplied?: number | { min: number; max: number }
  // Thermotolerant coliforms: whether >= 80% of the samples met the limit (CONAMA statistical rule)
  conamaRuleMet?: boolean
  articles: string
}

export interface ScoreResult {
  status: 'scored' | 'insufficient_coverage'
  // 0-1, null when coverage is insufficient
  score: number | null
  // Integer 0-100 sent to the escrow, null when there is no score
  onchainScore: number | null
  coverage: number
  ruleVersion: number
  conamaClass: number
  parameters: ParameterResult[]
  ignoredMeasurements: number
}

const COLIFORM_MIN_SAMPLES = 6
const COLIFORM_SHARE = 0.8

// Compliance against an upper limit, deciding censored values only when the answer is certain.
// With an unknown base (factor), the true value is v or v / factor: decided only when both agree.
function againstMax(m: Measurement, limit: number, factor?: number): Outcome {
  const v = m.value as number
  if (m.qualifier === '?') return 'censored_indeterminate'
  if (factor !== undefined) {
    if (m.qualifier === '<') return v <= limit ? 'compliant' : 'censored_indeterminate'
    if (m.qualifier === '>') return v / factor >= limit ? 'non_compliant' : 'censored_indeterminate'
    if (v <= limit) return 'compliant'
    return v / factor > limit ? 'non_compliant' : 'unknown_base'
  }
  if (m.qualifier === '<') return v <= limit ? 'compliant' : 'censored_indeterminate'
  if (m.qualifier === '>') return v >= limit ? 'non_compliant' : 'censored_indeterminate'
  return v <= limit ? 'compliant' : 'non_compliant'
}

function againstMin(m: Measurement, limit: number): Outcome {
  const v = m.value as number
  if (m.qualifier === '?') return 'censored_indeterminate'
  if (m.qualifier === '>') return v >= limit ? 'compliant' : 'censored_indeterminate'
  if (m.qualifier === '<') return v <= limit ? 'non_compliant' : 'censored_indeterminate'
  return v >= limit ? 'compliant' : 'non_compliant'
}

function phBandLimit(bands: PhBand[], ph: number): number {
  const band = bands.find(b => (b.phAbove === null || ph > b.phAbove) && (b.phUpTo === null || ph <= b.phUpTo))
  return band!.max
}

const sampleKey = (m: Measurement) => `${m.station}|${m.sampledAt}`

export function computeScore(measurements: Measurement[], rule: ScoreRule): ScoreResult {
  const inRule = new Set(rule.parameters.map(p => p.id))

  // Measured pH per sample, for the pH-dependent ammonia limit; a sample with two pH values is ambiguous
  const phBySample = new Map<string, number | 'ambiguous'>()
  for (const m of measurements) {
    if (m.parameter !== 'pH' || m.qualifier !== null || m.unit !== CONAMA_357.pH.unit || typeof m.value !== 'number' || !Number.isFinite(m.value)) continue
    const key = sampleKey(m)
    const previous = phBySample.get(key)
    phBySample.set(key, previous === undefined || previous === m.value ? m.value : 'ambiguous')
  }

  const parameters = rule.parameters.map(({ id, weight }) => {
    const spec: ConamaParameter = CONAMA_357[id]
    const limit = spec.limits[rule.conamaClass]
    const base = { id, weight, articles: spec.articles, compliant: 0, nonCompliant: 0, excluded: {} as Record<string, number> }

    if (limit === null || limit === undefined) {
      return { ...base, status: 'not_evaluable' as const, reason: 'no_numeric_limit_for_class', compliance: null }
    }

    let limitApplied: ParameterResult['limitApplied']
    const ambiguous = AMBIGUOUS_BASE[id]
    const evaluate = (m: Measurement): Outcome => {
      const sameUnit = m.unit === spec.unit || (UNIT_ALIASES[id] ?? []).includes(m.unit)
      const factor = !sameUnit && ambiguous && m.unit === ambiguous.unit ? ambiguous.factor : undefined
      if (!sameUnit && factor === undefined) return 'unit_mismatch'
      if (typeof m.value !== 'number' || !Number.isFinite(m.value)) return 'invalid_value'
      switch (spec.kind) {
        case 'max':
        case 'max_statistical':
          limitApplied = limit as number
          return againstMax(m, limit as number, factor)
        case 'min':
          limitApplied = limit as number
          return againstMin(m, limit as number)
        case 'range': {
          const range = limit as { min: number; max: number }
          limitApplied = range
          if (m.qualifier !== null) return 'censored_indeterminate'
          return m.value >= range.min && m.value <= range.max ? 'compliant' : 'non_compliant'
        }
        case 'max_by_environment': {
          const value = (limit as Record<PhosphorusEnvironment, number>)[rule.phosphorusEnvironment as PhosphorusEnvironment]
          limitApplied = value
          return againstMax(m, value, factor)
        }
        case 'max_by_ph': {
          const ph = phBySample.get(sampleKey(m))
          if (ph === undefined) return 'no_paired_ph'
          if (ph === 'ambiguous') return 'ambiguous_ph'
          return againstMax(m, phBandLimit(limit as PhBand[], ph), factor)
        }
      }
    }

    for (const m of measurements) {
      if (m.parameter !== id) continue
      const outcome = evaluate(m)
      if (outcome === 'compliant') base.compliant++
      else if (outcome === 'non_compliant') base.nonCompliant++
      else base.excluded[outcome] = (base.excluded[outcome] ?? 0) + 1
    }

    const decided = base.compliant + base.nonCompliant
    const withLimit = limitApplied !== undefined ? { limitApplied } : {}
    if (spec.kind === 'max_statistical' && decided < COLIFORM_MIN_SAMPLES) {
      return { ...base, ...withLimit, status: 'not_evaluable' as const, reason: 'statistical_limit_needs_6_samples', compliance: null }
    }
    if (decided < rule.minSamplesPerParameter) {
      return { ...base, ...withLimit, status: 'insufficient' as const, reason: 'below_min_samples', compliance: null }
    }
    const compliance = base.compliant / decided
    return {
      ...base,
      ...withLimit,
      status: 'evaluated' as const,
      compliance,
      ...(spec.kind === 'max_statistical' ? { conamaRuleMet: compliance >= COLIFORM_SHARE } : {})
    }
  })

  const totalWeight = rule.parameters.reduce((sum, p) => sum + p.weight, 0)
  const evaluated = parameters.filter(p => p.status === 'evaluated')
  const evaluatedWeight = evaluated.reduce((sum, p) => sum + p.weight, 0)
  const coverage = evaluatedWeight / totalWeight
  const scored = evaluatedWeight > 0 && coverage >= rule.minCoverage
  const score = scored ? evaluated.reduce((sum, p) => sum + p.weight * (p.compliance as number), 0) / evaluatedWeight : null

  return {
    status: scored ? 'scored' : 'insufficient_coverage',
    score,
    onchainScore: score === null ? null : Math.round(score * 100),
    coverage,
    ruleVersion: rule.version,
    conamaClass: rule.conamaClass,
    parameters,
    ignoredMeasurements: measurements.filter(m => !inRule.has(m.parameter)).length
  }
}
