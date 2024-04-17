export function notImplemented (): any {
  return () => {
    throw new Error('Not implememnted')
  }
}
