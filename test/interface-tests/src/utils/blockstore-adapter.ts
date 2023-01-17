import { BaseBlockstore } from 'blockstore-core/base'
import * as raw from 'multiformats/codecs/raw'
import * as dagPB from '@ipld/dag-pb'
import * as dagCBOR from '@ipld/dag-cbor'
import { sha256 } from 'multiformats/hashes/sha2'
import { toString as uint8ArrayToString } from 'uint8arrays/to-string'
import type { CID } from 'multiformats/cid'
import type { KuboClient } from '../../../../src'

const formats: Record<number, string> = {
  [raw.code]: raw.name,
  [dagPB.code]: dagPB.name,
  [dagCBOR.code]: dagCBOR.name
}

const hashes: Record<number, string> = {
  [sha256.code]: sha256.name
}

class IPFSBlockstore extends BaseBlockstore {
  ipfs: KuboClient

  constructor (ipfs: KuboClient) {
    super()

    this.ipfs = ipfs
  }

  async put (cid: CID, buf: Uint8Array) {
    const c = await this.ipfs.block.put(buf, {
      format: formats[cid.code],
      mhtype: hashes[cid.multihash.code]
    })

    if (uint8ArrayToString(c.multihash.bytes, 'base64') !== uint8ArrayToString(cid.multihash.bytes, 'base64')) {
      throw new Error('Multihashes of stored blocks did not match')
    }
  }
}

export default function createBlockstore (ipfs: KuboClient) {
  return new IPFSBlockstore(ipfs)
}
