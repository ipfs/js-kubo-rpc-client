import { TimeoutError } from '@libp2p/interface'
import delay from 'delay'

export interface Test {
  (): Promise<boolean> | boolean
}

export interface Options {
  timeout?: number
  interval?: number
  name?: string
}

/**
 * Wait for async function `test` to resolve true or timeout after
 * options.timeout milliseconds.
 */
export default async function waitFor (test: Test, options?: Options): Promise<void> {
  const opts = Object.assign({ timeout: 5000, interval: 0, name: 'event' }, options)
  const start = Date.now()

  while (true) {
    if (await test()) {
      return
    }

    if (Date.now() > start + opts.timeout) {
      throw new TimeoutError(`Timed out waiting for ${opts.name}`)
    }

    await delay(opts.interval)
  }
}
