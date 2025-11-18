import type { AutoMap } from './AutoMap'
import { isPrimitive } from "./internals/internals";
import { SemiWeakMap } from './SemiWeakMap';

/**
 * A hybrid class of {@linkcode SemiWeakMap} and {@linkcode AutoMap}.
 */
export class SemiWeakAutoMap<K, V> extends SemiWeakMap<any, V> {
    /**
     * @param computer Provides default value to create for an unpopulated key
     */
    public constructor( private computer: (key: K) => V ){ super(); }

    public override get(key: K): V {
        let value = super.get(key);
        if( value === undefined ){
            value = this.computer(key);
            super.set(key, value);
        }
        return value;
    }
}