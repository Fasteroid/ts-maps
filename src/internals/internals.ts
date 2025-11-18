export type Primitive = number | bigint | symbol | string | null | undefined | boolean

export function isPrimitive(val: any): val is Primitive {
    return val !== null && typeof val !== "object" && typeof val !== "function"
}

export function isWeakKey(value: any): value is WeakKey {
    return typeof value === 'symbol' || !isPrimitive(value);
}