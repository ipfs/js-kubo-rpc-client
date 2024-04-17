import { anySignal } from 'any-signal'
import { CID } from 'multiformats/cid'
import { multipartRequest } from './lib/multipart-request.js'
import { objectToCamel } from './lib/object-to-camel.js'
import { toUrlSearchParams } from './lib/to-url-search-params.js'
import type { AddProgressFn, AddResult, KuboRPCClient, UploadProgressFn } from './index.js'
import type { HTTPRPCClient } from './lib/core.js'

export function createAddAll (client: HTTPRPCClient): KuboRPCClient['addAll'] {
  return async function * addAll (source, options = {}) {
    // allow aborting requests on body errors
    const controller = new AbortController()
    const signal = anySignal([controller.signal, options.signal])

    try {
      const { headers, body, total, parts } =
        await multipartRequest(source, controller, options.headers)

      // In browser response body only starts streaming once upload is
      // complete, at which point all the progress updates are invalid. If
      // length of the content is computable we can interpret progress from
      // `{ total, loaded}` passed to `onUploadProgress` and `multipart.total`
      // in which case we disable progress updates to be written out.
      const [progressFn, onUploadProgress] = typeof options.progress === 'function'
        ? createProgressHandler(total, options.progress, parts)
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
    } finally {
      signal.clear()
    }
  }
}

/**
 * Returns simple progress callback when content length isn't computable or a
 * progress event handler that calculates progress from upload progress events.
 */
const createProgressHandler = (total: number, progress: AddProgressFn, parts?: Array<{ name?: string, start: number, end: number }>): [AddProgressFn, undefined] | [undefined, UploadProgressFn] =>
  parts != null ? [undefined, createOnUploadProgress(total, parts, progress)] : [progress, undefined]

/**
 * Creates a progress handler that interpolates progress from upload progress
 * events and total size of the content that is added.
 */
const createOnUploadProgress = (size: number, parts: Array<{ name?: string, start: number, end: number }>, progress: AddProgressFn): UploadProgressFn => {
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

function toCoreInterface ({ name, hash, size, mode, mtime, mtimeNsecs }: any): AddResult {
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
