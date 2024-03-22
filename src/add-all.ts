import { CID } from 'multiformats/cid'
import { objectToCamel } from './lib/object-to-camel.js'
import { multipartRequest } from 'ipfs-core-utils/multipart-request'
import { toUrlSearchParams } from './lib/to-url-search-params.js'
import { abortSignal } from './lib/abort-signal.js'
import type { AddAllOptions, AddProgressFn, AddResult } from './root.js'
import type { Client } from './lib/core.js'
import type { ImportCandidateStream, IPFSUtilsHttpUploadProgressFn } from './index.js'

export function createAddAll (client: Client) {
  async function * addAll (source: ImportCandidateStream, options?: AddAllOptions): AsyncIterable<AddResult> {
    // allow aborting requests on body errors
    const controller = new AbortController()
    const signal = abortSignal(controller.signal, options?.signal)
    const { headers, body, total, parts } =
      await multipartRequest(source, controller, options?.headers)

    // In browser response body only starts streaming once upload is
    // complete, at which point all the progress updates are invalid. If
    // length of the content is computable we can interpret progress from
    // `{ total, loaded}` passed to `onUploadProgress` and `multipart.total`
    // in which case we disable progress updates to be written out.
    const [progressFn, onUploadProgress] = typeof options?.progress === 'function'
      ? createProgressHandler(total, parts, options.progress)
      : [undefined, undefined]

    const res = await client.post('add', {
      searchParams: toUrlSearchParams({
        'stream-channels': true,
        ...options,
        progress: Boolean(progressFn)
      }),
      onUploadProgress,
      signal,
      headers,
      body
    })

    for await (let file of res.ndjson()) {
      file = objectToCamel(file)

      if (file.hash !== undefined) {
        yield toCoreInterface(file)
      } else if (progressFn != null) {
        progressFn(file.bytes ?? 0, file.name)
      }
    }
  }
  return addAll
}

interface ProgressPart {
  name: string
  start: number
  end: number
}

/**
 * Returns simple progress callback when content length isn't computable or a
 * progress event handler that calculates progress from upload progress events.
 */
const createProgressHandler = (total: number, parts: ProgressPart[]|null, progress: AddProgressFn): [AddProgressFn|undefined, IPFSUtilsHttpUploadProgressFn|undefined] =>
  parts != null ? [undefined, createOnUploadProgress(total, parts, progress)] : [progress, undefined]

/**
 * Creates a progress handler that interpolates progress from upload progress
 * events and total size of the content that is added.
 */
const createOnUploadProgress = (size: number, parts: ProgressPart[], progress: AddProgressFn): IPFSUtilsHttpUploadProgressFn => {
  let index = 0
  const count = parts.length
  return ({ loaded, total }) => {
    // Derive position from the current progress.
    const position = Math.floor(loaded / total * size)
    while (index < count) {
      const { start, end, name } = parts[index]
      // If within current part range report progress and break the loop
      if (position < end) {
        progress(position - start, name)
        break
      // If passed current part range report final byte for the chunk and
      // move to next one.
      } else {
        progress(end - start, name)
        index += 1
      }
    }
  }
}

function toCoreInterface ({ name, hash, size, mode, mtime, mtimeNsecs }: any) {
  const output: AddResult = {
    path: name,
    cid: CID.parse(hash),
    size: parseInt(size)
  }

  if (mode != null) {
    output.mode = parseInt(mode, 8)
  }

  if (mtime != null) {
    output.mtime = {
      secs: mtime,
      nsecs: mtimeNsecs ?? 0
    }
  }

  return output
}
