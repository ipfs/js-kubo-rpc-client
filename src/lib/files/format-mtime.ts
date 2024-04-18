import type { Mtime } from 'ipfs-unixfs'

export function formatMtime (mtime?: Mtime): string {
  if (mtime == null) {
    return '-'
  }

  const date = new Date(Number(mtime.secs * 1000n) + Math.round((mtime.nsecs ?? 0) / 1000))

  return date.toLocaleDateString(Intl.DateTimeFormat().resolvedOptions().locale, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    timeZoneName: 'short'
  })
}
