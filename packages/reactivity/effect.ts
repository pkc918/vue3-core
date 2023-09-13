import { extend } from "../shared";

export type Deps = Set<ReactiveEffect>
export type DepMap = Map<PropertyKey, Deps>
export type Bucket = WeakMap<Object, DepMap>

export interface EffectOption {
    scheduler?: Function;
    onStop?: Function;
}

interface RunnerType {
    effect?: ReactiveEffect;
    (): any;
}

let activeEffect: ReactiveEffect;
let shouldTrack: Boolean;

class ReactiveEffect {
    public depsAry: Deps[] = [];
    public onStop?: Function;
    public _scheduler?: Function;
    public active: Boolean = true;
    private readonly _fn: Function;

    constructor(fn: Function, scheduler?: Function) {
        this._fn = fn;
        this._scheduler = scheduler;
    }

    run() {
        if (!this.active){
            // after trigger stop
            return this._fn();
        }
        // open track effect
        shouldTrack = true;
        activeEffect = this;
        const res = this._fn();
        // prevent track effect after stop
        shouldTrack = false;
        return res;
    }

    stop() {
        if (this.active) {
            cleanup(this);
            if (this.onStop) {
                this.onStop();
            }
            this.active = false;
        }
    }
}

function cleanup(effect: ReactiveEffect) {
    effect.depsAry.forEach(deps => {
        deps.delete(effect);
    });
}

export function effect(fn: Function, options: EffectOption = {}) {
    let _effect = new ReactiveEffect(fn, options.scheduler);
    extend(_effect, options);
    _effect.run();
    const runner: RunnerType = _effect.run.bind(_effect);
    runner.effect = _effect;
    return runner;
}

export function stop(runner: RunnerType) {
    runner.effect?.stop();
}

const bucket: Bucket = new WeakMap();

export function isTracking() {
    return shouldTrack && activeEffect !== undefined;
}

export function track(target: Object, key: PropertyKey) {
    if (!isTracking()) return;
    let depMap = bucket.get(target);
    if (!depMap) {
        bucket.set(target, (depMap = new Map()));
    }
    let deps = depMap.get(key);
    if (!deps) {
        depMap.set(key, (deps = new Set()));
    }
    trackEffects(deps);
}

export function trackEffects(deps: Deps) {
    if (deps.has(activeEffect)) return;
    deps.add(activeEffect);
    activeEffect.depsAry.push(deps);
}

export function trigger(target: Object, key: PropertyKey) {
    const depMap = bucket.get(target);
    if (!depMap) return;
    const deps = depMap.get(key);
    triggerEffects(deps);
}

export function triggerEffects(deps: Deps | undefined) {
    deps && deps.forEach(effect => {
        if (effect._scheduler) {
            return effect._scheduler();
        }
        effect.run();
    });
}
