import drain from 'it-drain'

export default async function testTimeout (fn: any): Promise<void> {
  return await new Promise((resolve, reject) => {
    // some operations are either synchronous so cannot time out, or complete during
    // processing of the microtask queue so the timeout timer doesn't fire.  If this
    // is the case this is more of a best-effort test..
    setTimeout(() => {
      const start = Date.now()
      let res = fn()

      if (res[Symbol.asyncIterator] != null) {
        res = drain(res)
      }

      res.then((result: any) => {
        const timeTaken = Date.now() - start

        if (timeTaken < 100) {
          // the implementation may be too fast to measure a time out reliably on node
          // due to the event loop being blocked.  if it took longer than 100ms though,
          // it almost certainly did not time out
          return resolve()
        }

        reject(new Error(`API call did not time out after ${timeTaken}ms, got ${JSON.stringify(result, null, 2)}`))
      }, (err: Error) => {
        if (err.name === 'TimeoutError') {
          return resolve()
        }

        const timeTaken = Date.now() - start

        // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
        reject(new Error(`Expected TimeoutError after ${timeTaken}ms, got ${err.stack}`))
      })
    }, 10)
  })
}
