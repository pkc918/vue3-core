import { Deps, isTracking, trackEffects, triggerEffects } from "./effect";
import { hasChange, isObject } from "../shared";
import { reactive } from "./reactive";

class RefImpl {
    private _value: any;
    private _rawValue: any;
    public readonly deps: Deps;
    public __IS_REF: boolean = true;

    constructor(value: any) {
        this._rawValue = value;
        // value is object, should reactive
        this._value = convert(value);
        this.deps = new Set();
    }

    get value() {
        // prevent effect not called
        trackRefValue(this);
        return this._value;
    }

    set value(newValue) {
        if (!hasChange(this._rawValue, newValue)) return;
        this._rawValue = newValue;
        this._value = convert(newValue);
        triggerEffects(this.deps);
    }
}

export function trackRefValue(ref: RefImpl) {
    if (isTracking()) {
        trackEffects(ref.deps);
    }
}

export function convert(value: any) {
    return isObject(value) ? reactive(value) : value;
}

export function ref<T>(value: T) {
    return new RefImpl(value);
}

export function isRef(ref: any) {
    return Boolean(ref.__IS_REF);
}

export function unRef(ref: any) {
    if (isRef(ref)) {
        return ref.value;
    }
    console.warn(`${ref} is not RefImpl`);
    return ref;
}

export function proxyRefs(target: any) {
    return new Proxy(target, {
        get(target: any, key: string | symbol) {
            const res = Reflect.get(target, key);
            return isRef(res) ? res.value : res;
        },
        set(target: any, key: string | symbol, newValue: any) {
            const val = Reflect.get(target, key);
            if (isRef(val) && !isRef(newValue)) {
                return (val.value = newValue);
            }
            return Reflect.set(target, key, newValue);
        }
    });
}
