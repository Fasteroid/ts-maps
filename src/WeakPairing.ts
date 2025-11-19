import { isWeakKey } from "./internals/internals";
import { SemiWeakRef } from "./internals/SemiWeakRef";
import { SemiWeakMap } from "./SemiWeakMap";

/**
 * Like a {@link WeakMap}, but the values are also weakly held.  
 * Useful as a weak bidirectional lookup table.
 * 
 * If either the key or value go out of scope and don't exist elsewhere  
 * in memory, the pair in this map will (eventually) cease to exist.
 */
export class WeakPairing<K, V> {

    protected toValue: SemiWeakMap<K, SemiWeakRef<V>> = new SemiWeakMap();
    protected toKey:   SemiWeakMap<V, SemiWeakRef<K>> = new SemiWeakMap();

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
     * Gets the value associated with key *{@linkcode k}* (or undefined if there isn't one)
     */
    public getValue(k: K) {
        return this.toValue.get(k)?.deref()
    }

    /**
     * Gets the key associated with value *{@linkcode v}* (or undefined if there isn't one)
     */
    public getKey(v: V) {
        return this.toKey.get(v)?.deref()
    }

    /**
     * Does key *{@linkcode k}* map to a real value?
     * @returns 
     */
    public hasKey(k: K) {
        return Boolean( this.toValue.get(k)?.exists() )
    }

    /**
     * Does value *{@linkcode v}* exist in this map?
     * @returns 
     */
    public hasValue(v: V) {
        return Boolean( this.toKey.get(v)?.exists() );
    }

    /**
     * Tries to delete the key-value pair with key *{@linkcode k}*.  
     * @returns whether or not it existed
     */
    public deleteKey(k: K) {
        if( !this.hasKey(k) ) return false;
        this.toValue.delete(k);
        this.toKey.delete( this.getValue(k)! );
        return true;
    }

    /**
     * Tries to delete the key-value pair with value *{@linkcode v}*.  
     * @returns whether or not it existed
     */
    public deleteValue(v: V) { 
        if( !this.hasValue(v) ) return false;
        this.toKey.delete(v);
        this.toValue.delete( this.getKey(v)! );
        return true;
    }

}