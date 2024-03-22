import delay from 'delay'
import errCode from 'err-code'

/**
 * Wait for async function `test` to resolve true or timeout after options.timeout milliseconds.
 */
export default async function waitFor (test: (() => Promise<boolean> | boolean), options?: { timeout?: number, interval?: number, name?: string }) {
  const opts = Object.assign({ timeout: 5000, interval: 0, name: 'event' }, options)
  const start = Date.now()

  while (true) {
    if (await test()) {
      return
    }

    if (Date.now() > start + opts.timeout) {
      throw errCode(new Error(`Timed out waiting for ${opts.name}`), 'ERR_TIMEOUT')
    }

    await delay(opts.interval)
  }
}
