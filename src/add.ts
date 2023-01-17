import last from 'it-last'
import { normaliseInput } from 'ipfs-core-utils/files/normalise-input-single'
import { createAddAll } from './add-all.js'
import type { Client } from './lib/core.js'
import type { AddOptions, AddResult } from './root.js'
import type { ImportCandidate } from './index.js'

export function createAdd (client: Client) {
  const all = createAddAll(client)
  async function add (input: ImportCandidate, options?: AddOptions): Promise<AddResult> {
    const source = normaliseInput(input)
    // @ts-expect-error - all may return undefined if source is empty
    const addAllPromise = all(source, options)
    // @ts-expect-error - last may return undefined if source is empty
    return await last(addAllPromise)
  }
  return add
}
