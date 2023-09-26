import { patch } from "./renderer";
import { VNode } from "./vnode";
import { publicInstanceProxyHandlers } from "./componentPublicInstance";
import { initProps } from "./componentProps";
import { shallowReadonly } from "../reactivity/reactive";
import { emit } from "./componentEmit";
import { initSlots } from "./componentSlots";

export interface ComponentInstance {
    vnode: VNode;
    type: any;
    setupState: object;
    props: object;
    proxy?: object;
    render?: Function;
    emit: (eventName: string, ...args: any[]) => void;
    slots: object;
}

export function createComponentInstance(vnode: VNode): ComponentInstance {
    const component: ComponentInstance = {
        vnode,
        type: vnode.type,
        setupState: {},
        props: {},
        slots: {},
        emit: () => {}
    }
    component.emit = emit.bind(null, component)
    return component;
}

export function setupComponent(instance: ComponentInstance) {
    initProps(instance, instance.vnode.props);
    initSlots(instance, instance.vnode.children);
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
        setCurrentInstance(instance);
        // 这里执行完成组件的 setup 函数
        /*
        * getCurrentInstance()
        */
        const setupResult = setup(shallowReadonly(instance.props), {
            emit: instance.emit
        });
        setCurrentInstance(null);
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

type CurrentInstance = ComponentInstance | null
let currentInstance: CurrentInstance = null;

export function getCurrentInstance() {
    return currentInstance;
}

function setCurrentInstance(instance: CurrentInstance) {
    currentInstance = instance;
}
