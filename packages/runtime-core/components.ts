import { patch } from "./renderer";
import { VNode } from "./vnode";

export interface ComponentInstance {
    vnode: VNode;
    type: any;
    setupState: object;
    proxy?: object;
    render?: Function;
}

export function createComponentInstance(vnode: VNode): ComponentInstance {
    return {
        vnode,
        type: vnode.type,
        setupState: {}
    };
}

export function setupComponent(instance: ComponentInstance) {
    //TODO
    /*
    * initProps
    * initSlots
    * */
    setupStatefulComponent(instance);
}

export function setupRenderEffect(instance: ComponentInstance, container: any) {
    const subTree = instance.render?.call(instance.proxy);
    patch(subTree, container);
}

function setupStatefulComponent(instance: ComponentInstance) {
    const Component = instance.type;
    instance.proxy = new Proxy({}, {
        get(_: object, key: string | symbol): any {
            const {setupState} = instance;
            if (key in setupState) {
                return Reflect.get(setupState, key);
            }
        }
    });
    const {setup} = Component;
    if (setup) {
        const setupResult = setup();
        handleSetupResult(instance, setupResult);
    }
}

function handleSetupResult(instance: ComponentInstance, setupResult: any) {
    if (typeof setupResult === "object") {
        instance.setupState = setupResult;
    }
    finishComponentSetup(instance);
}

function finishComponentSetup(instance: ComponentInstance) {
    const Component = instance.type;
    if (Component.render) {
        instance.render = Component.render;
    }
}
