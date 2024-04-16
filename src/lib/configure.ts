/* eslint-env browser */
import { Client } from './core.js'

/**
 * Set default configuration and call create function with them
 *
 * @template T
 * @param {import('../types').ConfigureFn<T>} fn
 * @returns {import('../types').ConfigureFactory<T>}
 */
export const configure = (fn) => {
  return (options) => {
    return fn(new Client(options), options)
  }
}
