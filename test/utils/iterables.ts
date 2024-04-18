export function iterableOf <T> (thing: T): T[] {
  return [thing]
}

export function asyncIterableOf <T> (thing: T): AsyncIterable<T> {
  return (async function * () { // eslint-disable-line require-await
    yield thing
  }())
}

export function browserReadableStreamOf <T> (thing: T): ReadableStream<T> {
  return new ReadableStream({
    start (controller) {
      controller.enqueue(thing)
      controller.close()
    }
  })
}
