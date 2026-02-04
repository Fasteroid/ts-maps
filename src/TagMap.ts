import { AutoWeakPairing } from "./AutoWeakPairing";
import { isWeakKey } from "./internals/internals";

type SerializedSet = {
    /** values */
    v: (bigint | number | undefined | null | boolean | string)[]
    /** refs */
    r: bigint[]
}


// Because Douglas Crockford is stubborn, we have to do this horrible shit to support bigint.
function bigintReplacer(this: any, key: string, value: any): any {
    if( typeof value === 'string' ) {
        `s${value}`
    }
    if( typeof value === 'bigint' ) {
        return `n${value.toString()}`;
    }
}

function bigintReviver(this: any, key: string, value: any): any {
    if( typeof value === 'string' ) {
        const prefix = value[0];
        const body = value.slice(1);
        if( prefix === 's' ) {
            return body;
        }
        if( prefix === 'n' ) {
            return BigInt(body);
        }
    }
    return value;
}

/**
 * Indexes items by unordered collections of keys rather than traditional single keys.
 */
export class TagMap<K, V> implements Map<K[], V> {

    private regIndex = 0n;

    /** A mapping of weak keys (eg. functions, objects, symbols) to unique indicies */
    private objectRegistry = new AutoWeakPairing<WeakKey, bigint>( () => this.regIndex++ );
    private storage = new Map<string, V>();

    /** Packs a set of tags into a string */
    private packTags(set: K[]){
        const serialized: SerializedSet = {
            v: [],
            r: []
        };

        for( const key of set ) {
            if( isWeakKey(key) ) {
                serialized.r.push( this.objectRegistry.getValue(key) );
            }
            else {
                serialized.v.push( key as any );
            }
        }
        serialized.v.sort();
        serialized.r.sort();
        return JSON.stringify(serialized, bigintReplacer);
    }

    /** Unpacks a key from {@linkcode storage} into a set of keys */
    private unpackTags(serialized: string): K[] {
        const { v, r } = JSON.parse(serialized, bigintReviver) as SerializedSet;
        const set = [] as K[];
        for( const ref of r ) {
            set.push( this.objectRegistry.getKey(ref) as K );
        }
        return set;
    }
    
    public set(tags: K[], value: V) {
        const key = this.packTags(tags);
        this.storage.set(key, value);
        return this;
    }

    public get(tags: K[]): V | undefined {
        const key = this.packTags(tags);
        return this.storage.get(key);
    }

    public has(tags: K[]): boolean {
        const key = this.packTags(tags);
        return this.storage.has(key);
    }

    public delete(tags: K[]): boolean {
        const key = this.packTags(tags);
        return this.storage.delete(key);
    }

    public clear(): void {
        this.storage.clear();
    }

    public get size(): number {
        return this.storage.size;
    }

    // @ts-ignore
    public forEach( 
        fn: (value: V, key: K[], map: TagMap<K, V>) => void, 
        thisArg?: any
    ): 
    void {
        this.storage.forEach((v, k) => fn(v, this.unpackTags(k), this), thisArg);
    }

    [Symbol.iterator]() {
        return this.storage[Symbol.iterator]().map( ([k, v]) => [this.unpackTags(k), v] as [K[], V] );
    }

    [Symbol.toStringTag] = this.constructor.name;
       
}