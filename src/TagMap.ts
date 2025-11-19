import { AutoSemiWeakMap } from "./AutoSemiWeakMap";
import { AutoWeakMap } from "./AutoWeakMap";
import { AutoWeakPairing } from "./AutoWeakPairing";
import { isWeakKey } from "./internals/internals";
import { SemiWeakMap } from "./SemiWeakMap";
import { WeakPairing } from "./WeakPairing";

type SerializedSet = {
    /** values */
    v: (bigint | number | undefined | null | boolean | string)[]
    /** refs */
    r: bigint[]
}

/**
 * A variation of map {@linkcode Map} that indexes items by unordered {@linkcode Set | Sets} of keys.
 * 
 * The same set identity will always map to the same stored value.
 */
export class TagMap<K extends Set<unknown>, V> implements Map<K, V> {

    private regIndex = 0n;

    /** A mapping of weak keys (eg. functions, objects, symbols) to unique indicies */
    private objectRegistry = new AutoWeakPairing<WeakKey, bigint>( () => this.regIndex++ );
    private storage = new Map<string, V>();

    /** Packs a set of tags into a string */
    private packTags(set: K){
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
        return JSON.stringify(serialized);
    }

    /** Unpacks a key from {@linkcode storage} into a set of keys */
    private unpackTags(serialized: string): K {
        const { v, r } = JSON.parse(serialized) as SerializedSet;
        const set = new Set(v) as K;
        for( const ref of r ) {
            set.add( this.objectRegistry.getKey(ref) );
        }
        return set;
    }
    
    public set(tags: K, value: V) {
        const key = this.packTags(tags);
        this.storage.set(key, value);
        return this;
    }

    public get(tags: K): V | undefined {
        const key = this.packTags(tags);
        return this.storage.get(key);
    }

    public has(tags: K): boolean {
        const key = this.packTags(tags);
        return this.storage.has(key);
    }

    public delete(tags: K): boolean {
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
        fn: (value: V, key: K, map: TagMap<K, V>) => void, 
        thisArg?: any
    ): 
    void {
        this.storage.forEach((v, k) => fn(v, this.unpackTags(k), this), thisArg);
    }

    [Symbol.iterator]() {
        return this.storage[Symbol.iterator]().map( ([k, v]) => [this.unpackTags(k), v] as [K, V] );
    }

    [Symbol.toStringTag] = "TagMap";
       
}


const test = new TagMap< Set<string>, string >();

test.set( new Set(["a", "b"]), "hello" );
console.log( test.get( new Set(["b", "a"]) ) );