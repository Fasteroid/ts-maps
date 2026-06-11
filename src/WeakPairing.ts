import { SemiWeakRef } from './internals/SemiWeakRef';
import { SemiWeakMap } from './SemiWeakMap';



function nextMacro(resolve: (_: any) => any) {
    setTimeout(resolve, 10);
}

type IsDefined<T> = undefined extends T ? never : any

/**
 * Like a {@link SemiWeakMap}, but the values are also weakly held.  
 * Useful as a weak bidirectional lookup table.
 * 
 * Values referenced by a pair can be garbage-collected as long as 
 * at least one of them is garbage-collectable.
 * 
 * Use of `undefined` as a key or value is unsupported.
 */
export class WeakPairing<K extends IsDefined<K>, V extends IsDefined<V>> {

    /** 
     * The time limit for total time spent garbage collecting across all {@linkcode WeakPairing} instances, in milliseconds. 
     * 
     * *Default: `0.05`*
    */
    public static timebuffer_gc = 0.05;

    /** 
     * How often to run garbage collection for {@linkcode WeakPairing} instances which currently hold primitives, in milliseconds. 
     * 
     * *Default: `1000`*
    */
    public static timeinterval_gc = 1000;

    private static nextStopGC = 0;

    protected toValue: SemiWeakMap<K, SemiWeakRef<V>> = new SemiWeakMap();
    protected toKey:   SemiWeakMap<V, SemiWeakRef<K>> = new SemiWeakMap();


    private gcTask: Promise<void> | undefined;

    /**
     * Starts garbage collection for empty {@linkcode WeakRef | WeakRefs} still associated with primitive keys, IF it isn't already running.\
     * Returns a {@linkcode Promise} that will resolve when it's done.
     * 
     * *This is called automatically when there are primitives in the* {@linkcode WeakPairing}*, so while you can call it, you shouldn't need to.* \
     * *See* {@linkcode WeakPairing.timeinterval_gc} *and* {@linkcode WeakPairing.timebuffer_gc} *for timing details.*
     */
    public scheduleGarbageCollection() {
        return this.gcTask ??=
        new Promise<void>( async (resolve) => {
            
            let limit = WeakPairing.nextStopGC ??= performance.now() + WeakPairing.timebuffer_gc;

            for( let [pk, v] of this.toValue.primitives ) {
                if( v.deref() === undefined ) {
                    this.toValue.delete(pk);
                }
                if( performance.now() > limit ) {
                    await new Promise(nextMacro)
                    limit = WeakPairing.nextStopGC = performance.now() + WeakPairing.timebuffer_gc;
                }
            }

            for( let [pv, k] of this.toKey.primitives ) {
                if( k.deref() === undefined ) {
                    this.toKey.delete(pv);
                }
                if( performance.now() > limit ) {
                    await new Promise(nextMacro)
                    limit = WeakPairing.nextStopGC = performance.now() + WeakPairing.timebuffer_gc;
                }
            }
            resolve();
        })
        .then( 
            async () => { 
                this.gcTask = undefined;
                if( this.toKey.primitives.size > 0 || this.toValue.primitives.size > 0 ) {
                    setTimeout( () => this.scheduleGarbageCollection(), WeakPairing.timeinterval_gc );
                }
            }
        );
    }

    /**
     * Sets a key-value pair.  
     */
    public set(k: K, v: V) {
        const weakRefK = new SemiWeakRef(k);
        const weakRefV = new SemiWeakRef(v);

        if( weakRefK.primitive !== undefined || weakRefV.primitive !== undefined ) this.scheduleGarbageCollection();

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
        // if K isn't held, get will fail.  If V isn't held, exists will be false.
        return Boolean( this.toValue.get(k)?.exists() )
    }

    /**
     * Does value *{@linkcode v}* exist in this map?
     * @returns 
     */
    public hasValue(v: V) {
        // if V isn't held, get will fail.  If K isn't held, exists will be false.
        return Boolean( this.toKey.get(v)?.exists() );
    }

    /**
     * Tries to delete the key-value pair with key *{@linkcode k}*.  
     * @returns whether or not it existed
     */
    public deleteKey(k: K) {
        if( !this.hasKey(k) ) return false;
        const v = this.getValue(k)!;
        this.toValue.delete(k);
        this.toKey.delete(v);
        return true;
    }

    /**
     * Tries to delete the key-value pair with value *{@linkcode v}*.  
     * @returns whether or not it existed
     */
    public deleteValue(v: V) { 
        if( !this.hasValue(v) ) return false;
        const k = this.getKey(v)!;
        this.toKey.delete(v);
        this.toValue.delete(k);
        return true;
    }


    [Symbol.toStringTag] = this.constructor.name;

}