import { createId } from './id.js'
import type { KuboRPCClient } from './index.js'
import type { HTTPRPCClient } from './lib/core.js'

export function createIsOnline (client: HTTPRPCClient): KuboRPCClient['isOnline'] {
  const id = createId(client)

  return async function isOnline (options = {}) {
    try {
      const res = await id(options)

      return Boolean(res?.addresses?.length)
    } catch {
      return false
    }
  }
}
