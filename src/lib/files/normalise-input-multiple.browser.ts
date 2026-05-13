import { normaliseCandidateMultiple } from './normalise-candidate-multiple.ts'
import { normaliseContent } from './normalise-content.browser.ts'
import type { ImportCandidateStream } from '../../index.ts'
import type { Mtime } from 'ipfs-unixfs'

export interface BrowserImportCandidate {
  path?: string
  content?: Blob
  mtime?: Mtime
  mode?: number
}

/**
 * Transforms any of the `ipfs.addAll` input types into
 *
 * ```
 * AsyncIterable<{ path, mode, mtime, content: Blob }>
 * ```
 *
 * See https://github.com/ipfs/js-ipfs/blob/master/docs/core-api/FILES.md#ipfsadddata-options
 */
export function normaliseInput (input: ImportCandidateStream): AsyncGenerator<BrowserImportCandidate, void, undefined> {
  // @ts-expect-error browser normaliseContent returns a Blob not an AsyncIterable<Uint8Array>
  return normaliseCandidateMultiple(input, normaliseContent, true)
}
