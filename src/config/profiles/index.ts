import { createApply } from './apply.js'

/**
 * @param {import('../../types').Options} config
 */
export function createProfiles (config) {
  return {
    apply: createApply(config)
  }
}
