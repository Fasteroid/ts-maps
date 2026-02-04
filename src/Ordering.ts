import { AutoSemiWeakMap } from './AutoSemiWeakMap';


/** 
 * Stores the concept of an enumerable "order" for any set of values.
 */
export class Ordering<T> {
    private regIndex = 0n;

    // @ts-ignore(2344); we won't actually be using primitive keys here so this is safe
    private objectRegistry = new AutoSemiWeakMap<T, bigint>( () => this.regIndex++ );

    /**
     * Sorts the passed array into an unspecified but consistent ordering, within the scope of this ordering's lifetime.\
     * This method mutates the array and returns a reference to the same array.
     */
    public apply( values: T[] ) {
        // arrays for each sortable type
        const strings: string[]  = [];
        const numbers: number[]  = [];
        const bigints: bigint[]  = [];
        const bools:   boolean[] = [];
        const objects: T[]       = [];

        // distribute values into arrays
        for( const v of values ) {
            const t = typeof v;
            if( t === "string" )       strings.push( v as any );
            else if( t === "number" )  numbers.push( v as any );
            else if( t === "bigint" )  bigints.push( v as any );
            else if( t === "boolean" ) bools.push( v as any );
            else                       objects.push( v );
        }

        // sort each array
        strings.sort();
        numbers.sort( (a,b) => a - b );
        bigints.sort( (a,b) => a < b ? -1 : a > b ? 1 : 0 );
        bools.sort( (a,b) => Number(a) - Number(b) );
        objects.sort( (a, b) => {
            const idA = this.objectRegistry.get( a );
            const idB = this.objectRegistry.get( b );
            return idA < idB ? -1 : idA > idB ? 1 : 0;
        } );

        values.length = 0; // clear the original array
        for( const v of strings ) values.push( v as any );
        for( const v of numbers ) values.push( v as any );
        for( const v of bigints ) values.push( v as any );
        for( const v of bools ) values.push( v as any );
        for( const v of objects ) values.push( v );

        return values;
    }

}