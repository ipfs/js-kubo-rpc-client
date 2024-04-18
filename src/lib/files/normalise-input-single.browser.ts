import { normaliseCandidateSingle } from './normalise-candidate-single.js'
import { normaliseContent } from './normalise-content.browser.js'
import type { BrowserImportCandidate } from './normalise-input-multiple.browser.js'
import type { ImportCandidate } from '../../index.js'

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
