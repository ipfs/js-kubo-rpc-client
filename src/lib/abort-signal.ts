import { anySignal } from 'any-signal'

function filter (signals: any[]): AbortSignal[] {
  return signals.filter(Boolean)
}

export function abortSignal (...signals: Array<AbortSignal | undefined>): AbortSignal {
  return anySignal(filter(signals))
}
