import { isWeakKey } from "./internals";

/** A wrapper around {@linkcode WeakRef} which allows it to hold non-weak values too */
export class SemiWeakRef<T> {
    private primitive?: T
    // @ts-ignore(2344); it's fine
    private object?:    WeakRef<T>

    constructor(value: T) {
        if( isWeakKey(value) ) {
            this.object    = new WeakRef(value);
        }
        else {
            this.primitive = value;
        }
    }

    public deref(): T | undefined {
        return this.object ? this.object.deref() : this.primitive;
    }

    /** 
     * Does the held value exist in memory? 
     * (always true for primitive) 
    */
    public exists(): boolean {
        return !this.object || this.object.deref() !== undefined;
    }
}