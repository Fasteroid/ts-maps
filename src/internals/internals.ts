export type Primitive = number | bigint | symbol | string | null | undefined | boolean

export function isWeakKey(value: any): value is WeakKey {
    const type = typeof value;
    return (type === 'symbol' || type === 'object' || type === 'function') && value !== null; // apparently null is a "primitive" of type "object" ????
}

export type IsDefined<T> = undefined extends T ? never : any;