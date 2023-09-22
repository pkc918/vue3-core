import { patch } from "./renderer";
import { VNode } from "./vnode";
import { publicInstanceProxyHandlers } from "./componentPublicInstance";
import { initProps } from "./componentProps";
import { shallowReadonly } from "../reactivity/reactive";
import { emit } from "./componentEmit";

export interface ComponentInstance {
    vnode: VNode;
    type: any;
    setupState: object;
    props: object;
    proxy?: object;
    render?: Function;
    emit: (eventName: string, ...args: any[]) => void;
}

export function createComponentInstance(vnode: VNode): ComponentInstance {
    const component: ComponentInstance = {
        vnode,
        type: vnode.type,
        setupState: {},
        props: {},
        emit: () => {}
    }
    component.emit = emit.bind(null, component)
    return component;
}

export function setupComponent(instance: ComponentInstance) {
    //TODO
    /*
    * initSlots
    * */
    initProps(instance, instance.vnode.props);
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
        const setupResult = setup(shallowReadonly(instance.props), {
            emit: instance.emit
        });
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
