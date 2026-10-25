/**
 * Station identity: the code INEA publishes in its consolidated bulletins (e.g. MC0010). The raw
 * spreadsheet code changes prefix between years for the same station (gap G-33); only the codes
 * listed here are unified, each checked to never appear in the same year as the other (RH-VIII:
 * 00RJ04 up to 2024, 00RJ24 only in 2025). Codes not listed keep their raw form: where two prefixes
 * coexist in a year (e.g. PR0000, GN0400) they may be different stations.
 * Decision of the project owner, 2026-10-25.
 */
export const BULLETIN_STATIONS: Record<string, string[]> = {
  DB0010: ['00RJ04DB0010'],
  IM0010: ['00RJ04IM0010'],
  MC0002: ['00RJ04MC0002'],
  MC0010: ['00RJ04MC0010', '00RJ24MC0010'],
  OU0020: ['00RJ04OU0020', '00RJ24OU0020'],
  RB0010: ['00RJ04RB0010', '00RJ24RB0010'],
  RO0015: ['00RJ04RO0015'],
  SN0005: ['00RJ04SN0005', '00RJ24SN0005'],
  SP0010: ['00RJ04SP0010', '00RJ24SP0010'],
  SP0050: ['00RJ04SP0050']
}

const BY_RAW_CODE = new Map(Object.entries(BULLETIN_STATIONS).flatMap(([bulletin, raws]) => raws.map(raw => [raw, bulletin] as const)))

/** Bulletin code of a raw spreadsheet station code, or the raw code when it is not in the table. */
export function bulletinStation(rawCode: string): string {
  return BY_RAW_CODE.get(rawCode) ?? rawCode
}
