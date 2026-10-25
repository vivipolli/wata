/**
 * Station identity (G-33): raw INEA codes that change prefix between years are unified under the
 * bulletin code, only through an explicit table, and only where the raw codes never share a year.
 */
import fs from 'fs'
import path from 'path'
import { BULLETIN_STATIONS, bulletinStation } from '../../src/score/stations'

const rows: Array<{ estacao: string; data: string }> =
  JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'fixtures', 'inea-rh8-pilot.json'), 'utf8')).rows

describe('bulletinStation', () => {
  it('maps both prefixes of a renamed RH-VIII station to its bulletin code', () => {
    expect(bulletinStation('00RJ04MC0010')).toBe('MC0010')
    expect(bulletinStation('00RJ24MC0010')).toBe('MC0010')
    expect(bulletinStation('00RJ04SP0050')).toBe('SP0050')
  })

  it('keeps any code outside the table unchanged (no rule by suffix)', () => {
    expect(bulletinStation('00RJ12PR0000')).toBe('00RJ12PR0000')
    expect(bulletinStation('00RJ99MC0010')).toBe('00RJ99MC0010')
  })

  it('lists the 10 RH-VIII stations of the consolidated bulletin', () => {
    expect(Object.keys(BULLETIN_STATIONS).sort()).toEqual(['DB0010', 'IM0010', 'MC0002', 'MC0010', 'OU0020', 'RB0010', 'RO0015', 'SN0005', 'SP0010', 'SP0050'])
  })

  it('only unifies raw codes that never appear in the same year (checked on the INEA data)', () => {
    for (const raws of Object.values(BULLETIN_STATIONS)) {
      const years = raws.map(raw => new Set(rows.filter(r => r.estacao === raw).map(r => r.data.slice(0, 4))))
      for (let i = 0; i < years.length; i++) {
        for (let j = i + 1; j < years.length; j++) {
          expect([...years[i]].filter(y => years[j].has(y))).toEqual([])
        }
      }
    }
  })

  it('covers every RH-VIII station code present in the INEA data', () => {
    const unknown = [...new Set(rows.map(r => r.estacao))].filter(code => bulletinStation(code) === code)
    expect(unknown).toEqual([])
  })
})
