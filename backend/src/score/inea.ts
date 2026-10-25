import type { Measurement } from './engine'

/** A normalized row of the public INEA spreadsheet (dMRV engine output). */
export interface IneaRow {
  estacao: string
  data: string
  parametro_id: string
  unidade: string
  qualificador: string
  valor_num: string
}

/**
 * INEA parameter id -> CONAMA catalog id, with the unit rewrite each one needs. OD and BOD are by
 * definition oxygen (mg/L = mg/L O2); nitrate and total phosphorus keep plain mg/L, which the engine
 * treats as an unknown base. "nitratos" (2025 sheet) is "nitrato" under a new name: confirmed by the
 * domain specialist on 2026-10-25 (never in the same sample or year as "nitrato", same unit, same IQA
 * role, station medians 2025/2024 of 1.14 across 159 stations, far from the NO3/N factor 4.43).
 */
const PARAMETERS: Record<string, { id: string; unit?: (unit: string) => string }> = {
  od: { id: 'OD_mg_L_O2', unit: u => (u === 'mg/L' ? 'mg/L O2' : u) },
  dbo: { id: 'DBO_5d_20C_mg_L_O2', unit: u => (u === 'mg/L' ? 'mg/L O2' : u) },
  ph: { id: 'pH', unit: u => (u === '' ? 'pH' : u) },
  fosforototal: { id: 'fosforo_total_mg_L_P' },
  nitrato: { id: 'nitrato_mg_L_N' },
  nitratos: { id: 'nitrato_mg_L_N' },
  turbidez: { id: 'turbidez_UNT' },
  solidosdissolvidostotais: { id: 'solidos_dissolvidos_totais_mg_L' }
}

// MEDIDO: measured; ABAIXO_LD: below the detection limit; ACIMA_LIMITE: above the method range;
// FORA_LD: 2025 status 2, outside the detection limit with no direction
const QUALIFIERS: Record<string, Measurement['qualifier']> = {
  MEDIDO: null, ABAIXO_LD: '<', ACIMA_LIMITE: '>', FORA_LD: '?'
}

export function fromInea(row: IneaRow): Measurement | null {
  const map = PARAMETERS[row.parametro_id]
  if (!map) return null
  const value = row.valor_num === '' ? null : Number(row.valor_num)
  return {
    parameter: map.id,
    value,
    unit: map.unit ? map.unit(row.unidade) : row.unidade,
    // An unknown qualifier code is treated as censored with no direction (never as measured)
    qualifier: row.qualificador in QUALIFIERS ? QUALIFIERS[row.qualificador] : '?',
    station: row.estacao,
    sampledAt: row.data
  }
}
