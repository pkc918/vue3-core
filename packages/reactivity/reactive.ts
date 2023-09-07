import { track, trigger } from "./effect";

export function reactive<T extends object>(target: T): T {
    return new Proxy(target, {
        get(target, key) {
            track(target, key);
            return Reflect.get(target, key);
        },
        set(target, key, newValue) {
            const res = Reflect.set(target, key, newValue);
            trigger(target, key);
            return res;
        }
    });
}
