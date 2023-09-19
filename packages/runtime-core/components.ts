import { patch } from "./renderer";
import { VNode } from "./vnode";
import { publicInstanceProxyHandlers } from "./componentPublicInstance";

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
    instance.vnode.el = subTree.el;
}

function setupStatefulComponent(instance: ComponentInstance) {
    const Component = instance.type;
    instance.proxy = new Proxy({_: instance}, publicInstanceProxyHandlers);
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
