export type Deps = Set<ReactiveEffect>
export type DepMap = Map<string | symbol, Deps>
export type Bucket = WeakMap<object, DepMap>

export interface EffectOption {
    scheduler?: Function;
}

interface RunnerType {
    effect?: ReactiveEffect;

    (): any;
}

let activeEffect: ReactiveEffect;

class ReactiveEffect {
    public depsAry: Deps[] = [];
    public _scheduler?: Function;
    private readonly _fn: Function;

    constructor(fn: Function, scheduler?: Function) {
        this._fn = fn;
        this._scheduler = scheduler;
    }

    run() {
        activeEffect = this;
        return this._fn();
    }

    stop() {
        this.depsAry.forEach(deps => {
            deps.delete(this);
        });
    }
}

export function effect(fn: Function, options: EffectOption = {}) {
    const _effect = new ReactiveEffect(fn, options.scheduler);
    _effect.run();
    const runner: RunnerType = _effect.run.bind(_effect);
    runner.effect = _effect;
    return runner;
}


export function stop(runner: RunnerType) {
    runner.effect?.stop();
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
    if (!activeEffect) return;
    deps.add(activeEffect);
    activeEffect.depsAry.push(deps);
}

export function trigger(target: object, key: string | symbol) {
    const depMap = bucket.get(target);
    if (!depMap) return;
    const deps = depMap.get(key);
    deps && deps.forEach(effect => {
        if (effect._scheduler) {
            return effect._scheduler();
        }
        effect.run();
    });
}
