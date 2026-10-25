/**
 * Multiparameter score (F3a). Limits come from CONAMA 357/2005; every environmental choice (parameters,
 * weights, minimum samples and coverage, phosphorus environment) comes from a validated rule file and
 * is never defaulted in code, except the class: Art. 42 sets class 2 until a water body is classified.
 * Censored values (< or > detection limits) never become numbers: they decide compliance only when
 * the answer is certain. The rule values below are test values, not the pilot's.
 */
import { validateScoreRule, type ScoreRule } from '../../src/score/rule'
import { computeScore, type Measurement } from '../../src/score/engine'

const RULE: ScoreRule = {
  version: 1,
  conamaClass: 2,
  parameters: [{ id: 'turbidez_UNT', weight: 1 }],
  minSamplesPerParameter: 1,
  minCoverage: 1
}

let seq = 0
function m(parameter: string, value: number | null, overrides: Partial<Measurement> = {}): Measurement {
  seq++
  const units: Record<string, string> = {
    turbidez_UNT: 'UNT', OD_mg_L_O2: 'mg/L O2', pH: 'pH', nitrogenio_amoniacal_total_mg_L_N: 'mg/L N',
    fosforo_total_mg_L_P: 'mg/L P', nitrato_mg_L_N: 'mg/L N', coliformes_termotolerantes_NMP_100mL: 'NMP/100mL', cor_verdadeira_mgPt_L: 'mg Pt/L', DBO_5d_20C_mg_L_O2: 'mg/L O2'
  }
  return { parameter, value, unit: units[parameter], qualifier: null, station: 'MC0010', sampledAt: `2024-0${(seq % 9) + 1}-10T10:00:00Z`, ...overrides }
}

function detail(result: ReturnType<typeof computeScore>, id: string) {
  return result.parameters.find(p => p.id === id)!
}

describe('validateScoreRule', () => {
  const raw = { version: 1, parameters: [{ id: 'turbidez_UNT', weight: 1 }], minSamplesPerParameter: 1, minCoverage: 0.5 }

  it('accepts a complete rule and applies class 2 only when the class is omitted (Art. 42)', () => {
    expect(validateScoreRule(raw)).toEqual({ ok: true, rule: { ...raw, conamaClass: 2 } })
    expect(validateScoreRule({ ...raw, conamaClass: 1 })).toMatchObject({ ok: true, rule: { conamaClass: 1 } })
  })

  it.each([
    ['missing version', { ...raw, version: undefined }],
    ['version above uint16', { ...raw, version: 70000 }],
    ['unknown class', { ...raw, conamaClass: 4 }],
    ['no parameters', { ...raw, parameters: [] }],
    ['unknown parameter', { ...raw, parameters: [{ id: 'turbidity', weight: 1 }] }],
    ['repeated parameter', { ...raw, parameters: [{ id: 'turbidez_UNT', weight: 1 }, { id: 'turbidez_UNT', weight: 2 }] }],
    ['zero weight', { ...raw, parameters: [{ id: 'turbidez_UNT', weight: 0 }] }],
    ['missing minimum samples', { ...raw, minSamplesPerParameter: undefined }],
    ['fractional minimum samples', { ...raw, minSamplesPerParameter: 1.5 }],
    ['coverage above 1', { ...raw, minCoverage: 1.2 }],
    ['zero coverage', { ...raw, minCoverage: 0 }],
    ['phosphorus without environment', { ...raw, parameters: [{ id: 'fosforo_total_mg_L_P', weight: 1 }] }],
    ['unknown phosphorus environment', { ...raw, parameters: [{ id: 'fosforo_total_mg_L_P', weight: 1 }], phosphorusEnvironment: 'rio' }]
  ])('rejects %s', (_label, candidate) => {
    const result = validateScoreRule(candidate)
    expect(result.ok).toBe(false)
  })
})

describe('computeScore: limits by kind and class', () => {
  it('compares a maximum limit of the chosen class', () => {
    const samples = [m('turbidez_UNT', 50)]
    expect(detail(computeScore(samples, RULE), 'turbidez_UNT')).toMatchObject({ status: 'evaluated', compliance: 1, limitApplied: 100 })
    expect(detail(computeScore(samples, { ...RULE, conamaClass: 1 }), 'turbidez_UNT')).toMatchObject({ compliance: 0, limitApplied: 40 })
  })

  it('compares a minimum limit (dissolved oxygen)', () => {
    const rule = { ...RULE, parameters: [{ id: 'OD_mg_L_O2', weight: 1 }] }
    const result = computeScore([m('OD_mg_L_O2', 5.2), m('OD_mg_L_O2', 4.8)], rule)
    expect(detail(result, 'OD_mg_L_O2')).toMatchObject({ compliance: 0.5, compliant: 1, nonCompliant: 1 })
  })

  it('checks a range (pH 6 to 9, inclusive)', () => {
    const rule = { ...RULE, parameters: [{ id: 'pH', weight: 1 }] }
    const result = computeScore([m('pH', 6.0), m('pH', 9.0), m('pH', 9.1), m('pH', 5.9)], rule)
    expect(detail(result, 'pH')).toMatchObject({ compliant: 2, nonCompliant: 2 })
  })

  it('uses the pH of the same sample for total ammonia nitrogen', () => {
    const rule = { ...RULE, parameters: [{ id: 'nitrogenio_amoniacal_total_mg_L_N', weight: 1 }] }
    const at = (d: string) => ({ sampledAt: d })
    const result = computeScore([
      m('pH', 7.0, at('2024-01-10T10:00:00Z')), m('nitrogenio_amoniacal_total_mg_L_N', 3.0, at('2024-01-10T10:00:00Z')), // limit 3.7
      m('pH', 8.2, at('2024-03-10T10:00:00Z')), m('nitrogenio_amoniacal_total_mg_L_N', 3.0, at('2024-03-10T10:00:00Z')), // limit 1.0
      m('nitrogenio_amoniacal_total_mg_L_N', 0.1, at('2024-05-10T10:00:00Z')) // no pH in that sample
    ], rule)
    expect(detail(result, 'nitrogenio_amoniacal_total_mg_L_N')).toMatchObject({ compliant: 1, nonCompliant: 1 })
    expect(detail(result, 'nitrogenio_amoniacal_total_mg_L_N').excluded).toEqual({ no_paired_ph: 1 })
  })

  it('uses the configured environment for total phosphorus', () => {
    const base = { ...RULE, parameters: [{ id: 'fosforo_total_mg_L_P', weight: 1 }] }
    const samples = [m('fosforo_total_mg_L_P', 0.04)]
    expect(detail(computeScore(samples, { ...base, phosphorusEnvironment: 'lentico' }), 'fosforo_total_mg_L_P')).toMatchObject({ compliance: 0, limitApplied: 0.03 })
    expect(detail(computeScore(samples, { ...base, phosphorusEnvironment: 'lotico' }), 'fosforo_total_mg_L_P')).toMatchObject({ compliance: 1, limitApplied: 0.1 })
  })

  it('marks a parameter without a numeric limit in the class as not evaluable', () => {
    const rule = { ...RULE, conamaClass: 1 as const, parameters: [{ id: 'turbidez_UNT', weight: 1 }, { id: 'cor_verdadeira_mgPt_L', weight: 1 }], minCoverage: 0.5 }
    const result = computeScore([m('turbidez_UNT', 10), m('cor_verdadeira_mgPt_L', 20)], rule)
    expect(detail(result, 'cor_verdadeira_mgPt_L')).toMatchObject({ status: 'not_evaluable', reason: 'no_numeric_limit_for_class' })
  })

  it('evaluates thermotolerant coliforms only with at least 6 samples, and reports the 80% rule', () => {
    const rule = { ...RULE, parameters: [{ id: 'coliformes_termotolerantes_NMP_100mL', weight: 1 }] }
    const four = [500, 500, 500, 2000].map(v => m('coliformes_termotolerantes_NMP_100mL', v))
    expect(detail(computeScore(four, rule), 'coliformes_termotolerantes_NMP_100mL')).toMatchObject({ status: 'not_evaluable', reason: 'statistical_limit_needs_6_samples' })

    const six = [500, 500, 500, 500, 500, 2000].map(v => m('coliformes_termotolerantes_NMP_100mL', v))
    expect(detail(computeScore(six, rule), 'coliformes_termotolerantes_NMP_100mL')).toMatchObject({ status: 'evaluated', compliance: 5 / 6, conamaRuleMet: true })
  })
})

describe('computeScore: censored values never become numbers', () => {
  const max = (value: number, qualifier: '<' | '>') => m('turbidez_UNT', value, { qualifier })

  it('counts "<X" as compliant only when X is within a maximum limit', () => {
    const result = computeScore([max(100, '<'), max(150, '<')], RULE)
    expect(detail(result, 'turbidez_UNT')).toMatchObject({ compliant: 1, nonCompliant: 0, excluded: { censored_indeterminate: 1 } })
  })

  it('counts ">X" as non-compliant only when X is at or above a maximum limit', () => {
    const result = computeScore([max(100, '>'), max(50, '>')], RULE)
    expect(detail(result, 'turbidez_UNT')).toMatchObject({ compliant: 0, nonCompliant: 1, excluded: { censored_indeterminate: 1 } })
  })

  it('mirrors the rule for a minimum limit', () => {
    const rule = { ...RULE, parameters: [{ id: 'OD_mg_L_O2', weight: 1 }] }
    const od = (value: number, qualifier: '<' | '>') => m('OD_mg_L_O2', value, { qualifier })
    const result = computeScore([od(5, '>'), od(5, '<'), od(4, '>'), od(6, '<')], rule)
    expect(detail(result, 'OD_mg_L_O2')).toMatchObject({ compliant: 1, nonCompliant: 1, excluded: { censored_indeterminate: 2 } })
  })

  it('never decides a censored value against a range', () => {
    const rule = { ...RULE, parameters: [{ id: 'pH', weight: 1 }, { id: 'turbidez_UNT', weight: 1 }], minCoverage: 0.5 }
    const result = computeScore([m('pH', 7, { qualifier: '<' }), m('turbidez_UNT', 10)], rule)
    expect(detail(result, 'pH')).toMatchObject({ status: 'insufficient', excluded: { censored_indeterminate: 1 } })
  })
})

describe('computeScore: sample hygiene', () => {
  it('excludes a unit other than the catalog unit (no silent equivalence)', () => {
    // Jackson turbidity units are not nephelometric: no source makes them equal to UNT
    const result = computeScore([m('turbidez_UNT', 10, { unit: 'JTU' }), m('turbidez_UNT', 10)], RULE)
    expect(detail(result, 'turbidez_UNT')).toMatchObject({ compliant: 1, excluded: { unit_mismatch: 1 } })
  })

  it('excludes missing or non-finite values', () => {
    const result = computeScore([m('turbidez_UNT', null), m('turbidez_UNT', Number.NaN), m('turbidez_UNT', 10)], RULE)
    expect(detail(result, 'turbidez_UNT')).toMatchObject({ compliant: 1, excluded: { invalid_value: 2 } })
  })

  it('ignores parameters that are not in the rule', () => {
    const result = computeScore([m('turbidez_UNT', 10), m('DBO_5d_20C_mg_L_O2', 99)], RULE)
    expect(result.parameters.map(p => p.id)).toEqual(['turbidez_UNT'])
    expect(result.ignoredMeasurements).toBe(1)
  })
})

describe('computeScore: units with an official source', () => {
  it('treats NTU and uT as the CONAMA turbidity unit UNT (INEA IQA-NSF methodology: "100 uT (ou NTU)")', () => {
    const result = computeScore([m('turbidez_UNT', 10, { unit: 'NTU' }), m('turbidez_UNT', 10, { unit: 'uT' }), m('turbidez_UNT', 10, { unit: 'FTU' })], RULE)
    expect(detail(result, 'turbidez_UNT')).toMatchObject({ compliant: 2, excluded: { unit_mismatch: 1 } })
  })
})

describe('computeScore: nutrients reported in mg/L without the N or P base (gap G-20)', () => {
  const nitrate: ScoreRule = { ...RULE, parameters: [{ id: 'nitrato_mg_L_N', weight: 1 }] }
  const n = (value: number, qualifier: '<' | '>' | null = null) => m('nitrato_mg_L_N', value, { unit: 'mg/L', qualifier })

  it('decides only when both readings (as N, or as NO3 converted to N) agree', () => {
    // limit 10 mg/L N; NO3 -> N divides by 62.0049/14.0067 = 4.4268
    // 42 / 4.4268 = 9.49 <= 10 (could still be compliant); 44.4 / 4.4268 = 10.03 > 10 (non-compliant in both bases)
    const result = computeScore([n(9.9), n(44.4), n(20), n(42)], nitrate)
    expect(detail(result, 'nitrato_mg_L_N')).toMatchObject({ compliant: 1, nonCompliant: 1, excluded: { unknown_base: 2 } })
  })

  it('combines with censored values: "<X" within the limit is compliant, ">X" above the limit in both bases is not', () => {
    const result = computeScore([n(5, '<'), n(50, '>'), n(20, '>'), n(15, '<')], nitrate)
    expect(detail(result, 'nitrato_mg_L_N')).toMatchObject({ compliant: 1, nonCompliant: 1, excluded: { censored_indeterminate: 2 } })
  })

  it('applies the PO4 to P factor to total phosphorus', () => {
    const rule: ScoreRule = { ...RULE, parameters: [{ id: 'fosforo_total_mg_L_P', weight: 1 }], phosphorusEnvironment: 'lotico' }
    const p = (value: number) => m('fosforo_total_mg_L_P', value, { unit: 'mg/L' })
    // lotic class 2 limit 0.1 mg/L P; PO4 -> P divides by 94.9714/30.9738 = 3.0662
    // 0.305 / 3.0662 = 0.0995 <= 0.1 (undecided); 0.31 / 3.0662 = 0.1011 > 0.1 (non-compliant in both bases)
    const result = computeScore([p(0.1), p(0.31), p(0.2), p(0.305)], rule)
    expect(detail(result, 'fosforo_total_mg_L_P')).toMatchObject({ compliant: 1, nonCompliant: 1, excluded: { unknown_base: 2 } })
  })

  it('still compares exactly when the base is declared', () => {
    expect(detail(computeScore([m('nitrato_mg_L_N', 20)], nitrate), 'nitrato_mg_L_N')).toMatchObject({ nonCompliant: 1 })
  })
})

describe('computeScore: censored with unknown direction', () => {
  it('never decides a value flagged outside the detection limit without a direction (INEA 2025 status 2)', () => {
    const result = computeScore([m('turbidez_UNT', 10, { qualifier: '?' }), m('turbidez_UNT', 10)], RULE)
    expect(detail(result, 'turbidez_UNT')).toMatchObject({ compliant: 1, excluded: { censored_indeterminate: 1 } })
  })
})

describe('computeScore: weighting and coverage', () => {
  const rule: ScoreRule = {
    version: 3, conamaClass: 2, minSamplesPerParameter: 2, minCoverage: 0.6,
    parameters: [{ id: 'turbidez_UNT', weight: 2 }, { id: 'OD_mg_L_O2', weight: 1 }, { id: 'DBO_5d_20C_mg_L_O2', weight: 1 }]
  }

  it('computes the weighted mean over evaluated parameters and the integer score for the chain', () => {
    const result = computeScore([
      m('turbidez_UNT', 10), m('turbidez_UNT', 150), // 0.5
      m('OD_mg_L_O2', 6), m('OD_mg_L_O2', 7), // 1
      m('DBO_5d_20C_mg_L_O2', 2) // one sample < minimum 2: insufficient
    ], rule)

    expect(detail(result, 'DBO_5d_20C_mg_L_O2').status).toBe('insufficient')
    expect(result.coverage).toBeCloseTo(0.75)
    expect(result.score).toBeCloseTo((2 * 0.5 + 1 * 1) / 3)
    expect(result.onchainScore).toBe(67)
    expect(result).toMatchObject({ status: 'scored', ruleVersion: 3, conamaClass: 2 })
  })

  it('produces no score when the evaluated weight is below the minimum coverage', () => {
    const result = computeScore([m('turbidez_UNT', 10), m('turbidez_UNT', 20)], rule)
    expect(result.coverage).toBeCloseTo(0.5)
    expect(result).toMatchObject({ status: 'insufficient_coverage', score: null, onchainScore: null })
  })

  it('is deterministic: the same samples in any order give the same result', () => {
    const samples = [m('turbidez_UNT', 10), m('turbidez_UNT', 150), m('OD_mg_L_O2', 6), m('OD_mg_L_O2', 7)]
    expect(computeScore([...samples].reverse(), rule)).toEqual(computeScore(samples, rule))
  })
})
