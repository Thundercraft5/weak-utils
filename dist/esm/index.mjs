var __accessCheck = (obj, member, msg) => {
  if (!member.has(obj))
    throw TypeError("Cannot " + msg);
};
var __privateGet = (obj, member, getter) => {
  __accessCheck(obj, member, "read from private field");
  return getter ? getter.call(obj) : member.get(obj);
};
var __privateAdd = (obj, member, value) => {
  if (member.has(obj))
    throw TypeError("Cannot add the same private member more than once");
  member instanceof WeakSet ? member.add(obj) : member.set(obj, value);
};
var __privateSet = (obj, member, value, setter) => {
  __accessCheck(obj, member, "write to private field");
  setter ? setter.call(obj, value) : member.set(obj, value);
  return value;
};
var __privateWrapper = (obj, member, setter, getter) => ({
  set _(value) {
    __privateSet(obj, member, value, setter);
  },
  get _() {
    return __privateGet(obj, member, getter);
  }
});
var __privateMethod = (obj, member, method) => {
  __accessCheck(obj, member, "access private method");
  return method;
};

// src/indentString.ts
function indentString(str, indent = "  ") {
  const split = str.trim().split("\n");
  return split.map((s) => `${indent}${s}`).join("\n");
}

// src/IterableWeakMap.ts
var _refSet, _finalizationGroup, _size, _cleanup, cleanup_fn;
var _IterableWeakMap = class extends WeakMap {
  constructor(iterable = []) {
    super();
    __privateAdd(this, _refSet, /* @__PURE__ */ new Set());
    __privateAdd(this, _finalizationGroup, new FinalizationRegistry(__privateMethod(_IterableWeakMap, _cleanup, cleanup_fn)));
    __privateAdd(this, _size, 0);
    for (const [key, value] of iterable)
      this.set(key, value);
  }
  get size() {
    return __privateGet(this, _size);
  }
  set(key, value) {
    const ref = new WeakRef(key);
    super.set(key, { value, ref });
    __privateGet(this, _refSet).add(ref);
    __privateGet(this, _finalizationGroup).register(key, {
      set: __privateGet(this, _refSet),
      ref,
      map: this
    }, ref);
    __privateWrapper(this, _size)._++;
    return this;
  }
  get(key) {
    const entry = super.get(key);
    return entry?.value;
  }
  delete(key) {
    const entry = super.get(key);
    if (entry === void 0)
      return __privateWrapper(this, _size)._--, false;
    super.delete(key);
    __privateGet(this, _refSet).delete(entry.ref);
    __privateGet(this, _finalizationGroup).unregister(entry.ref);
    return true;
  }
  has(key) {
    return super.has(key);
  }
  clear() {
    for (const [key] of this)
      this.delete(key);
  }
  forEach(callbackfn, thisArg = void 0) {
    for (const [key, value] of this)
      callbackfn.call(thisArg, key, value, this);
    return this;
  }
  toJSON() {
    return [...this];
  }
  *[Symbol.iterator]() {
    for (const ref of __privateGet(this, _refSet)) {
      const key = ref.deref();
      if (key === void 0) {
        __privateGet(this, _refSet).delete(ref);
        __privateWrapper(this, _size)._--;
        continue;
      }
      const { value } = super.get(key);
      yield [key, value];
    }
  }
  *entries() {
    yield* this[Symbol.iterator]();
  }
  *keys() {
    for (const [key] of this)
      yield key;
  }
  *values() {
    for (const [, value] of this)
      yield value;
  }
  [Symbol.for("nodejs.util.inspect.custom")](depth, options, inspect) {
    const { size } = this, { maxArrayLength = 100 } = options, result = [], newline = size > 4 ? "\n" : " ", indent = size > 4 ? "  " : "";
    if (size === 0)
      return `${_IterableWeakMap.name}(${size}) {}`;
    for (const [key, value] of this)
      result.push([
        inspect(key, { ...options, depth: depth + 1 }),
        inspect(value, { ...options, depth: depth + 1 })
      ]);
    return `${_IterableWeakMap.name}(${size}) {${newline}${result.slice(0, maxArrayLength).map(([k, v]) => indentString(`${k} => ${v}`, indent)).join(`,${newline}`)}${result.length > 1 ? "," : ""}${result.length > maxArrayLength ? `
${indentString("...", indent)} ${result.length - maxArrayLength} more items` : ""}${newline}}`;
  }
};
var IterableWeakMap = _IterableWeakMap;
_refSet = new WeakMap();
_finalizationGroup = new WeakMap();
_size = new WeakMap();
_cleanup = new WeakSet();
cleanup_fn = function({ set, ref, map }) {
  set.delete(ref);
  __privateWrapper(map, _size)._--;
};
__privateAdd(IterableWeakMap, _cleanup);

// src/IterableWeakSet.ts
var _size2, _finalizationGroup2, _refSet2, _backingMap, _cleanup2, cleanup_fn2;
var _IterableWeakSet = class extends WeakSet {
  constructor(iterable = []) {
    super();
    __privateAdd(this, _size2, 0);
    __privateAdd(this, _finalizationGroup2, new FinalizationRegistry(__privateMethod(_IterableWeakSet, _cleanup2, cleanup_fn2)));
    __privateAdd(this, _refSet2, /* @__PURE__ */ new Set());
    __privateAdd(this, _backingMap, /* @__PURE__ */ new WeakMap());
    for (const value of iterable)
      this.add(value);
  }
  get size() {
    return __privateGet(this, _size2);
  }
  add(value) {
    if (this.has(value))
      return this;
    const ref = new WeakRef(value);
    super.add(value);
    __privateGet(this, _refSet2).add(ref);
    __privateGet(this, _backingMap).set(value, ref);
    __privateGet(this, _finalizationGroup2).register(value, {
      ref,
      refSet: __privateGet(this, _refSet2),
      set: this,
      backingMap: __privateGet(this, _backingMap)
    }, ref);
    __privateWrapper(this, _size2)._++;
    return this;
  }
  delete(value) {
    if (!super.has(value))
      return __privateWrapper(this, _size2)._--, false;
    const ref = __privateGet(this, _backingMap).get(value);
    if (ref === void 0)
      return false;
    super.delete(value);
    __privateGet(this, _refSet2).delete(ref);
    __privateGet(this, _backingMap).delete(value);
    __privateWrapper(this, _size2)._--;
    return true;
  }
  has(value) {
    return super.has(value);
  }
  toJSON() {
    return [...this];
  }
  forEach(callbackfn, thisArg = void 0) {
    for (const value of this)
      callbackfn.call(thisArg, value, value, this);
    return this;
  }
  clear() {
    for (const value of this)
      this.delete(value);
    return this;
  }
  *[Symbol.iterator]() {
    for (const ref of __privateGet(this, _refSet2)) {
      const value = ref.deref();
      if (value === void 0) {
        __privateGet(this, _refSet2).delete(ref);
        __privateWrapper(this, _size2)._--;
        continue;
      }
      yield value;
    }
  }
  *values() {
    yield* this;
  }
  *keys() {
    yield* this;
  }
  *entries() {
    for (const v of this)
      yield [v, v];
  }
  [Symbol.for("nodejs.util.inspect.custom")](depth, options, inspect) {
    const { size } = this, { maxArrayLength = 100 } = options, result = [], newline = size > 4 ? "\n" : " ", indent = size > 4 ? "  " : "";
    if (size === 0)
      return `${_IterableWeakSet.name}(${size}) {}`;
    for (const value of this)
      result.push(
        inspect(value, { ...options, depth: depth + 1 })
      );
    return `${_IterableWeakSet.name}(${size}) {${newline}${result.slice(0, maxArrayLength).map((v) => indentString(v, indent)).join(`,${newline}`)}${result.length > 1 ? "," : ""}${result.length > maxArrayLength ? `
${indentString("...", indent)} ${result.length - maxArrayLength} more items` : ""}${newline}}`;
  }
};
var IterableWeakSet = _IterableWeakSet;
_size2 = new WeakMap();
_finalizationGroup2 = new WeakMap();
_refSet2 = new WeakMap();
_backingMap = new WeakMap();
_cleanup2 = new WeakSet();
cleanup_fn2 = function({
  refSet,
  ref,
  set,
  backingMap
}) {
  backingMap.delete(ref);
  refSet.delete(ref);
  __privateWrapper(set, _size2)._--;
};
__privateAdd(IterableWeakSet, _cleanup2);

// src/WeakProxy.ts
var refMap = /* @__PURE__ */ new WeakMap();
var placeholderMap = /* @__PURE__ */ new WeakMap();
var weakProxyHandlers = /* @__PURE__ */ new WeakMap();
var finalizers = new FinalizationRegistry(({ proxy, revoke, placeholder }) => {
  refMap.delete(proxy);
  placeholderMap.delete(placeholder);
  revoke();
  getWeakProxyFinalizer(placeholder)?.finalize?.call(getWeakProxyFinalizer(placeholder));
});
function cloneProperties(object, ...items) {
  for (const item of items)
    for (const [key, desc] of Object.entries(Object.getOwnPropertyDescriptors(item)))
      Object.defineProperty(object, key, desc);
  return object;
}
function isConstructable(value) {
  if (typeof value !== "function")
    return false;
  const { proxy: p, revoke } = Proxy.revocable(value, { construct() {
    return value;
  } });
  let res;
  try {
    new p();
    res = true;
  } catch {
    res = false;
  }
  revoke();
  return res;
}
function isCallable(value) {
  if (typeof value !== "function")
    return false;
  const { proxy: p, revoke } = Proxy.revocable(value, { apply() {
    return value;
  } });
  let res;
  try {
    p();
    res = true;
  } catch {
    res = false;
  }
  revoke();
  return res;
}
function derefPlaceholder(target) {
  const object = placeholderMap.get(target).deref();
  if (object === void 0)
    throw new ReferenceError("Cannot reference weak proxy who's target has been reclaimed");
  return object;
}
function getWeakProxyHandler(placeholder) {
  return weakProxyHandlers.get(placeholder);
}
Object.defineProperty(invokeWeakProxyHandlerOrDefault, "name", { value: "" });
function invokeWeakProxyHandlerOrDefault(placeholder, name, ...args) {
  const handler = getWeakProxyHandler(placeholder);
  return handler[name].call(handler, ...args);
}
function getWeakProxyFinalizer(proxy) {
  return weakProxyHandlers.get(proxy);
}
function isWeakProxy(value) {
  return refMap.has(value);
}
var baseProxyHandler = {
  apply(target, thisArg, args) {
    return invokeWeakProxyHandlerOrDefault(target, "apply", derefPlaceholder(target), thisArg, args);
  },
  construct(target, args, newTarget) {
    return invokeWeakProxyHandlerOrDefault(target, "construct", derefPlaceholder(target), args, newTarget);
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
  }
};
var WeakProxyConstructor = function WeakProxy(object, handler = {}) {
  if (typeof object !== "object" || !object)
    throw new TypeError("Cannot create weak proxy with a non-object as target or handler");
  const callable = isCallable(object), constructable = isConstructable(object), placeholder = callable && constructable ? new Function() : callable && !constructable ? () => void 0 : !callable && constructable ? class {
  } : Object.create(Object.prototype), { proxy, revoke } = Proxy.revocable(placeholder, baseProxyHandler), mergedHandler = cloneProperties({}, Reflect, handler), ref = new WeakRef(object);
  finalizers.register(object, { revoke, proxy, placeholder }, proxy);
  refMap.set(proxy, ref);
  placeholderMap.set(placeholder, ref);
  weakProxyHandlers.set(placeholder, mergedHandler);
  return { proxy, revoke };
};
var revocable = (target, handler) => {
  const p = new WeakProxyConstructor(target, handler);
};
var WeakProxy2 = function(target, handler) {
  if (!new.target)
    throw new TypeError(`Constructor ${WeakProxy2.name} requires 'new'`);
  return new WeakProxyConstructor(target, handler).proxy;
};
WeakProxy2.prototype = void 0;
Object.defineProperty(WeakProxy2, "revocable", {
  value: revocable,
  enumerable: false,
  configurable: true,
  writable: true
});
export {
  WeakProxy2 as WeakProxy,
  isWeakProxy,
  revocable
};
//# sourceMappingURL=index.mjs.map
