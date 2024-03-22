import { resolve } from '../lib/resolve.js'
import first from 'it-first'
import last from 'it-last'
import errCode from 'err-code'
import { createGet as createBlockGet } from '../block/get.js'
import type { Multicodecs } from '../index.js'
import type { CID } from 'multiformats'
import type { GetOptions, GetResult } from './index.js'
import type { Client } from '../lib/core.js'

export function createGet (codecs: Multicodecs, client: Client) {
  const getBlock = createBlockGet(client)

  const get = async (cid: CID, options?: GetOptions): Promise<GetResult> => {
    if (options?.path != null) {
      const entry = options.localResolve != null
        ? await first(resolve(cid, options.path, codecs, getBlock, options))
        : await last(resolve(cid, options.path, codecs, getBlock, options))
      const result: GetResult | undefined = (entry)

      if (result == null) {
        throw errCode(new Error('Not found'), 'ERR_NOT_FOUND')
      }

      return result
    }

    const codec = await codecs.getCodec(cid.code)
    const block = await getBlock(cid, options)
    const node = codec.decode(block)

    return {
      value: node,
      remainderPath: ''
    }
  }

  return get
}
