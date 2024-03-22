import type { Factory } from 'ipfsd-ctl'

export interface Skip {
  name: string
  reason: string
}

const isSkip = (o: any): o is Skip => Object.prototype.toString.call(o) === '[object Object]' && (o.name ?? o.reason)

export function createSuite (tests: any, parent?: any) {
  const suite = (factory: Factory, options: { skip?: boolean|Skip|Array<string|Skip>, only?: boolean } = {}) => {
    Object.keys(tests).forEach(t => {
      const opts = Object.assign({}, options)
      // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
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
