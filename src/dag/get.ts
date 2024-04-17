import errCode from 'err-code'
import first from 'it-first'
import last from 'it-last'
import { createGet as createBlockGet } from '../block/get.js'
import { resolve } from '../lib/resolve.js'
import type { DAGAPI } from './index.js'
import type { Codecs } from '../index.js'
import type { HTTPRPCClient } from '../lib/core.js'

export function createGet (client: HTTPRPCClient, codecs: Codecs): DAGAPI['get'] {
  const getBlock = createBlockGet(client)

  return async function get (cid, options = {}) {
    if (options.path != null) {
      const entry = options.localResolve === true
        ? await first(resolve(cid, options.path, codecs, getBlock, options))
        : await last(resolve(cid, options.path, codecs, getBlock, options))
      /** @type {import('../types').GetResult | undefined} - first and last will return undefined when empty */
      const result = (entry)

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
}
