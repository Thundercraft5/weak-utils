import indentString from "./indentString";
import type { inspect as Inspect, InspectOptions } from "node:util";




/**
 * Creates an iterable weak map, values are only considered reachable if the keys are.
 */
export default class IterableWeakMap<K extends object, V>
	extends WeakMap<K, { value: V; ref: WeakRef<K> }>
	implements Iterable<[K, V]> {
	#refSet = new Set<WeakRef<K>>();
	#finalizationGroup = new FinalizationRegistry(IterableWeakMap.#cleanup);
	#size = 0;

	get size() {
		return this.#size;
	}

	static #cleanup({ set, ref, map }: { set: Set<WeakRef<any>>; ref: WeakRef<any>; map: IterableWeakMap<any, any> }) {
		set.delete(ref);
		map.#size--;
	}

	constructor(iterable: Iterable<[K, V]> = []) {
		super();

		for (const [key, value] of iterable)
			this.set(key, value);
	}

	// @ts-expect-error
	set(key: K, value: V) {
		const ref = new WeakRef(key);

		super.set(key, { value, ref });
		this.#refSet.add(ref);
		this.#finalizationGroup.register(key, {
			set: this.#refSet,
			ref,
			map: this,
		}, ref);

		this.#size++;

		return this;
	}

	// @ts-expect-error
	get(key: K) {
		const entry = super.get(key);

		return entry?.value;
	}

	delete(key: any): key is K {
		const entry = super.get(key);

		if (entry === undefined)
			return this.#size--, false;

		super.delete(key);
		this.#refSet.delete(entry.ref);
		this.#finalizationGroup.unregister(entry.ref);

		return true;
	}

	has(key: any): key is K {
		return super.has(key);
	}

	clear() {
		for (const [key] of this)
			this.delete(key);
	}

	forEach<This = undefined>(callbackfn: (this: This, key: K, value: V, map: this) => void, thisArg: This = undefined as This) {
		for (const [key, value] of this)
			callbackfn.call(thisArg, key, value, this);

		return this;
	}

	toJSON() {
		return [...this];
	}

	* [Symbol.iterator]() {
		for (const ref of this.#refSet) {
			const key = ref.deref();

			if (key === undefined) {
				this.#refSet.delete(ref);
				this.#size--;
				continue;
			}

			const { value } = super.get(key)!;

			yield [key, value] as [K, V];
		}
	}

	* entries() {
		yield* this[Symbol.iterator]();
	}

	* keys() {
		for (const [key] of this)
			yield key;
	}

	* values() {
		for (const [, value] of this)
			yield value;
	}

	[Symbol.for("nodejs.util.inspect.custom")](depth: number, options: InspectOptions, inspect: typeof Inspect) {
		const { size } = this,
			{ maxArrayLength = 100 } = options,
			result: [any, any][] = [],
			newline = size > 4 ? "\n" : " ",
			indent = size > 4 ? "  " : "";

		if (size === 0)
			return `${ IterableWeakMap.name }(${ size }) {}`;

		for (const [key, value] of this)
			result.push([
				inspect(key, { ...options, depth: depth + 1 }),
				inspect(value, { ...options, depth: depth + 1 }),
			]);

		return `${ IterableWeakMap.name }(${ size }) {${ newline }${
			result
				.slice(0, maxArrayLength!)
				.map(([k, v]) => indentString(`${ k } => ${ v }`, indent))
				.join(`,${ newline }`)
		}${ result.length > 1 ? "," : "" }${
			result.length > maxArrayLength! ? `\n${ indentString("...", indent) } ${ result.length - maxArrayLength! } more items` : ""
		}${ newline }}`;
 	}
}