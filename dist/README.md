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
Stores a consistent "order" for any set of values.\
Has one method, `apply(values: T[])`, which sorts the values into said order.
> ##### ⚠️⠀Objects are sorted by reference, not contents. &nbsp;Don't assume the same order between program executions.

### `TagMap<K, V>`
Indexes items by unordered collections of keys rather than traditional single keys.

## License

MIT License