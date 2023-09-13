import { Deps, isTracking, trackEffects, triggerEffects } from "./effect";
import { hasChange, isObject } from "../shared";
import { reactive } from "./reactive";

class RefImpl {
    private _value: any;
    private _rawValue: any;
    public readonly deps: Deps;

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
