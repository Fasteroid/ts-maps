import { AutoMap } from './AutoMap'
import { SemiWeakMap } from './SemiWeakMap';

/**
 * See {@linkcode SemiWeakMap} and {@linkcode AutoMap}
 */
export class AutoSemiWeakMap<K, V> extends SemiWeakMap<any, V> {
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
    
    override [Symbol.toStringTag] = this.constructor.name;
}