import { TagMap } from "./TagMap.ts";
import type { AutoMap } from "../src/AutoMap.ts";



/**
 * See {@linkcode AutoMap} and {@linkcode TagMap}
 * 
 * **EXPERIMENTAL, this is not battle-tested yet.**
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
