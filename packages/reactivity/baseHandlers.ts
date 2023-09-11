import { track, trigger } from "./effect";

const get = createGetter();
const set = createSetter();
const readonlyGet = createGetter(true);

function createGetter(isReadonly = false) {
    return function get(target, key) {
        if (!isReadonly) {
            track(target, key);
        }
        return Reflect.get(target, key);
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
