import { configure } from '../lib/configure.js'
import errCode from 'err-code'

export const createInfo = configure(api => {
  /**
   * @type {import('../types').KeyAPI["info"]}
   */
  const info = async (name, options = {}) => {
    throw errCode(new Error('Not implemented'), 'ERR_NOT_IMPLEMENTED')
  }

  return info
})
