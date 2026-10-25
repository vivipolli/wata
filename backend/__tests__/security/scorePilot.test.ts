/**
 * Pilot score rule (F3, version 1) and its behaviour on real INEA data from RH-VIII.
 * Every value of the rule has an official source:
 *  - class 2: CONAMA 357/2005, Art. 42 (no approved classification for the Macaé and das Ostras rivers);
 *  - lotic environment: Art. 2, V ("águas continentais moventes"); the 10 RH-VIII stations are rivers
 *    (INEA consolidated bulletin 2025);
 *  - weights: INEA "IQA-NSF Metodologia" (Dec 2019) for the parameters that have a CONAMA limit;
 *  - coverage 100% and every sample of the period: decision of the project owner.
 * The fixture is an extract of the public INEA spreadsheet "Dados brutos RH 2012-2025"
 * (sha256 b930b9e0dd3b24c7d2e4b353744cb24bb8ecc549edc227c332f0af94d8eed066).
 */
import { PILOT_RULE } from '../../src/score/rules'
import { computeScore } from '../../src/score/engine'
import { fromInea, type IneaRow } from '../../src/score/inea'
import fs from 'fs'
import path from 'path'

const fixture = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'fixtures', 'inea-rh8-pilot.json'), 'utf8'))
const rows: IneaRow[] = fixture.rows

describe('pilot rule v1', () => {
  it('uses the official INEA IQA-NSF weights for the parameters with a CONAMA limit', () => {
    expect(PILOT_RULE.parameters).toEqual([
      { id: 'OD_mg_L_O2', weight: 0.17 },
      { id: 'DBO_5d_20C_mg_L_O2', weight: 0.11 },
      { id: 'pH', weight: 0.11 },
      { id: 'fosforo_total_mg_L_P', weight: 0.1 },
      { id: 'nitrato_mg_L_N', weight: 0.1 },
      { id: 'turbidez_UNT', weight: 0.08 },
      { id: 'solidos_dissolvidos_totais_mg_L', weight: 0.07 }
    ])
  })

  it('applies class 2, lotic phosphorus, full coverage and every available sample', () => {
    expect(PILOT_RULE).toMatchObject({ version: 1, conamaClass: 2, phosphorusEnvironment: 'lotico', minCoverage: 1, minSamplesPerParameter: 1 })
  })
})

describe('INEA rows to measurements', () => {
  const row = (overrides: Partial<IneaRow>): IneaRow => ({
    estacao: '00RJ24MC0010', data: '2025-01-21', parametro_id: 'od', unidade: 'mg/L', qualificador: 'MEDIDO', valor_num: '7.5', ...overrides
  })

  it('maps oxygen and BOD mg/L to mg/L O2, keeps nutrients without a base, and maps qualifiers', () => {
    expect(fromInea(row({}))).toEqual({ parameter: 'OD_mg_L_O2', value: 7.5, unit: 'mg/L O2', qualifier: null, station: 'MC0010', sampledAt: '2025-01-21' })
    expect(fromInea(row({ parametro_id: 'dbo', qualificador: 'ABAIXO_LD', valor_num: '2' }))).toMatchObject({ parameter: 'DBO_5d_20C_mg_L_O2', unit: 'mg/L O2', qualifier: '<' })
    expect(fromInea(row({ parametro_id: 'nitrato', valor_num: '0.5' }))).toMatchObject({ parameter: 'nitrato_mg_L_N', unit: 'mg/L' })
    expect(fromInea(row({ parametro_id: 'ph', unidade: '', valor_num: '7.1' }))).toMatchObject({ parameter: 'pH', unit: 'pH' })
    expect(fromInea(row({ qualificador: 'ACIMA_LIMITE' }))).toMatchObject({ qualifier: '>' })
    expect(fromInea(row({ qualificador: 'FORA_LD' }))).toMatchObject({ qualifier: '?' })
    // An unknown code is never read as a measured value
    expect(fromInea(row({ qualificador: 'NR' }))).toMatchObject({ qualifier: '?' })
  })

  it('reads "Nitratos" (2025 sheet) as nitrate, as confirmed by the specialist', () => {
    expect(fromInea(row({ parametro_id: 'nitratos', valor_num: '0.44' }))).toMatchObject({ parameter: 'nitrato_mg_L_N', unit: 'mg/L', value: 0.44 })
  })

  it('keeps other renamed 2025 parameters separate (specialist: different parameters)', () => {
    expect(fromInea(row({ parametro_id: 'nitritos' }))).toBeNull()
    expect(fromInea(row({ parametro_id: 'ortofosfatop' }))).toBeNull()
  })

  it('ignores parameters outside the pilot rule and rows without a numeric value', () => {
    expect(fromInea(row({ parametro_id: 'ecoli' }))).toBeNull()
    expect(fromInea(row({ valor_num: '' }))).toMatchObject({ value: null })
  })
})

describe('real RH-VIII samples (values checkable against the INEA spreadsheet)', () => {
  const sample = (station: string, date: string) =>
    rows.filter(r => r.estacao === station && r.data === date).map(fromInea).filter((m): m is NonNullable<typeof m> => m !== null)

  it('MC0002, 2024-06-26: every parameter within the class 2 limits that can be decided', () => {
    const result = computeScore(sample('00RJ04MC0002', '2024-06-26'), PILOT_RULE)
    const byId = Object.fromEntries(result.parameters.map(p => [p.id, p]))
    // DBO "<2" (2 <= 5), phosphorus 0.03 (<= 0.1 in both bases), nitrate 0.22 (<= 10), pH 7.13, turbidity 12.5 NTU (<= 100)
    expect(byId.DBO_5d_20C_mg_L_O2).toMatchObject({ compliant: 1, nonCompliant: 0 })
    expect(byId.fosforo_total_mg_L_P).toMatchObject({ compliant: 1 })
    expect(byId.nitrato_mg_L_N).toMatchObject({ compliant: 1 })
    expect(byId.pH).toMatchObject({ compliant: 1 })
    expect(byId.turbidez_UNT).toMatchObject({ compliant: 1 })
  })
})

describe('real RH-VIII station-years', () => {
  const byStationYear = new Map<string, IneaRow[]>()
  for (const r of rows) {
    const key = `${r.estacao}|${r.data.slice(0, 4)}`
    byStationYear.set(key, [...(byStationYear.get(key) ?? []), r])
  }

  it('scores only the periods where all seven parameters were decided, and never invents a score', () => {
    let scored = 0
    for (const [, group] of byStationYear) {
      const result = computeScore(group.map(fromInea).filter((m): m is NonNullable<typeof m> => m !== null), PILOT_RULE)
      const allEvaluated = result.parameters.every(p => p.status === 'evaluated')
      expect(result.status === 'scored').toBe(allEvaluated)
      if (result.status === 'scored') {
        scored++
        expect(result.onchainScore).toBeGreaterThanOrEqual(0)
        expect(result.onchainScore).toBeLessThanOrEqual(100)
      } else {
        expect(result.score).toBeNull()
      }
    }
    expect(scored).toBeGreaterThan(0)
  })
})
