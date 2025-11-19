
import { SemiWeakRef } from "./internals/SemiWeakRef";
import { SemiWeakMap } from "./SemiWeakMap";

import { WeakPairing } from "./WeakPairing";
import type { AutoMap } from "./AutoMap";

/**
 * See {@linkcode WeakPairing} and {@linkcode AutoMap}
 */
export class AutoWeakPairing<K, V> extends WeakPairing<K, V> {

    constructor( protected computer: (key: K) => V ) {
        super();
    }

    /**
     * Gets or computes the value associated with key *{@linkcode k}*
     */
    public override getValue(key: K): V {
        if( !super.hasKey(key) ){
            // we need to handle the result carefully so it doesn't get garbage collected; always keep a reference handy.
            const result = this.computer(key);
            super.set(key, result);
            return result;
        }

        return super.getValue(key)!;
    }

    override [Symbol.toStringTag] = this.constructor.name;

}
