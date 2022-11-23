/**
 * Creates an iterable weak map, values are only considered reachable if the keys are.
 */
export default class IterableWeakMap<K extends object, V> extends WeakMap<K, {
    value: V;
    ref: WeakRef<K>;
}> implements Iterable<[K, V]> {
    #private;
    get size(): number;
    constructor(iterable?: Iterable<[K, V]>);
    set(key: K, value: V): this;
    get(key: K): V;
    delete(key: any): key is K;
    has(key: any): key is K;
    clear(): void;
    forEach<This = undefined>(callbackfn: (this: This, key: K, value: V, map: this) => void, thisArg?: This): this;
    toJSON(): [K, V][];
    [Symbol.iterator](): Generator<[K, V], void, unknown>;
    entries(): Generator<[K, V], void, unknown>;
    keys(): Generator<K, void, unknown>;
    values(): Generator<V, void, unknown>;
}
//# sourceMappingURL=IterableWeakMap.d.ts.map