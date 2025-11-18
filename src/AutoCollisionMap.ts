import { CollisionMap } from "./CollisionMap";
import type { AutoMap } from "./AutoMap";
import type { Primitive } from "./internals/types";

/**
 * A hybrid class of {@linkcode CollisionMap} and {@linkcode AutoMap}.
 */
export class AutoCollisionMap<K, V> extends CollisionMap<K, V> {

    /**
     * @param collider How to hash the keys
     * @param computer Provides default value to create for an unpopulated key
     */
    constructor( collider: (key: K) => Primitive, protected computer: (key: K) => V ){
        super(collider);
    }

    public override get(key: K): V {
        let value = super.get(key);
        if( value === undefined ){
            value = this.computer(key);
            super.set(key, value);
        }
        return value;
    }

}