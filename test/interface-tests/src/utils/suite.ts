import { isSkip, type Skip } from './mocha.js'
import type { Factory, KuboNode } from 'ipfsd-ctl'

export interface CreateSuiteOptions {
  skip?: boolean | Skip | string[] | Skip[]
  only?: boolean | string | string[]
}

export function createSuite (tests: any, parent?: any): any {
  const suite = (factory: Factory<KuboNode>, options = {}): void => {
    Object.keys(tests).forEach(t => {
      const opts: CreateSuiteOptions = Object.assign({}, options)
      const suiteName = parent != null ? `${parent}.${t}` : t

      if (Array.isArray(opts.skip)) {
        const skip = opts.skip
          .map((s) => isSkip(s) ? s : { name: s, reason: '🤷' })
          .find((s) => s.name === suiteName)

        if (skip != null) {
          opts.skip = skip
        }
      }

      if (Array.isArray(opts.only)) {
        if (opts.only.includes(suiteName)) {
          opts.only = true
        }
      }

      tests[t](factory, opts)
    })
  }

  return Object.assign(suite, tests)
}
