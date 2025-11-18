import { isPrimitive, isWeakKey } from "./internals/internals";
import { SemiWeakMap } from "./SemiWeakMap";



type WeakRefLike<T> = {
    deref(): T | undefined
}

/** A wrapper around {@linkcode WeakRef} which allows it to hold non-weak values too */
class SemiWeakRef<T> {
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

class TrackableSemiWeakMap<K, V> extends SemiWeakMap<K, V> {

}


/**
 * Like a {@link WeakMap}, but the values are also weakly held.  
 * Useful as a weak bidirectional lookup table.
 * 
 * If either the key or value go out of scope and don't exist elsewhere  
 * in memory, the pair in this map will (eventually) cease to exist.
 */
export class WeakPairingMap<K, V> {

    protected toValue: SemiWeakMap<K, SemiWeakRef<V>> = new SemiWeakMap();
    protected toKey:   SemiWeakMap<V, SemiWeakRef<K>> = new SemiWeakMap();

    // private possiblyActiveKeys: SemiWeakRef<K>[] = [];
    // private possiblyActiveValues: SemiWeakRef<V>[] = []; 

    // private garbageCollectTimeout: NodeJS.Timeout | number = -1;

    // private garbageCollector = new FinalizationRegistry<boolean>((valueWasKilled) => {
    //     if( valueWasKilled ) { // there is now a toKey pointing to nothing we must delete
    //         for( let valueRef of this.possiblyActiveValues ){
    //             if( !valueRef.exists() ) {

    //             }
    //         }
    //     }
    // })


    /**
     * Sets a key-value pair.  
     */
    public set(k: K, v: V) {
        const weakRefK = new SemiWeakRef(k);
        const weakRefV = new SemiWeakRef(v);

        this.toKey.set(v, weakRefK);
        this.toValue.set(k, weakRefV);
    }

    /**
     * Gets the value associated with key *{@link k}* (or undefined if there isn't one)
     */
    public getValue(k: K) {
        return this.toValue.get(k)?.deref()
    }

    /**
     * Gets the key associated with value *{@link v}* (or undefined if there isn't one)
     */
    public getKey(v: V) {
        return this.toKey.get(v)?.deref()
    }

    /**
     * Does key *{@link k}* map to a real value?
     * @returns 
     */
    public hasKey(k: K) {
        return Boolean( this.toValue.get(k)?.exists() )
    }

    /**
     * Does value *{@link v}* exist in this map?
     * @returns 
     */
    public hasValue(v: V) {
        return Boolean( this.toKey.get(v)?.exists() );
    }

    /**
     * Tries to delete the key-value pair with key *{@link k}*.  
     * @returns whether or not it existed
     */
    public deleteKey(k: K) {
        if( !this.hasKey(k) ) return false;
        this.toValue.delete(k);
        this.toKey.delete( this.getValue(k)! );
        return true;
    }

    /**
     * Tries to delete the key-value pair with value *{@link v}*.  
     * @returns whether or not it existed
     */
    public deleteValue(v: V) { 
        if( !this.hasValue(v) ) return false;
        this.toKey.delete(v);
        this.toValue.delete( this.getKey(v)! );
        return true;
    }

}

function forceGC() {
    // @ts-ignore
    if( globalThis.gc ) {
        // @ts-ignore
        globalThis.gc();
    }
}

