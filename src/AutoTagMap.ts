import { TagMap } from "./TagMap";
import type { AutoMap } from "./AutoMap";



/**
 * See {@linkcode AutoMap} and {@linkcode TagMap}
 */
export class AutoTagMap<K extends Set<unknown>, V> extends TagMap<K, V> {

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
    
       
}
