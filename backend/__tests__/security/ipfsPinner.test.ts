/**
 * IPFS pinning (F5): the exact metadata bytes are uploaded, so the returned CID covers what the
 * certificate hashed. fetch is stubbed; no request leaves the machine.
 */
import { PinataPinner, pinnerFromEnv } from '../../src/services/ipfs'

afterEach(() => jest.restoreAllMocks())

describe('PinataPinner', () => {
  it('uploads the exact bytes with the bearer token and returns the CID', async () => {
    let sent: any
    jest.spyOn(global, 'fetch').mockImplementation(async (url: any, init: any) => {
      sent = { url: String(url), init }
      return { ok: true, status: 200, json: async () => ({ IpfsHash: 'bafybeiexample' }) } as any
    })

    const cid = await new PinataPinner('jwt-for-test').pinJson('{"a":1}', 'c.json')

    expect(cid).toBe('bafybeiexample')
    expect(sent.url).toBe('https://api.pinata.cloud/pinning/pinFileToIPFS')
    expect(sent.init.headers.Authorization).toBe('Bearer jwt-for-test')
    expect(await (sent.init.body.get('file') as Blob).text()).toBe('{"a":1}')
  })

  it('fails on an HTTP error', async () => {
    jest.spyOn(global, 'fetch').mockImplementation(async () => ({ ok: false, status: 401, json: async () => ({}) }) as any)
    await expect(new PinataPinner('x').pinJson('{}', 'c.json')).rejects.toThrow('401')
  })
})

describe('pinnerFromEnv', () => {
  it('requires a supported provider and its credential', () => {
    const saved = { ...process.env }
    delete process.env.IPFS_PROVIDER
    expect(() => pinnerFromEnv()).toThrow('IPFS_PROVIDER')
    process.env.IPFS_PROVIDER = 'pinata'
    delete process.env.PINATA_JWT
    expect(() => pinnerFromEnv()).toThrow('PINATA_JWT')
    Object.assign(process.env, saved)
  })
})
