import { AutoMap } from './AutoMap'
/**
 * See {@linkcode WeakMap} and {@linkcode AutoMap}
 */
export class AutoWeakMap<K extends WeakKey, V> extends WeakMap<K, V> {
    /**
     * @param computer Provides default value to create for an unpopulated key
     */
    public constructor( protected computer: (key: K) => V ){ super(); }

    public override get(key: K): V {
        if( !super.has(key) ){
            super.set(key, this.computer(key));
        }
        return super.get(key)!;
    }

    public override [Symbol.toStringTag] = "AutoWeakMap";
}