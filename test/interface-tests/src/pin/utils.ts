import { expect } from 'aegir/chai'
import loadFixture from 'aegir/fixtures'
import drain from 'it-drain'
import first from 'it-first'
import { bytes } from 'multiformats'
import { CID } from 'multiformats/cid'
import { code, encode } from 'multiformats/codecs/raw'
import { sha256 } from 'multiformats/hashes/sha2'
import { fromString as uint8ArrayFromString } from 'uint8arrays/from-string'
import type { KuboRPCClient } from '../../../../src/index.js'
import type { PinType } from '../../../../src/pin/index.js'
import type { RemotePin, RemotePinStatus } from '../../../../src/pin/remote/index.js'

const { fromString } = bytes

export const pinTypes: Record<string, PinType> = {
  direct: 'direct',
  recursive: 'recursive',
  indirect: 'indirect',
  all: 'all'
}

export const fixtures = Object.freeze({
  // NOTE: files under 'directory' need to be different than standalone ones in 'files'
  directory: Object.freeze({
    cid: CID.parse('QmSjnCov8q2oU54bGE4n9B3BoaBv8ALVZUUkzLjqAN9Roj'),
    files: Object.freeze([Object.freeze({
      path: 'test-folder/ipfs-add.js',
      data: loadFixture('test/interface-tests/fixtures/test-folder/ipfs-add.js'),
      cid: CID.parse('QmdWJndBCczwPQeiKiSBzef8TyWigApDqY3q8p7jg9CiQK')
    }), Object.freeze({
      path: 'test-folder/files/ipfs.txt',
      data: loadFixture('test/interface-tests/fixtures/test-folder/files/ipfs.txt'),
      cid: CID.parse('QmdFyxZXsFiP4csgfM5uPu99AvFiKH62CSPDw5TP92nr7w')
    })])
  }),
  files: Object.freeze([Object.freeze({
    data: uint8ArrayFromString('Plz add me!\n'),
    cid: CID.parse('Qma4hjFTnCasJ8PVp3mZbZK5g2vGDT4LByLJ7m8ciyRFZP')
  }), Object.freeze({
    data: loadFixture('test/interface-tests/fixtures/test-folder/files/hello.txt'),
    cid: CID.parse('QmY9cxiHqTFoWamkQVkpmmqzBrY3hCBEL2XNu3NtX74Fuu')
  })])
})

export const clearPins = async (ipfs: KuboRPCClient): Promise<void> => {
  await drain(ipfs.pin.rmAll(ipfs.pin.ls({ type: pinTypes.recursive })))
  await drain(ipfs.pin.rmAll(ipfs.pin.ls({ type: pinTypes.direct })))
}

export const clearRemotePins = async (ipfs: KuboRPCClient): Promise<void> => {
  for (const { service } of await ipfs.pin.remote.service.ls()) {
    const cids = []
    const status: RemotePinStatus[] = ['queued', 'pinning', 'pinned', 'failed']
    for await (const pin of ipfs.pin.remote.ls({ status, service })) {
      cids.push(pin.cid)
    }

    if (cids.length > 0) {
      await ipfs.pin.remote.rmAll({
        cid: cids,
        status,
        service
      })
    }
  }
}

export const addRemotePins = async (ipfs: KuboRPCClient, service: string, pins: Record<string, CID>): Promise<RemotePin[]> => {
  const requests = []
  for (const [name, cid] of Object.entries(pins)) {
    requests.push(ipfs.pin.remote.add(cid, {
      name,
      service,
      background: true
    }))
  }
  const settledResults = await Promise.allSettled(requests)
  const values: RemotePin[] = []
  const failures: Error[] = []
  settledResults.forEach((settled) => {
    if (settled.status === 'fulfilled') {
      values.push(settled.value)
    } else {
      failures.push(settled.reason)
    }
  })

  if (failures.length > 0) {
    // eslint-disable-next-line no-console
    console.error('addRemotePins failures: ', failures)
  }
  return values
}

export const clearServices = async (ipfs: KuboRPCClient): Promise<void> => {
  const services = await ipfs.pin.remote.service.ls()
  await Promise.all(services.map(async ({ service }) => ipfs.pin.remote.service.rm(service)))
}

export const expectPinned = async (ipfs: KuboRPCClient, cid: CID, type: PinType = pinTypes.all, pinned: boolean = true): Promise<void> => {
  if (typeof type === 'boolean') {
    pinned = type
    type = pinTypes.all
  }

  const result = await isPinnedWithType(ipfs, cid, type)
  expect(result).to.eql(pinned)
}

export const expectNotPinned = async (ipfs: KuboRPCClient, cid: CID, type: PinType = pinTypes.all): Promise<void> => {
  return expectPinned(ipfs, cid, type, false)
}

export async function isPinnedWithType (ipfs: KuboRPCClient, cid: CID, type: PinType): Promise<boolean> {
  try {
    const res = await first(ipfs.pin.ls({ paths: cid, type }))

    return Boolean(res)
  } catch (err: any) {
    return false
  }
}

export async function getInlineCid (value: string = process.hrtime().toString()): Promise<CID<string, 85, 18, 1>> {
  const inlineUint8Array = fromString(value)
  try {
    const bytes = encode(inlineUint8Array)
    const hash = await sha256.digest(bytes)
    /**
     * @type {CID<string, 85, 18, 1>}
     */
    const cid = CID.create(1, code, hash)
    return cid
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('Problem creating an inline CID', err)
    throw err
  }
}
