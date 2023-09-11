import { mutableHandlers, readonlyHandlers } from "./baseHandlers";

export function reactive<T extends Object>(target: T): T {
    return createActiveObject(target, mutableHandlers);
}

export function readonly<T extends Object>(target: T): T {
    return createActiveObject(target, readonlyHandlers);
}

function createActiveObject<T extends Object>(target: T, handlers: ProxyHandler<T>) {
    return new Proxy(target, handlers);
}

export function isReactive(target){
    return target["__is_Reactive"]
}
