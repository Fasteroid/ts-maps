export type Primitive = number | bigint | symbol | string | null | undefined | boolean

export function isWeakKey(value: any): value is WeakKey {
    const type = typeof value;
    return type === 'symbol' || type === 'object' || type === 'function'
}