import { createComponentInstance, setupComponent, setupRenderEffect } from "./components";
import { isObject } from "../shared";
import { VNode } from "./vnode";

export function render(vnode: VNode, container: any) {
    patch(vnode, container);
}

export function patch(vnode: VNode, container: any) {
    console.log(vnode.type);
    if (typeof vnode.type === "string") {
        processElement(vnode, container);
    } else if (isObject(vnode.type)) {
        processComponent(vnode, container);
    }
}

function processElement(vnode: VNode, container: any) {
    mountElement(vnode, container);
}

function mountElement(vnode: VNode, container: any) {
    const {type, props, children} = vnode;
    const ele = document.createElement(type);
    for (const propsKey in props) {
        ele.setAttribute(propsKey, Reflect.get(props, propsKey));
    }
    if (typeof children === "string") {
        ele.append(children);
    } else if (Array.isArray(children)) {
        mountChildren(vnode, ele);
    }
    container.append(ele);
}

function mountChildren(vnode: VNode, container: any) {
    vnode.children.map((child: any) => {
        patch(child, container);
    });
}

function processComponent(vnode: VNode, container: any) {
    mountComponent(vnode, container);
}

function mountComponent(vnode: VNode, container: any) {
    const instance = createComponentInstance(vnode);
    setupComponent(instance);
    setupRenderEffect(instance, container);
}


