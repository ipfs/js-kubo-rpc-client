/* eslint-env mocha */

export interface Skip {
  name: string
  reason: string
}

const isSkip = (o: any): o is Skip => Object.prototype.toString.call(o) === '[object Object]' && (o.name ?? o.reason)

/**
 * Get a "describe" function that is optionally 'skipped' or 'onlyed'
 * If skip/only are boolean true, or an object with a reason property, then we
 * want to skip/only the whole suite
 */
export function getDescribe (config: { skip?: boolean|Skip|Array<string|Skip>, only?: boolean }) {
  if (config != null) {
    if (config.skip === true) {
      return describe.skip
    }

    if (config.only === true) {
      return describe.only // eslint-disable-line
    }

    if (Array.isArray(config.skip)) {
      const skipArr = config.skip

      const _describe = (name: string, impl: any) => {
        const skip = skipArr.find(skip => {
          if (typeof skip === 'string') {
            return skip === name
          }

          return skip.name === name
        })

        if (skip != null) {
          return describe.skip(`${name} (${typeof skip === 'string' ? '🤷' : skip.reason})`, impl)
        }

        describe(name, impl)
      }

      _describe.skip = describe.skip
      _describe.only = describe.only // eslint-disable-line

      return _describe
    } else if (isSkip(config.skip)) {
      const skip = config.skip

      if (skip.reason == null) {
        return describe.skip
      }

      const _describe = (name: string, impl: any) => {
        describe.skip(`${name} (${skip.reason})`, impl)
      }

      _describe.skip = describe.skip
      _describe.only = describe.only // eslint-disable-line

      return _describe
    }
  }

  return describe
}

/**
 * Get an "it" function that is optionally 'skipped' or 'onlyed'
 * If skip/only is an array, then we _might_ want to skip/only the specific
 * test if one of the items in the array is the same as the test name or if one
 * of the items in the array is an object with a name property that is the same
 * as the test name.
 */
export function getIt (config: { skip?: boolean|Skip|Array<string|Skip>, only?: boolean }) {
  if (config == null) return it

  const _it = (name: string, impl: any) => {
    if (Array.isArray(config.skip)) {
      const skip = config.skip
        .map((s) => isSkip(s) ? s : { name: s, reason: '🤷' })
        .find((s) => s.name === name)

      if (skip != null) {
        if (skip.reason != null) name = `${name} (${skip.reason})`
        return it.skip(name, impl)
      }
    }

    if (Array.isArray(config.only)) {
      const only = config.only
        .map((o) => isSkip(o) ? o : { name: o, reason: '🤷' })
        .find((o) => o.name === name)

      if (only != null) {
        if (only.reason != null) name = `${name} (${only.reason})`
        return it.only(name, impl) // eslint-disable-line no-only-tests/no-only-tests
      }
    }

    it(name, impl)
  }

  _it.skip = it.skip
  _it.only = it.only // eslint-disable-line no-only-tests/no-only-tests

  return _it
}
