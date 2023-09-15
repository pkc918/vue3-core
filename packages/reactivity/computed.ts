import { ReactiveEffect } from "./effect";

class ComputedRefImpl {
    private readonly _effect: any;
    private _dirty: boolean = true;
    private _value: any;

    constructor(effect: Function) {
        this._effect = new ReactiveEffect(effect, () => {
            !this._dirty && (this._dirty = true);
        });
    }

    get value() {
        if (this._dirty) {
            this._dirty = false;
            this._value = this._effect.run();
        }
        return this._value;
    }
}

export function computed(effect: Function) {
    return new ComputedRefImpl(effect);
}
