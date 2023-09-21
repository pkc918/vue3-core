import { mutableHandlers, readonlyHandlers, shallowReadonlyHandlers } from "./baseHandlers";
import { isObject } from "../shared";

export const enum ReactiveFlags {
    IS_REACTIVE = "__IS_REACTIVE",
    IS_READONLY = "__IS_READONLY"
}

export function reactive<T extends Object>(target: T): T {
    return createActiveObject(target, mutableHandlers);
}

export function readonly<T extends Object>(target: T): T {
    return createActiveObject(target, readonlyHandlers);
}

export function shallowReadonly(target: any) {
    return createActiveObject(target, shallowReadonlyHandlers)
}

function createActiveObject<T extends Object>(target: T, handlers: ProxyHandler<T>) {
    if (!isObject(target)) {
        console.warn(`${target} has to be object`);
        return target;
    }
    return new Proxy(target, handlers);
}

export function isReactive(target: any) {
    return !!target[ReactiveFlags.IS_REACTIVE]
}

export function isReadonly(target: any) {
    return !!target[ReactiveFlags.IS_READONLY]
}

export function isProxy(val: any) {
    return isReadonly(val) || isReactive(val);
}
