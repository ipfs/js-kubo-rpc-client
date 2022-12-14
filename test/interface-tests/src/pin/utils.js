import { expect } from 'aegir/chai'
import loadFixture from 'aegir/fixtures'
import { CID } from 'multiformats/cid'
import drain from 'it-drain'
import { fromString as uint8ArrayFromString } from 'uint8arrays/from-string'
import first from 'it-first'
import { bytes } from 'multiformats'
import { code, encode } from 'multiformats/codecs/raw'
import { sha256 } from 'multiformats/hashes/sha2'

const { fromString } = bytes

export const pinTypes = {
  direct: 'direct',
  recursive: 'recursive',
  indirect: 'indirect',
  all: 'all'
}

export const fixtures = Object.freeze({
  // NOTE: files under 'directory' need to be different than standalone ones in 'files'
  directory: Object.freeze({
    cid: CID.parse('QmY8KdYQSYKFU5hM7F5ioZ5yYSgV5VZ1kDEdqfRL3rFgcd'),
    files: Object.freeze([Object.freeze({
      path: 'test-folder/ipfs-add.js',
      data: loadFixture('test/interface-tests/fixtures/test-folder/ipfs-add.js'),
      cid: CID.parse('QmbKtKBrmeRHjNCwR4zAfCJdMVu6dgmwk9M9AE9pUM9RgG')
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

/**
 * @param {import('ipfs-core-types').IPFS} ipfs
 */
export const clearPins = async (ipfs) => {
  await drain(ipfs.pin.rmAll(ipfs.pin.ls({ type: pinTypes.recursive })))
  await drain(ipfs.pin.rmAll(ipfs.pin.ls({ type: pinTypes.direct })))
}

/**
 * @param {import('ipfs-core-types').IPFS} ipfs
 */
export const clearRemotePins = async (ipfs) => {
  for (const { service } of await ipfs.pin.remote.service.ls()) {
    const cids = []
    const status = ['queued', 'pinning', 'pinned', 'failed']
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

/**
 * @param {import('ipfs-core-types').IPFS} ipfs
 * @param {string} service
 * @param {Record<string, CID>} pins
 */
export const addRemotePins = async (ipfs, service, pins) => {
  const requests = []
  for (const [name, cid] of Object.entries(pins)) {
    requests.push(ipfs.pin.remote.add(cid, {
      name,
      service,
      background: true
    }))
  }
  const settledResults = await Promise.allSettled(requests)
  const values = []
  const failures = []
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

/**
 * @param {import('ipfs-core-types').IPFS} ipfs
 */
export const clearServices = async (ipfs) => {
  const services = await ipfs.pin.remote.service.ls()
  await Promise.all(services.map(({ service }) => ipfs.pin.remote.service.rm(service)))
}

/**
 * @param {import('ipfs-core-types').IPFS} ipfs
 * @param {CID} cid
 * @param {string} type
 * @param {boolean} pinned
 */
export const expectPinned = async (ipfs, cid, type = pinTypes.all, pinned = true) => {
  if (typeof type === 'boolean') {
    pinned = type
    type = pinTypes.all
  }

  const result = await isPinnedWithType(ipfs, cid, type)
  expect(result).to.eql(pinned)
}

/**
 * @param {import('ipfs-core-types').IPFS} ipfs
 * @param {CID} cid
 * @param {string} type
 */
export const expectNotPinned = (ipfs, cid, type = pinTypes.all) => {
  return expectPinned(ipfs, cid, type, false)
}

/**
 * @param {import('ipfs-core-types').IPFS} ipfs
 * @param {CID} cid
 * @param {string} type
 */
export async function isPinnedWithType (ipfs, cid, type) {
  try {
    const res = await first(ipfs.pin.ls({ paths: cid, type }))

    return Boolean(res)
  } catch (/** @type {any} */ err) {
    return false
  }
}

/**
 *
 * @param {string} value
 * @returns {Promise<CID<string, 85, 18, 1>>}
 */
export async function getInlineCid (value = process.hrtime().toString()) {
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
