import { ParentComponent } from "./renderer";
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
    provides: object;
    parent?: ParentComponent;
}

export function createComponentInstance(vnode: VNode, parent: ParentComponent): ComponentInstance {
    const component: ComponentInstance = {
        vnode,
        type: vnode.type,
        setupState: {},
        props: {},
        slots: {},
        provides: parent ? parent.provides : {}, // provides 的初始化的值一定是 parent，只是第一层的时候没有parent所以是空对象
        parent,
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
