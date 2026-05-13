import { normaliseCandidateSingle } from './normalise-candidate-single.ts'
import { normaliseContent } from './normalise-content.ts'
import type { ImportCandidate } from '../../index.ts'

/**
 * Transforms any of the `ipfs.add` input types into
 *
 * ```
 * AsyncIterable<{ path, mode, mtime, content: AsyncIterable<Uint8Array> }>
 * ```
 *
 * See https://github.com/ipfs/js-ipfs/blob/master/docs/core-api/FILES.md#ipfsadddata-options
 */
export function normaliseInput (input: ImportCandidate): AsyncGenerator<ImportCandidate> {
  return normaliseCandidateSingle(input, normaliseContent)
}
