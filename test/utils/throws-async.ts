function isPromise <T> (obj: any): obj is Promise<T> {
  return obj.then != null
}

export async function throwsAsync <E extends Error> (fnOrPromise: Promise<unknown> | (() => Promise<unknown>)): Promise<E> {
  try {
    await (isPromise(fnOrPromise) ? fnOrPromise : fnOrPromise())
  } catch (err: any) {
    return err
  }
  throw new Error('did not throw')
}
