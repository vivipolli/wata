// Generated from the CONAMA 357/2005 fresh-water limits extracted on 2026-10-22
// (source text: conama357-2005-conama.pdf; extraction file sha256 86e4078bf34bd586). Do not edit by hand: regenerate.

export type ConamaClass = 1 | 2 | 3
export type PhosphorusEnvironment = 'lentico' | 'intermediario' | 'lotico'
export type LimitKind = 'max' | 'min' | 'range' | 'max_by_ph' | 'max_by_environment' | 'max_statistical'

export interface PhBand { phAbove: number | null; phUpTo: number | null; max: number }
export type Limit =
  | number
  | { min: number; max: number }
  | PhBand[]
  | Record<PhosphorusEnvironment, number>
  | null

export interface ConamaParameter {
  unit: string
  kind: LimitKind
  articles: string
  // null: the class has no numeric limit for this parameter
  limits: Record<ConamaClass, Limit>
  // Open questions that affect this parameter (see the gaps register)
  pending?: string
}

export const CONAMA_357: Record<string, ConamaParameter> = {
  turbidez_UNT: {
    unit: 'UNT',
    kind: 'max',
    articles: 'Art.14 I-j; Art.15 IV; Art.16 I-l',
    limits: { 1: 40, 2: 100, 3: 100 }
  },
  cor_verdadeira_mgPt_L: {
    unit: 'mg Pt/L',
    kind: 'max',
    articles: 'Art.14 I-l; Art.15 III; Art.16 I-m',
    limits: { 1: null, 2: 75, 3: 75 },
    pending: 'Class 1 has no numeric limit (natural colour of the water body).'
  },
  DBO_5d_20C_mg_L_O2: {
    unit: 'mg/L O2',
    kind: 'max',
    articles: 'Art.14 I-h; Art.15 V; Art.16 I-i',
    limits: { 1: 3, 2: 5, 3: 10 }
  },
  OD_mg_L_O2: {
    unit: 'mg/L O2',
    kind: 'min',
    articles: 'Art.14 I-i; Art.15 VI; Art.16 I-j',
    limits: { 1: 6, 2: 5, 3: 4 }
  },
  pH: {
    unit: 'pH',
    kind: 'range',
    articles: 'Art.14 I-m; (classe 2 herda da 1); Art.16 I-n',
    limits: { 1: { min: 6.0, max: 9.0 }, 2: { min: 6.0, max: 9.0 }, 3: { min: 6.0, max: 9.0 } }
  },
  solidos_dissolvidos_totais_mg_L: {
    unit: 'mg/L',
    kind: 'max',
    articles: 'Tabela I (classe 1), classe 2 herda; Tabela III',
    limits: { 1: 500, 2: 500, 3: 500 }
  },
  clorofila_a_ug_L: {
    unit: 'ug/L',
    kind: 'max',
    articles: 'Tabela I; Art.15 VII; Tabela III',
    limits: { 1: 10, 2: 30, 3: 60 },
    pending: 'Unit read as ug/L from extracted text (the micro sign was lost); confirm in the PDF.'
  },
  nitrato_mg_L_N: {
    unit: 'mg/L N',
    kind: 'max',
    articles: 'Tabela I; classe 2 herda; Tabela III',
    limits: { 1: 10.0, 2: 10.0, 3: 10.0 },
    pending: 'Limits are mg/L as N; INEA columns state only mg/L (gap G-20).'
  },
  nitrito_mg_L_N: {
    unit: 'mg/L N',
    kind: 'max',
    articles: 'Tabela I; classe 2 herda; Tabela III',
    limits: { 1: 1.0, 2: 1.0, 3: 1.0 },
    pending: 'Limits are mg/L as N; INEA columns state only mg/L (gap G-20).'
  },
  nitrogenio_amoniacal_total_mg_L_N: {
    unit: 'mg/L N',
    kind: 'max_by_ph',
    articles: 'Tabela I; Tabela III',
    limits: { 1: [{ phAbove: null, phUpTo: 7.5, max: 3.7 }, { phAbove: 7.5, phUpTo: 8.0, max: 2.0 }, { phAbove: 8.0, phUpTo: 8.5, max: 1.0 }, { phAbove: 8.5, phUpTo: null, max: 0.5 }], 2: [{ phAbove: null, phUpTo: 7.5, max: 3.7 }, { phAbove: 7.5, phUpTo: 8.0, max: 2.0 }, { phAbove: 8.0, phUpTo: 8.5, max: 1.0 }, { phAbove: 8.5, phUpTo: null, max: 0.5 }], 3: [{ phAbove: null, phUpTo: 7.5, max: 13.3 }, { phAbove: 7.5, phUpTo: 8.0, max: 5.6 }, { phAbove: 8.0, phUpTo: 8.5, max: 2.2 }, { phAbove: 8.5, phUpTo: null, max: 1.0 }] },
    pending: 'Limits are mg/L as N and depend on the sample pH; INEA columns state only mg/L (gap G-20).'
  },
  fosforo_total_mg_L_P: {
    unit: 'mg/L P',
    kind: 'max_by_environment',
    articles: 'Tabela I; Art.15 IX; Tabela III',
    limits: { 1: { lentico: 0.02, intermediario: 0.025, lotico: 0.1 }, 2: { lentico: 0.03, intermediario: 0.05, lotico: 0.1 }, 3: { lentico: 0.05, intermediario: 0.075, lotico: 0.15 } },
    pending: 'Limits are mg/L as P and depend on the environment type of the station (gap G-20).'
  },
  coliformes_termotolerantes_NMP_100mL: {
    unit: 'NMP/100mL',
    kind: 'max_statistical',
    articles: 'Art.14 I-g; Art.15 II; Art.16 I-g',
    limits: { 1: 200, 2: 1000, 3: 4000 },
    pending: 'Statistical limit: 80% or more of at least 6 samples per year, bimonthly (gap G-23).'
  },
  cianobacterias_cel_mL: {
    unit: 'cel/mL',
    kind: 'max',
    articles: 'Art.15 VIII',
    limits: { 1: null, 2: 50000, 3: null },
    pending: 'Only class 2 has a limit in the extracted text.'
  }
}
