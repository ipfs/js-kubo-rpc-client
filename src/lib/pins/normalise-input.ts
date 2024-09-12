import { InvalidParametersError } from '@libp2p/interface'
import { CID } from 'multiformats/cid'

export interface Pinnable {
  path?: string
  cid?: CID
  recursive?: boolean
  metadata?: any
}

export type ToPin = CID | string | Pinnable
export type Source = ToPin | Iterable<ToPin> | AsyncIterable<ToPin>

export interface Pin {
  path: string | CID
  recursive: boolean
  metadata?: any
}

function isIterable (thing: any): thing is IterableIterator<any> & Iterator<any> {
  return Symbol.iterator in thing
}

function isAsyncIterable (thing: any): thing is AsyncIterableIterator<any> & AsyncIterator<any> {
  return Symbol.asyncIterator in thing
}

function isCID (thing: any): thing is CID {
  return CID.asCID(thing) != null
}

/**
 * Transform one of:
 *
 * ```ts
 * CID
 * String
 * { cid: CID recursive, metadata }
 * { path: String recursive, metadata }
 * Iterable<CID>
 * Iterable<String>
 * Iterable<{ cid: CID recursive, metadata }>
 * Iterable<{ path: String recursive, metadata }>
 * AsyncIterable<CID>
 * AsyncIterable<String>
 * AsyncIterable<{ cid: CID recursive, metadata }>
 * AsyncIterable<{ path: String recursive, metadata }>
 * ```
 * Into:
 *
 * ```ts
 * AsyncIterable<{ path: CID|String, recursive:boolean, metadata }>
 * ```
 */
// eslint-disable-next-line complexity
export async function * normaliseInput (input: Source): AsyncGenerator<Pin> {
  // must give us something
  if (input === null || input === undefined) {
    throw new InvalidParametersError(`Unexpected input: ${input}`)
  }

  // CID
  const cid = CID.asCID(input)

  if (cid != null) {
    yield toPin({ cid })
    return
  }

  if (typeof input === 'string') {
    yield toPin({ path: input })
    return
  }

  // { cid: CID recursive, metadata }
  // @ts-expect-error - it still could be iterable or async iterable
  if (input.cid != null || input.path != null) {
    // @ts-expect-error cannot derive type
    return yield toPin(input)
  }

  // Iterable<?>
  if (isIterable(input)) {
    const iterator = input[Symbol.iterator]()
    const first = iterator.next()

    if (first.done === true) {
      return iterator
    }

    // Iterable<CID>
    if (isCID(first.value)) {
      yield toPin({ cid: first.value })
      for (const cid of iterator) {
        yield toPin({ cid })
      }
      return
    }

    // Iterable<String>
    if (typeof first.value === 'string') {
      yield toPin({ path: first.value })
      for (const path of iterator) {
        yield toPin({ path })
      }
      return
    }

    // Iterable<Pinnable>
    if (first.value.cid != null || first.value.path != null) {
      yield toPin(first.value)
      for (const obj of iterator) {
        yield toPin(obj)
      }
      return
    }

    throw new InvalidParametersError(`Unexpected input: ${typeof input}`)
  }

  // AsyncIterable<?>
  if (isAsyncIterable(input)) {
    const iterator = input[Symbol.asyncIterator]()
    const first = await iterator.next()
    if (first.done === true) return iterator

    // AsyncIterable<CID>
    if (isCID(first.value)) {
      yield toPin({ cid: first.value })
      for await (const cid of iterator) {
        yield toPin({ cid })
      }
      return
    }

    // AsyncIterable<String>
    if (typeof first.value === 'string') {
      yield toPin({ path: first.value })
      for await (const path of iterator) {
        yield toPin({ path })
      }
      return
    }

    // AsyncIterable<{ cid: CID|String recursive, metadata }>
    if (first.value.cid != null || first.value.path != null) {
      yield toPin(first.value)
      for await (const obj of iterator) {
        yield toPin(obj)
      }
      return
    }

    throw new InvalidParametersError(`Unexpected input: ${typeof input}`)
  }

  throw new InvalidParametersError(`Unexpected input: ${typeof input}`)
}

function toPin (input: Pinnable): Pin {
  const path = input.cid ?? `${input.path}`

  if (path == null) {
    throw new InvalidParametersError('Unexpected input: Please path either a CID or an IPFS path')
  }

  const pin: Pin = {
    path,
    recursive: input.recursive !== false
  }

  if (input.metadata != null) {
    pin.metadata = input.metadata
  }

  return pin
}
