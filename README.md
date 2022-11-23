## ⇢ `weak-utils`
`weak-utils` is a zero-dependency lightweight library written in TypeScript that provides weak reference utilities.

# What does this do?
`weak-utils` has 3 components:
* [`IterableWeakMap<object, any>`](./src/IterableWeakMap.ts) - An iterable weak map
* [`IterableWeakSet<object>`](./src/IterableWeakSet.ts) - An iterable weak set
* [`WeakProxy<object>`](./src/WeakProxy.ts) - A constructor that creates weak proxies over a target object which is weakly referenced and has support for a the standard proxy handlers and in addition to a finalizer method.

## Usage
### [`IterableWeakMap<object, any>`](./src/IterableWeakMap.ts)
Use as you would a regular `Map` or `WeakMap`. Has all methods of `Map`.

### [`IterableWeakSet<object>`](./src/IterableWeakSet.ts)
Use as you would a regular `Set` or `WeakSet`. Has all methods of `Set`.

### [`WeakProxy<object>`](./src/WeakProxy.ts)
Use as you would a regular a regular proxy, supports revocable proxies as well.

This object works by registering a finalizer for the target value via `FinalizationRegistry()`, then, when the target value is collected, the proxy is revoked.

The use cases for weak proxies are currently unknown in JS, I added this feature as the result of an experiment.
To register a finalizer method, pass a `finalize()` method in the handler object.