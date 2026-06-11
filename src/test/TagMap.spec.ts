import test from "node:test";
import { TagMap } from "../TagMap"



test("TagMap works with bigints", () => {

    const map = new TagMap<bigint, string>();

    map.set([1n, 2n], "1, 2");
    
    const result = map.get([2n, 1n]);

    if( result !== "1, 2" ) throw new Error("Something went wrong");

});

test("TagMap handles duplicate keys", () => {
    
    const map = new TagMap<"a" | "b", string >();

    map.set(["a", "b", "b"], "abb");

    const result = map.get(["b", "a", "b"]);

    if( result !== "abb" ) throw new Error("Something went wrong");

});