import { CONAMA_357, type ConamaClass, type PhosphorusEnvironment } from './conama357'

/**
 * Score rule: the environmental choices behind a score. Every value comes from a reviewed rule file;
 * nothing here has a default except the class, which Art. 42 of CONAMA 357 sets to 2 while a water
 * body has no approved classification. The version is recorded on-chain as scoreVersion.
 */
export interface ScoreRule {
  version: number
  conamaClass: ConamaClass
  parameters: Array<{ id: string; weight: number }>
  // Decided samples a parameter needs to count (censored or excluded samples do not count)
  minSamplesPerParameter: number
  // Share of the total weight that must be evaluated for a score to exist (0 < x <= 1)
  minCoverage: number
  // Required when total phosphorus is a parameter: its limit depends on the environment
  phosphorusEnvironment?: PhosphorusEnvironment
}

const ENVIRONMENTS: PhosphorusEnvironment[] = ['lentico', 'intermediario', 'lotico']

export function validateScoreRule(raw: unknown): { ok: true; rule: ScoreRule } | { ok: false; errors: string[] } {
  const errors: string[] = []
  const r = (raw ?? {}) as Record<string, any>

  if (!Number.isInteger(r.version) || r.version < 0 || r.version > 0xffff) errors.push('version must be an integer between 0 and 65535')
  const conamaClass = r.conamaClass ?? 2
  if (![1, 2, 3].includes(conamaClass)) errors.push('conamaClass must be 1, 2 or 3')

  const parameters = Array.isArray(r.parameters) ? r.parameters : []
  if (parameters.length === 0) errors.push('parameters must list at least one parameter')
  const seen = new Set<string>()
  for (const p of parameters) {
    if (!p || typeof p.id !== 'string' || !(p.id in CONAMA_357)) errors.push(`unknown parameter: ${p?.id}`)
    else if (seen.has(p.id)) errors.push(`repeated parameter: ${p.id}`)
    else seen.add(p.id)
    if (typeof p?.weight !== 'number' || !Number.isFinite(p.weight) || p.weight <= 0) errors.push(`weight of ${p?.id} must be a positive number`)
  }

  if (!Number.isInteger(r.minSamplesPerParameter) || r.minSamplesPerParameter < 1) errors.push('minSamplesPerParameter must be an integer >= 1')
  if (typeof r.minCoverage !== 'number' || !(r.minCoverage > 0 && r.minCoverage <= 1)) errors.push('minCoverage must be a number in (0, 1]')

  if (seen.has('fosforo_total_mg_L_P') && !ENVIRONMENTS.includes(r.phosphorusEnvironment)) {
    errors.push('phosphorusEnvironment (lentico, intermediario or lotico) is required when total phosphorus is a parameter')
  } else if (r.phosphorusEnvironment !== undefined && !ENVIRONMENTS.includes(r.phosphorusEnvironment)) {
    errors.push('phosphorusEnvironment must be lentico, intermediario or lotico')
  }

  if (errors.length > 0) return { ok: false, errors }
  const rule: ScoreRule = {
    version: r.version,
    conamaClass,
    parameters: parameters.map((p: any) => ({ id: p.id, weight: p.weight })),
    minSamplesPerParameter: r.minSamplesPerParameter,
    minCoverage: r.minCoverage
  }
  if (r.phosphorusEnvironment !== undefined) rule.phosphorusEnvironment = r.phosphorusEnvironment
  return { ok: true, rule }
}
