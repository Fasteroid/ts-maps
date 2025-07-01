/**
 * Populates unpopulated keys when getting them, based on a function that receives the key in question.
 */
export class AutoMap<K, V> extends Map<K, V> {
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

type Primitive = number | bigint | symbol | string | null | undefined | boolean

/**
 * A {@linkcode Map} where you define how to hash keys into primitives.
 * 
 * *Because sometimes, you may want hash collisions.*
 */
export class CollisionMap<K, V> implements Map<K, V> {

    private storage = new Map<Primitive, [K, V]>();

    /**
     * @param collider How to hash the keys
     */
    constructor( private collider: (key: K) => Primitive ){ }

    public get(key: K) {
        return this.storage.get( this.collider(key) )?.[1]
    }

    public set(key: K, value: V) {
        this.storage.set( this.collider(key), [key, value] );
        return this;
    }

    public has(key: K){
        return this.storage.has( this.collider(key) );
    }

    public delete(key: K){
        return this.storage.delete( this.collider(key) );
    }

    public clear(){
        this.storage.clear();
    }

    public get size() {
        return this.storage.size;
    }

    public forEach(
        callback: (
            value: V, 
            key: K, 
            map: CollisionMap<K, V>
        ) => void,
    ) {
        this.storage.forEach( (kv) => callback(kv[1], kv[0], this) );
    }

    public [Symbol.iterator](): MapIterator<[K, V]> {
        return this.storage.values()
    }

    public entries(): MapIterator<[K, V]> {
        return this[Symbol.iterator]();
    }

    public keys(): MapIterator<K> {
        return this.storage.values().map(kv => kv[0])[Symbol.iterator]();
    }

    public values(): MapIterator<V> {
        return this.storage.values().map(kv => kv[1])[Symbol.iterator]();
    }

    public [Symbol.toStringTag] = "CollisionMap";

}

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