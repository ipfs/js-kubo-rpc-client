export function modeToString (mode: number | string | undefined): string | undefined {
  if (mode == null) {
    return undefined
  }

  if (typeof mode === 'string') {
    return mode
  }

  return mode.toString(8).padStart(4, '0')
}