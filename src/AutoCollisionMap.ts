import { CollisionMap } from "./CollisionMap";
import { AutoMap } from "./AutoMap";
import type { Primitive } from "./internals/internals";

/**
 * See {@linkcode CollisionMap} and {@linkcode AutoMap}
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
        if( !super.has(key) ){
            super.set(key, this.computer(key));
        }
        return super.get(key)!;
    }

    override [Symbol.toStringTag] = this.constructor.name;
}