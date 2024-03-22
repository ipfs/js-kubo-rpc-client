export async function throwsAsync (fnOrPromise: Promise<unknown> | (() => Promise<unknown>)) {
  try {
    // @ts-expect-error
    await (fnOrPromise.then != null ? fnOrPromise : fnOrPromise())
  } catch (err: any) {
    return err
  }
  throw new Error('did not throw')
}
