import { track, trigger } from "./effect";
import { reactive, ReactiveFlags, readonly } from "./reactive";
import { isObject } from "../shared";

const get = createGetter();
const set = createSetter();
const readonlyGet = createGetter(true);

function createGetter(isReadonly = false) {
    return function get(target, key) {
        if (key === ReactiveFlags.IS_REACTIVE) {
            return !isReadonly;
        } else if (key === ReactiveFlags.IS_READONLY) {
            return isReadonly;
        }
        if (!isReadonly) {
            track(target, key);
        }
        const res = Reflect.get(target, key);
        if (isObject(res)) {
            return isReadonly ? readonly(res) : reactive(res);
        }
        return res;
    };
}

function createSetter() {
    return function set(target, key, newValue) {
        const res = Reflect.set(target, key, newValue);
        trigger(target, key);
        return res;
    };
}

export const mutableHandlers = {
    get,
    set
};

export const readonlyHandlers = {
    get: readonlyGet,
    set: (target, key, newValue) => {
        console.warn(`${key} attribute is readonly`)
        return true;
    }
};
