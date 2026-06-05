import { normaliseCandidateMultiple } from './normalise-candidate-multiple.ts'
import { normaliseContent } from './normalise-content.ts'
import type { ImportCandidate, ImportCandidateStream } from '../../index.ts'

/**
 * Transforms any of the `ipfs.addAll` input types into
 *
 * ```
 * AsyncIterable<{ path, mode, mtime, content: AsyncIterable<Uint8Array> }>
 * ```
 *
 * See https://github.com/ipfs/js-ipfs/blob/master/docs/core-api/FILES.md#ipfsadddata-options
 */
export function normaliseInput (input: ImportCandidateStream): AsyncGenerator<ImportCandidate, void, undefined> {
  return normaliseCandidateMultiple(input, normaliseContent)
}
