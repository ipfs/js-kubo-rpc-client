import { parseMtime } from '../lib/files/utils.js'
import { modeToString } from './mode-to-string.js'

export function toUrlSearchParams ({ arg, searchParams, hashAlg, mtime, mode, ...options }: any = {}): URLSearchParams {
  if (searchParams != null) {
    options = {
      ...options,
      ...searchParams
    }
  }

  if (hashAlg != null) {
    options.hash = hashAlg
  }

  if (mtime != null) {
    mtime = parseMtime(mtime)

    options.mtime = mtime.secs
    options.mtimeNsecs = mtime.nsecs
  }

  if (mode != null) {
    options.mode = modeToString(mode)
  }

  if (!isNaN(options.timeout)) {
    // server API expects timeouts as strings
    options.timeout = `${options.timeout}ms`
  }

  if (arg === undefined || arg === null) {
    arg = []
  } else if (!Array.isArray(arg)) {
    arg = [arg]
  }

  const urlSearchParams = new URLSearchParams(options)

  arg.forEach((arg: any) => {
    urlSearchParams.append('arg', arg)
  })

  return urlSearchParams
}
