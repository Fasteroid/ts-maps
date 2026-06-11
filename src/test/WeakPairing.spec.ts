import { after, describe, test, TestContext } from "node:test";
import { WeakPairing } from "../WeakPairing";
import v8 from "node:v8";
import { AutoMap } from "../AutoMap";

const NUM_OF_ENTRIES  = 16384;
const SIZE_OF_ENTRIES = 1024;
const MAX_SEEPAGE     = 1.3;
const DO_SNAPSHOTS    = false;

const testCounters = new AutoMap( (t: TestContext) => 0 );

async function delay(ms: number) {
    await new Promise((resolve) => setTimeout(resolve, ms));
}

async function collectGarbage() {
    await delay(10);
    let engine = "unknown";

    if( globalThis.Bun ) {
        engine = "bun";
        globalThis.Bun.gc(true);
        globalThis.Bun.gc(true); // need to run it multiple times for stability apparently
    }
    else if ( global.gc ) {
        engine = "node";
        global.gc({
            execution: 'sync',
            type: 'major'
        });
    }
    else {
        throw new Error("unknown engine, can't invoke gc")
    }

    await delay(10);
}

async function getHeapSize(test: TestContext) {
    await collectGarbage();

    let size: number;
    if( globalThis.Bun ) {
        const { heapStats } = require("bun:jsc");
        size =  heapStats().heapSize as number;
    }
    else if ( global.gc ) {
        size = process.memoryUsage().heapUsed;
    }
    else {
        throw new Error("unknown engine, can't get heap size")
    }

    if( DO_SNAPSHOTS ) {
        const id = testCounters.get(test) + 1;
        const file = `mem-${test.name.replaceAll(" ", "_")}-${id}.heapsnapshot`;
        testCounters.set(test, id);
        console.log( v8.writeHeapSnapshot(file) );
    }

    return size;
}

describe("WeakPairing", async (t) => {

    /*
     * Because the TC39 spec doesn't say anything about maps automatically rehashing when the load factor gets small enough,
     * WeakMap may hold onto a large block of memory for its hash range, even if it doesn't need to be that large.
     * 
     * Because of this, we must pre-stress the WeakPairing, otherwise we might observe a "memory leak" even if WeakPairing
     * is freeing everything it's supposed to correctly.
    */
    function getNewPairing() {
        const pairing = new WeakPairing<object | number, object | number>();
        const sacrifices = Array.from( {length: NUM_OF_ENTRIES}, () => ({}) );
        for( let sac of sacrifices ) {
            pairing.set(sac, sac);
        }
        return pairing;
    }

    await collectGarbage();

    await test("non-weak to weak", async (t) => {

        const pairing = getNewPairing();

        const initialMemoryUsage = await getHeapSize(t);

        // check retention
        let objects = Array.from( {length: NUM_OF_ENTRIES}, () => Float64Array.from({length: SIZE_OF_ENTRIES}, (_, i) => i) );
    
        for (let i = 0; i < objects.length; i++) {
            pairing.set(i, objects[i]);
        }

        for (let i = 0; i < objects.length; i++) {
            if( !pairing.hasValue(objects[i]) ) throw new Error(`Value ${i} was dropped`);
            if( !pairing.hasKey(i) ) throw new Error(`Key ${i} was dropped`);
        }

        const midMemoryUsage = await getHeapSize(t);

        objects = [];

        await collectGarbage();
        await pairing.scheduleGarbageCollection();

        const finalMemoryUsage = await getHeapSize(t);

        t.diagnostic(`${initialMemoryUsage} --> ${midMemoryUsage} --> ${finalMemoryUsage}` );
        if( finalMemoryUsage > initialMemoryUsage * MAX_SEEPAGE ) throw new Error(`Possible leak detected (${t.name})`);

    });

    await collectGarbage();

    await test("weak to non-weak", async (t) => {

        const pairing = getNewPairing();

        const initialMemoryUsage = await getHeapSize(t);

        // check retention
        let objects = Array.from( {length: NUM_OF_ENTRIES}, () => Float64Array.from({length: SIZE_OF_ENTRIES}, (_, i) => i) );
    
        for (let i = 0; i < objects.length; i++) {
            pairing.set(objects[i], i);
        }

        for (let i = 0; i < objects.length; i++) {
            if( !pairing.hasValue(i) ) throw new Error(`Value ${i} was dropped`);
            if( !pairing.hasKey(objects[i]) ) throw new Error(`Key ${i} was dropped`);
        }

        const midMemoryUsage = await getHeapSize(t);

        objects = [];
        

        await collectGarbage();
        await pairing.scheduleGarbageCollection();

        const finalMemoryUsage = await getHeapSize(t);

        t.diagnostic(`${initialMemoryUsage} --> ${midMemoryUsage} --> ${finalMemoryUsage}` );
        if( finalMemoryUsage > initialMemoryUsage * MAX_SEEPAGE ) throw new Error(`Possible leak detected (${t.name})`);

    });

    await collectGarbage();

    await test("weak to weak", async (t) => {

        const pairing = getNewPairing();

        const initialMemoryUsage = await getHeapSize(t);

        // check retention
        let values = Array.from( {length: NUM_OF_ENTRIES}, () => Float64Array.from({length: SIZE_OF_ENTRIES}, (_, i) => i) );
        let keys   = Array.from( {length: NUM_OF_ENTRIES}, () => Int32Array.from({length: SIZE_OF_ENTRIES}, (_, i) => i) );
    
        for (let i = 0; i < values.length; i++) {
            pairing.set(keys[i], values[i]);
        }

        for (let i = 0; i < values.length; i++) {
            if( !pairing.hasValue(values[i]) ) throw new Error(`Value ${i} was dropped`);
            if( !pairing.hasKey(keys[i]) ) throw new Error(`Key ${i} was dropped`);
        }

        const midMemoryUsage = await getHeapSize(t);

        values = [];
        keys = [];

        await collectGarbage();

        const finalMemoryUsage = await getHeapSize(t);

        t.diagnostic(`${initialMemoryUsage} --> ${midMemoryUsage} --> ${finalMemoryUsage}` );
        if( finalMemoryUsage > initialMemoryUsage * MAX_SEEPAGE ) throw new Error(`Possible leak detected (${t.name})`);

    });

    await delay(1000);
});