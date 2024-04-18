import last from 'it-last'
import { createAddAll } from './add-all.js'
import { normaliseInput } from './lib/files/normalise-input-single.js'
import type { KuboRPCClient } from './index.js'
import type { HTTPRPCClient } from './lib/core.js'

export function createAdd (client: HTTPRPCClient): KuboRPCClient['add'] {
  const all = createAddAll(client)

  return async function add (input, options = {}) {
    const source = normaliseInput(input)
    const addAllPromise = all(source, options)
    const result = await last(addAllPromise)

    if (result == null) {
      throw new Error('Invalid body')
    }

    return result
  }
}
