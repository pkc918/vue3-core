export type Deps = Set<ReactiveEffect>
export type DepMap = Map<string | symbol, Deps>
export type Bucket = WeakMap<object, DepMap>

let activeEffect: ReactiveEffect;

class ReactiveEffect {
    private readonly _fn: Function;

    constructor(fn: Function) {
        this._fn = fn;
    }

    run() {
        activeEffect = this;
        this._fn();
    }
}

export function effect(fn: Function) {
    const _effect = new ReactiveEffect(fn);
    _effect.run();
}

const bucket: Bucket = new WeakMap();

export function track(target: object, key: string | symbol) {
    let depMap = bucket.get(target);
    if (!depMap) {
        bucket.set(target, (depMap = new Map()));
    }
    let deps = depMap.get(key);
    if (!deps) {
        depMap.set(key, (deps = new Set()));
    }
    deps.add(activeEffect);
}

export function trigger(target: object, key: string | symbol) {
    const depMap = bucket.get(target);
    if (!depMap) return;
    const deps = depMap.get(key);
    deps && deps.forEach(effect => effect.run());
}
