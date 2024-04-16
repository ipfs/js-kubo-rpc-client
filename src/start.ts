import { configure } from './lib/configure.js'
import errCode from 'err-code'

export const createStart = configure(api => {
  /**
   * @type {import('./types').RootAPI["start"]}
   */
  const start = async (options = {}) => {
    throw errCode(new Error('Not implemented'), 'ERR_NOT_IMPLEMENTED')
  }

  return start
})
