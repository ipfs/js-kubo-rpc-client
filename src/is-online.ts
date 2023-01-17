import { createId } from './id.js'
import type { Client } from './lib/core.js'

export function createIsOnline (client: Client) {
  const id = createId(client)

  async function isOnline (): Promise<boolean> {
    const res = await id()
    return Boolean(res?.addresses?.length)
  }
  return isOnline
}
