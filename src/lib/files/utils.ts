import { InvalidMtimeError } from '../errors.js'
import type { ImportCandidate } from '../../index.js'
import type { Mtime, MtimeLike } from 'ipfs-unixfs'

export function isBytes (obj: any): obj is ArrayBufferView | ArrayBuffer {
  return ArrayBuffer.isView(obj) || obj instanceof ArrayBuffer
}

export function isBlob (obj: any): obj is Blob {
  return obj.constructor != null &&
    (obj.constructor.name === 'Blob' || obj.constructor.name === 'File') &&
    typeof obj.stream === 'function'
}

/**
 * An object with a path or content property
 */
export function isFileObject (obj: any): obj is ImportCandidate {
  return typeof obj === 'object' && (obj.path != null || obj.content != null)
}

export function isReadableStream (value: any): value is ReadableStream {
  return typeof value?.getReader === 'function'
}

export function parseMode (mode?: string | number | undefined): number | undefined {
  if (mode == null) {
    return undefined
  }

  if (typeof mode === 'string') {
    mode = parseInt(mode, 8)
  }

  return mode & 0xFFF
}

function isMtime (obj: any): obj is Mtime {
  return Object.prototype.hasOwnProperty.call(obj, 'secs')
}

function isTimeSpec (obj: any): obj is { Seconds: number, FractionalNanoseconds?: number } {
  return Object.prototype.hasOwnProperty.call(obj, 'Seconds')
}

function isHrtime (obj: any): obj is [number, number] {
  return Array.isArray(obj)
}

export function parseMtime (mtime?: MtimeLike): Mtime | undefined {
  if (mtime == null) {
    return undefined
  }

  // { secs, nsecs }
  if (isMtime(mtime)) {
    mtime = {
      secs: mtime.secs,
      nsecs: mtime.nsecs
    }
  }

  // UnixFS TimeSpec
  if (isTimeSpec(mtime)) {
    mtime = {
      secs: BigInt(mtime.Seconds),
      nsecs: mtime.FractionalNanoseconds
    }
  }

  // process.hrtime()
  if (isHrtime(mtime)) {
    mtime = {
      secs: BigInt(mtime[0]),
      nsecs: mtime[1]
    }
  }

  // Javascript Date
  if (mtime instanceof Date) {
    const ms = mtime.getTime()
    const secs = Math.floor(ms / 1000)

    mtime = {
      secs: BigInt(secs),
      nsecs: (ms - (secs * 1000)) * 1000
    }
  }

  // process.hrtime.bigint()
  if (typeof mtime === 'bigint') {
    const secs = mtime / BigInt(1e9)
    const nsecs = mtime - (secs * BigInt(1e9))

    mtime = {
      secs,
      nsecs: Number(nsecs)
    }
  }

  if (!Object.prototype.hasOwnProperty.call(mtime, 'secs')) {
    return undefined
  }

  if (mtime.nsecs != null && (mtime.nsecs < 0 || mtime.nsecs > 999999999)) {
    throw new InvalidMtimeError('mtime-nsecs must be within the range [0,999999999]')
  }

  return mtime
}
