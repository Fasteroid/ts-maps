import { isWeakKey } from "./internals/internals";

/**
 * Like a normal {@link WeakMap}, but you can store primitives on it.
 */
export class SemiWeakMap<K, V> extends WeakMap<any, V> {

    private _primitives = new Map<K, V>();

    public override get(key: K): V | undefined {
        return !isWeakKey(key) ? this._primitives.get(key) : super.get(key);
    }

    public override set(key: K, value: V): this {
        !isWeakKey(key) ? this._primitives.set(key, value) : super.set(key, value);
        return this;
    }

    public override has(key: K): boolean {
        return !isWeakKey(key) ? this._primitives.has(key) : super.has(key);
    }

    public override delete(key: K): boolean {
        return !isWeakKey(key) ? this._primitives.delete(key) : super.delete(key);
    }

    /** An iterable of the primitives in this {@linkcode SemiWeakMap} */
    public primitives() {
        return this._primitives.entries();
    }

}