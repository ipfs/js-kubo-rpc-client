import last from 'it-last'
import { createAddAll } from './add-all.js'
import type { PinAPI } from './index.js'
import type { HTTPRPCClient } from '../lib/core.js'

export function createAdd (client: HTTPRPCClient): PinAPI['add'] {
  const all = createAddAll(client)

  return async function add (path, options = {}) {
    const res = await last(all([{
      path: path.toString(),
      ...options
    }], options))

    if (res == null) {
      throw new Error('No response received')
    }

    return res
  }
}
