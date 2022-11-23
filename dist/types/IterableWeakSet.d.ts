/**
 * An iterable version of {@linkcode WeakSet}.
 *
 * Works by using {@linkcode FinalizationRegistry} to cleanup reclaimed objects and a backing set of {@linkcode WeakRef | WeakRefs} to track the items of the collection.
 */
export default class IterableWeakSet<V extends object> extends WeakSet<V> implements Iterable<V> {
    #private;
    get size(): number;
    constructor(iterable?: Iterable<V>);
    add(value: V): this;
    delete(value: any): value is V;
    has(value: any): value is V;
    toJSON(): V[];
    forEach<This = undefined>(callbackfn: (this: This, key: V, value: V, set: this) => void, thisArg?: This): this;
    clear(): this;
    [Symbol.iterator](): Generator<V, void, unknown>;
    values(): Generator<V, void, unknown>;
    keys(): Generator<V, void, unknown>;
    entries(): Generator<[V, V], void, unknown>;
}
//# sourceMappingURL=IterableWeakSet.d.ts.map