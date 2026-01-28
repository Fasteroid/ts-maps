# @fasteroid/maps

A few variations of the vanilla `Map<K, V>` that might make your life easier.

## Classes

### `AutoMap<K, V>`
Populates empty keys when getting them, based on a function that receives the key in question.

> ##### 💡⠀This package also provides "auto" variants for most of the classes below!

### `CollisionMap<K, V>`
You tell it how to hash keys into primitives. &nbsp;Has two interesting use-cases:
- Indexing by unordered pairs—if you want `[1, 2]` and `[2, 1]` to point at the same thing
- Indexing by objects that *feel* primitive but aren't—eg. regexes

> ##### ⚠️⠀DON'T use `JSON.stringify` for your hash function. &nbsp;Hash functions need to be fast.

### `SemiWeakMap<K, V>`
Like a native [`WeakMap`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/WeakMap), but you can store primitives on it.

### `WeakPairing<K, V>`
Like a [`SemiWeakMap`](#semiweakmapk-v), but the values are also weakly held. &nbsp;Useful as a weak bidirectional lookup table.\
Values referenced by a pair can be garbage-collected as long as *at least* one of them is garbage-collectable.

### `Ordering<T>`
Stores the concept of an enumerable "order" for any set of values.\
Has one method, `apply(victims: T[])`, which applies a consistent order to a copy of the passed array.
> ##### ⚠️⠀The ordering is not dependent on the contents of the objects, so don't rely on it being the same between program executions!

## Experimental
### *`TagMap<Ks, V>`*
Indexes items by unordered [sets](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Set) of keys rather than traditional single keys.\
The same set identity will always map to the same stored value.

## License

MIT License