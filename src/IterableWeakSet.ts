import indentString from "./indentString";
import type { inspect as Inspect, InspectOptions } from "node:util";




/**
 * An iterable version of {@linkcode WeakSet}. 
 * 
 * Works by using {@linkcode FinalizationRegistry} to cleanup reclaimed objects and a backing set of {@linkcode WeakRef | WeakRefs} to track the items of the collection.
 */
export default class IterableWeakSet<V extends object> extends WeakSet<V> implements Iterable<V> {
	#size = 0;
	#finalizationGroup = new FinalizationRegistry(IterableWeakSet.#cleanup);
	#refSet = new Set<WeakRef<V>>();
	#backingMap = new WeakMap<V, WeakRef<V>>();

	get size() {
		return this.#size;
	}

	static #cleanup({
		refSet,
		ref,
		set,
		backingMap,
	}: {
		refSet: Set<WeakRef<any>>;
		ref: WeakRef<any>;
		set: IterableWeakSet<any>;
		backingMap: WeakMap<any, any>;
	}) {
		backingMap.delete(ref);
		refSet.delete(ref);
		set.#size--;
	}

	constructor(iterable: Iterable<V> = []) {
		super();

		for (const value of iterable)
			this.add(value);
	}

	add(value: V) {
		if (this.has(value))
			return this;

		const ref = new WeakRef(value);

		super.add(value);
		this.#refSet.add(ref);
		this.#backingMap.set(value, ref);
		this.#finalizationGroup.register(value, {
			ref,
			refSet: this.#refSet,
			set: this,
			backingMap: this.#backingMap,
		}, ref);
		this.#size++;

		return this;
	}

	delete(value: any): value is V {
		if (!super.has(value))
			return this.#size--, false;

		const ref = this.#backingMap.get(value as V);

		if (ref === undefined)
			return false;

 		super.delete(value as V);
		this.#refSet.delete(ref);
		this.#backingMap.delete(value as V);
		this.#size--;

		return true;
	}

	has(value: any): value is V {
		return super.has(value);
	}

	toJSON() {
		return [...this];
	}

	forEach<This = undefined>(callbackfn: (this: This, key: V, value: V, set: this) => void, thisArg: This = undefined as This) {
		for (const value of this)
			callbackfn.call(thisArg, value, value, this);

		return this;
	}

	clear() {
		for (const value of this)
			this.delete(value);

		return this;
	}

	* [Symbol.iterator]() {
		for (const ref of this.#refSet) {
			const value = ref.deref();

			if (value === undefined) {
				this.#refSet.delete(ref);
				this.#size--;
				continue;
			}

			yield value;
		}
	}

	* values() {
		yield* this;
	}

	* keys() {
		yield* this;
	}

	* entries() {
		for (const v of this)
			yield [v, v] as [V, V];
	}

	[Symbol.for("nodejs.util.inspect.custom")](depth: number, options: InspectOptions, inspect: typeof Inspect) {
		const { size } = this,
			{ maxArrayLength = 100 } = options,
			result: string[] = [],
			newline = size > 4 ? "\n" : " ",
			indent = size > 4 ? "  " : "";

		if (size === 0)
			return `${ IterableWeakSet.name }(${ size }) {}`;

		for (const value of this)
			result.push(
				inspect(value, { ...options, depth: depth + 1 }),
			);

		return `${ IterableWeakSet.name }(${ size }) {${ newline }${
			result
				.slice(0, maxArrayLength!)
				.map(v => indentString(v, indent))
				.join(`,${ newline }`)
		}${ result.length > 1 ? "," : "" }${
			result.length > maxArrayLength! ? `\n${ indentString("...", indent) } ${ result.length - maxArrayLength! } more items` : ""
		}${ newline }}`;
 	}
}