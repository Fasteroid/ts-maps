# @fasteroid/maps

A few variations of the vanilla `Map<K, V>` that might make your life easier.

## Classes

### `AutoMap<K, V>`
Populates empty keys when getting them, based on a function that receives the key in question.

### `CollisionMap<K, V>`
You tell it how to hash keys into primitives. &nbsp;Has two interesting use-cases:
- Indexing by unordered pairs—if you want `[1, 2]` and `[2, 1]` to point at the same thing
- Indexing by objects that *feel* primitive but aren't—eg. regexes

> ##### Please don't use `JSON.stringify` for your hash function 💀

### `AutoCollisionMap<K, V>`
Same functionalities as [`AutoMap`](#automapk-v) and [`CollisionMap`](#collisionmapk-v) but in one class.

## License

MIT License
