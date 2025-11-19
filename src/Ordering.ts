import { AutoWeakMap } from "./AutoWeakMap";


/** 
 * Stores the concept of an enumerable "order" for any set of values.
 */
export class Ordering<T> {

    private regIndex = 0n;

    // @ts-ignore(2344); we won't actually be using primitive keys here so this is safe
    private objectRegistry = new AutoWeakMap<T, bigint>( () => this.regIndex++ );

    /** Applies consistent ordering (per runtime) to the *{@linkcode victims}* array. */
    public apply( victims: T[] ) {
        // arrays for each sortable type
        const strings: string[]  = [];
        const numbers: number[]  = [];
        const bigints: bigint[]  = [];
        const bools:   boolean[] = [];
        const objects: T[]       = [];

        // distribute values into arrays
        for( const v of victims ) {
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

        // concatenate in a predictable order and return
        return [
            ...strings,
            ...numbers,
            ...bigints,
            ...bools,
            ...objects
        ] as T[];
    }

}