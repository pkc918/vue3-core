import { mutableHandlers, readonlyHandlers, shallowReadonlyHandlers } from "./baseHandlers";

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

export function shallowReadonly(target){
    return createActiveObject(target, shallowReadonlyHandlers)
}


function createActiveObject<T extends Object>(target: T, handlers: ProxyHandler<T>) {
    return new Proxy(target, handlers);
}

export function isReactive(target){
    return !!target[ReactiveFlags.IS_REACTIVE]
}

export function isReadonly(target){
    return !!target[ReactiveFlags.IS_READONLY]
}
