import { validateScoreRule, type ScoreRule } from '../rule'

/**
 * Pilot score rule, version 1 (sent on-chain as scoreVersion 1). Sources:
 *  - conamaClass 2: CONAMA 357/2005, Art. 42; no approved classification for the Macaé and das Ostras
 *    rivers is known (gap G-19);
 *  - phosphorusEnvironment lotico: Art. 2, V ("águas continentais moventes"); all RH-VIII stations are
 *    rivers (INEA consolidated bulletin 2025);
 *  - weights: INEA "IQA-NSF Metodologia" (Dec 2019) for the IQA parameters that have a CONAMA limit
 *    (temperature has none; INEA measures E. coli, which has no numeric CONAMA limit);
 *  - minCoverage 1 and minSamplesPerParameter 1 (every sample of the period, all seven parameters
 *    decided): decision of the project owner, 2026-10-25.
 */
const raw = {
  version: 1,
  conamaClass: 2,
  phosphorusEnvironment: 'lotico',
  parameters: [
    { id: 'OD_mg_L_O2', weight: 0.17 },
    { id: 'DBO_5d_20C_mg_L_O2', weight: 0.11 },
    { id: 'pH', weight: 0.11 },
    { id: 'fosforo_total_mg_L_P', weight: 0.1 },
    { id: 'nitrato_mg_L_N', weight: 0.1 },
    { id: 'turbidez_UNT', weight: 0.08 },
    { id: 'solidos_dissolvidos_totais_mg_L', weight: 0.07 }
  ],
  minSamplesPerParameter: 1,
  minCoverage: 1
}

const validated = validateScoreRule(raw)
if ('errors' in validated) {
  throw new Error(`Invalid pilot score rule: ${validated.errors.join('; ')}`)
}

export const PILOT_RULE_V1: ScoreRule = validated.rule
