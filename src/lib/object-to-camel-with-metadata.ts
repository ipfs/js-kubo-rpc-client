import { objectToCamel } from './object-to-camel.js'

export function objectToCamelWithMetadata (entry: Record<string, any>): Record<string, any> {
  const file = objectToCamel<any>(entry)

  if (Object.prototype.hasOwnProperty.call(file, 'mode')) {
    file.mode = parseInt(file.mode, 8)
  }

  if (Object.prototype.hasOwnProperty.call(file, 'mtime')) {
    file.mtime = {
      secs: file.mtime,
      nsecs: file.mtimeNsecs ?? 0
    }

    delete file.mtimeNsecs
  }

  return file
}
