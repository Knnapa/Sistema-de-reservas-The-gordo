import { vi } from 'vitest'

/**
 * Crea un query-builder mock que es PromiseLike y tiene todos los métodos
 * encadenables de Supabase. Pasar el resultado esperado { data, error }.
 *
 * - await chain            → resuelve con result  (para cadenas que no terminan en .single())
 * - await chain.single()   → resuelve con result
 * - await chain.maybeSingle() → resuelve con result
 * - await chain.order(...)  → resuelve con result
 */
export function makeChain(result) {
  const resolved = Promise.resolve(result)
  const chain = {
    select: vi.fn(() => chain),
    eq: vi.fn(() => chain),
    order: vi.fn(() => Promise.resolve(result)),
    insert: vi.fn(() => chain),
    update: vi.fn(() => chain),
    delete: vi.fn(() => chain),
    single: vi.fn(() => Promise.resolve(result)),
    maybeSingle: vi.fn(() => Promise.resolve(result)),
    // PromiseLike para cadenas sin método terminal explícito
    then: (onFulfilled, onRejected) => resolved.then(onFulfilled, onRejected),
    catch: (onRejected) => resolved.catch(onRejected),
    finally: (onFinally) => resolved.finally(onFinally),
  }
  return chain
}
