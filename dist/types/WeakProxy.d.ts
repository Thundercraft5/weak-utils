interface WeakProxy {
    new <T extends object>(object: T, handler?: WeakProxyHandler<T>): T;
    revocable<T extends object>(object: T, handler?: WeakProxyHandler<T>): {
        proxy: T;
        revoke(): void;
    };
}
interface WeakProxyHandler<T extends object> extends ProxyHandler<T> {
    /**
     * Invoked after the proxy's target has been reclaimed.
     */
    finalize?(): void;
}
export declare function isWeakProxy<T>(value: T): value is IsWeakProxy & T;
declare const revocable: <T extends object>(target: T, handler?: WeakProxyHandler<T>) => void, WeakProxy: WeakProxy;
declare const SymbolIsWeakProxy: unique symbol;
export type IsWeakProxy = {
    readonly [SymbolIsWeakProxy]: typeof SymbolIsWeakProxy;
};
export default WeakProxy;
export { revocable, WeakProxy };
//# sourceMappingURL=WeakProxy.d.ts.map