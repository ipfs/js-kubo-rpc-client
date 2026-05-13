import { normaliseCandidateSingle } from './normalise-candidate-single.ts'
import { normaliseContent } from './normalise-content.browser.ts'
import type { BrowserImportCandidate } from './normalise-input-multiple.browser.ts'
import type { ImportCandidate } from '../../index.ts'

/**
 * Transforms any of the `ipfs.add` input types into
 *
 * ```
 * AsyncIterable<{ path, mode, mtime, content: Blob }>
 * ```
 *
 * See https://github.com/ipfs/js-ipfs/blob/master/docs/core-api/FILES.md#ipfsadddata-options
 */
export function normaliseInput (input: ImportCandidate): BrowserImportCandidate {
  // @ts-expect-error browser normaliseContent returns a Blob not an AsyncIterable<Uint8Array>
  return normaliseCandidateSingle(input, normaliseContent)
}
