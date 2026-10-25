/**
 * Unit handling with an official source. The CONAMA catalog unit is the reference; anything else is
 * accepted only where a source says it is the same quantity, or handled as an explicit ambiguity.
 */

// Same unit under another name. INEA "IQA-NSF Metodologia" (Dec 2019): "100 uT (ou NTU)"; UNT is the
// Portuguese name of NTU (nephelometric turbidity unit).
export const UNIT_ALIASES: Record<string, string[]> = {
  turbidez_UNT: ['NTU', 'uT']
}

/**
 * Nutrients reported in plain mg/L without saying whether as N/P or as the compound (gap G-20).
 * The true value in the CONAMA base is either the reported value or the reported value divided by
 * the molar-mass ratio of the compound to the element; a sample is decided only when both agree.
 */
export const AMBIGUOUS_BASE: Record<string, { unit: string; factor: number; compound: string }> = {
  // NO3 / N = 62.0049 / 14.0067
  nitrato_mg_L_N: { unit: 'mg/L', factor: 62.0049 / 14.0067, compound: 'NO3' },
  // PO4 / P = 94.9714 / 30.9738
  fosforo_total_mg_L_P: { unit: 'mg/L', factor: 94.9714 / 30.9738, compound: 'PO4' }
}
