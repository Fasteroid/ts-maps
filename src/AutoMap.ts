/**
 * Populates unpopulated keys when getting them, based on a function that receives the key in question.
 */
export class AutoMap<K, V> extends Map<K, V> {

    /**
     * @param computer Provides default value to create for an unpopulated key
     */
    public constructor( private computer: (key: K) => V ){ super(); }

    public override get(key: K): V {
        if( !super.has(key) ){
            super.set(key, this.computer(key));
        }
        return super.get(key)!;
    }

    override [Symbol.toStringTag] = this.constructor.name;
}