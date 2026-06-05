import { createId } from './id.ts'
import type { KuboRPCClient } from './index.ts'
import type { HTTPRPCClient } from './lib/core.ts'

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
