import test from "node:test";
import { Ordering } from "../Ordering"

function shuffle<T>(array: T[]): T[] {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

test("Ordering is consistent", () => {

    const items: any[] = [ 
        {obj: 1},
        new class A {},
        "string",
        42,
        Symbol("sym"),
        () => {},
        [1, 2, 3],
        9223372036854775808n,
        true,
        null,
        undefined
    ];

    const order = new Ordering<any>();

    const a = order.apply( shuffle(items.slice()) );
    const b = order.apply( shuffle(items.slice()) );

    for( let i = 0; i < items.length; i++ ) {
        if( a[i] !== b[i] ) {
            console.log("a:", a);
            console.log("b:", b);
            throw new Error(`Ordering is inconsistent at index ${i}`);
        }
    }

});