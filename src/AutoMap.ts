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