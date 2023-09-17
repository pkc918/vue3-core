import { createComponentInstance, setupComponent, setupRenderEffect } from "./components";
import { isObject } from "../shared";

export function render(vnode: {}, container) {
    patch(vnode, container);
}

export function patch(vnode, container) {
    console.log(vnode.type);
    if (typeof vnode.type === "string") {
        processElement(vnode, container);
    } else if (isObject(vnode.type)) {
        processComponent(vnode, container);
    }
}

function processElement(vnode, container) {
    mountElement(vnode, container);
}

function mountElement(vnode, container) {
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

function mountChildren(vnode, container) {
    vnode.children.map((child) => {
        patch(child, container);
    });
}

function processComponent(vnode: {}, container) {
    mountComponent(vnode, container);
}

function mountComponent(vnode, container) {
    const instance = createComponentInstance(vnode);
    setupComponent(instance);
    setupRenderEffect(instance, container);
}


