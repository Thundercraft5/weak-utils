/* eslint-disable one-var */
/* eslint-disable @typescript-eslint/consistent-type-definitions */
/* eslint-disable @typescript-eslint/no-redeclare */
/* eslint-disable @typescript-eslint/no-extra-parens */
const refMap = new WeakMap<object, WeakRef<object>>(),
	placeholderMap = new WeakMap<object, WeakRef<object>>(),
	weakProxyHandlers = new WeakMap<object, WeakProxyHandler<object>>(),
	finalizers = new FinalizationRegistry<{ revoke(): void; proxy: object; placeholder: object }>(({ proxy, revoke, placeholder }) => {
		refMap.delete(proxy);
		placeholderMap.delete(placeholder);
		revoke();

		// Invoke finalizer from proxy if there is one
		getWeakProxyFinalizer(placeholder)?.finalize?.call(getWeakProxyFinalizer(placeholder));
	});


type WeakProxyCreator = new <T extends object>(object: T, handler?: WeakProxyHandler<T>) => { proxy: T; revoke(): void };
interface WeakProxy {
	new <T extends object>(object: T, handler?: WeakProxyHandler<T>): T;
	revocable <T extends object>(object: T, handler?: WeakProxyHandler<T>): { proxy: T; revoke(): void };
}

interface WeakProxyHandler<T extends object> extends ProxyHandler<T> {
	/**
	 * Invoked after the proxy's target has been reclaimed.
	 */
	finalize?(): void;
}

type TupleToIntersection<T extends any[]> = T extends [infer U, ...infer R] ? TupleToIntersection<R> & U : {};

function cloneProperties<T extends object, O extends object[]>(object: T, ...items: [...O]) {
	for (const item of items)
		for (const [key, desc] of Object.entries(Object.getOwnPropertyDescriptors(item)))
			Object.defineProperty(object, key, desc);


	return object as T & TupleToIntersection<O>;
}

function isConstructable(value: any): value is new (...args: any[]) => any {
	if (typeof value !== "function")
		return false;
	const { proxy: p, revoke } = Proxy.revocable(value, { construct() { return value; } });
	let res: boolean;

	try {
		new p();

		res = true;
	} catch {
		res = false;
	}

	revoke();

	return res;
}

function isCallable(value: any): value is (...args: any[]) => any {
	if (typeof value !== "function")
		return false;
	const { proxy: p, revoke } = Proxy.revocable(value, { apply() { return value; } });
	let res: boolean;

	try {
		p();

		res = true;
	} catch {
		res = false;
	}

	revoke();

	return res;
}

function derefPlaceholder(target: object) {
	const object = placeholderMap.get(target)!.deref();

	if (object === undefined)
		throw new ReferenceError("Cannot reference weak proxy who's target has been reclaimed");

	return object;
}

function getWeakProxyHandler(placeholder: object) {
	return weakProxyHandlers.get(placeholder)!;
}

Object.defineProperty(invokeWeakProxyHandlerOrDefault, "name", { value: "" });

function invokeWeakProxyHandlerOrDefault<N extends keyof WeakProxyHandler<any>>(placeholder: object, name: N, ...args: Parameters<WeakProxyHandler<any>[N] & {}>) {
	const handler = getWeakProxyHandler(placeholder);

	return handler[name]!.call(handler, ...args) as ReturnType<WeakProxyHandler<any>[N] & {}>;
}

function getWeakProxyFinalizer(proxy: object) {
	return weakProxyHandlers.get(proxy);
}

export function isWeakProxy<T>(value: T): value is IsWeakProxy & T {
	return refMap.has(value as any);
}

const baseProxyHandler = {
	apply(target, thisArg, args) {
		return invokeWeakProxyHandlerOrDefault(target, "apply", derefPlaceholder(target) as any, thisArg, args);
	},
	construct(target, args, newTarget) {
		return invokeWeakProxyHandlerOrDefault(target, "construct", derefPlaceholder(target) as any, args, newTarget);
	},
	getOwnPropertyDescriptor(target, key) {
		return invokeWeakProxyHandlerOrDefault(target, "getOwnPropertyDescriptor", derefPlaceholder(target), key);
	},
	get(target, key, receiver) {
		return invokeWeakProxyHandlerOrDefault(target, "get", derefPlaceholder(target), key, derefPlaceholder(target));
	},
	set(target, key, value) {
		return invokeWeakProxyHandlerOrDefault(target, "set", derefPlaceholder(target), key, value, derefPlaceholder(target));
	},
	has(target, key) {
		return invokeWeakProxyHandlerOrDefault(target, "has", derefPlaceholder(target), key);
	},
	defineProperty(target, key, attributes) {
		return invokeWeakProxyHandlerOrDefault(target, "defineProperty", derefPlaceholder(target), key, attributes);
	},
	deleteProperty(target, key) {
		return invokeWeakProxyHandlerOrDefault(target, "deleteProperty", derefPlaceholder(target), key);
	},
	isExtensible(target) {
		return invokeWeakProxyHandlerOrDefault(target, "isExtensible", derefPlaceholder(target));
	},
	preventExtensions(target) {
		return invokeWeakProxyHandlerOrDefault(target, "preventExtensions", derefPlaceholder(target));
	},
	getPrototypeOf(target) {
		return invokeWeakProxyHandlerOrDefault(target, "getPrototypeOf", derefPlaceholder(target));
	},
	setPrototypeOf(target, prototype) {
		return invokeWeakProxyHandlerOrDefault(target, "setPrototypeOf", derefPlaceholder(target), prototype);
	},
	ownKeys(target) {
		return invokeWeakProxyHandlerOrDefault(target, "ownKeys", derefPlaceholder(target));
	},
} satisfies ProxyHandler<object>,

	WeakProxyConstructor = function WeakProxy<T extends object>(object: T, handler: WeakProxyHandler<T> = {} as WeakProxyHandler<T>) {
		if (typeof object !== "object" || !object)
			throw new TypeError("Cannot create weak proxy with a non-object as target or handler");

		const callable = isCallable(object),
			constructable = isConstructable(object),
			placeholder = callable && constructable
				? new Function()
				: callable && !constructable
					? () => undefined
					: !callable && constructable
						? class {}
						: Object.create(Object.prototype),

			{ proxy, revoke } = Proxy.revocable(placeholder as object, baseProxyHandler),
			mergedHandler = cloneProperties({}, Reflect, handler),
			ref = new WeakRef(object);

		// Register handlers for when the target is collected
		finalizers.register(object, { revoke, proxy, placeholder }, proxy);
		refMap.set(proxy, ref);
		placeholderMap.set(placeholder, ref);

		// Register weak proxy handlers
		weakProxyHandlers.set(placeholder, mergedHandler);

		return { proxy: proxy as T, revoke };
	} as any as WeakProxyCreator,

	revocable = <T extends object>(target: T, handler?: WeakProxyHandler<T>) => {
		const p = new WeakProxyConstructor(target, handler);
	},

	WeakProxy = function<T extends object>(target: T, handler?: WeakProxyHandler<T>) {
		if (!new.target)
			throw new TypeError(`Constructor ${ WeakProxy.name } requires 'new'`);

		return new WeakProxyConstructor(target, handler).proxy;
	} as any as WeakProxy;


declare const SymbolIsWeakProxy: unique symbol;
export type IsWeakProxy = { readonly [SymbolIsWeakProxy]: typeof SymbolIsWeakProxy };

WeakProxy.prototype = undefined;
Object.defineProperty(WeakProxy, "revocable", {
	value: revocable,
	enumerable: false,
	configurable: true,
	writable: true,
});

export default WeakProxy;
export { revocable, WeakProxy };