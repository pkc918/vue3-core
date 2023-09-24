import { createComponentInstance, setupComponent, setupRenderEffect } from "./components";
import { VNode } from "./vnode";
import { Fragment, Text, ShapeFlags } from "../shared/shapeFlags";

export function render(vnode: VNode, container: any) {
    patch(vnode, container);
}

export function patch(vnode: VNode, container: any) {
    console.log("type", vnode.type);
    const {type} = vnode;
    switch (type) {
        case Fragment:
            processFragment(vnode, container);
            break;
        case Text:
            processText(vnode, container);
            break;
        default:
            if (vnode.shapeFlag & ShapeFlags.ELEMENT) {
                processElement(vnode, container);
            } else if (vnode.shapeFlag & ShapeFlags.STATEFUL_COMPONENT) {
                processComponent(vnode, container);
            }
    }


}

function processElement(vnode: VNode, container: any) {
    mountElement(vnode, container);
}

function processComponent(vnode: VNode, container: any) {
    mountComponent(vnode, container);
}

function processFragment(vnode: VNode, container: any) {
    mountChildren(vnode, container);
}

function processText(vnode: VNode, container: any) {
    mountText(vnode, container);
}

function mountElement(vnode: VNode, container: any) {
    const {type, props, children} = vnode;
    const ele = (vnode.el = document.createElement(type));
    for (const propsKey in props) {
        const customEvent = props[propsKey];
        const isOn = (eventName: string) => /^on[A-Z]/.test(eventName);
        if (isOn(propsKey)) {
            const eventName = propsKey.slice(2).toLowerCase();
            ele.addEventListener(eventName, customEvent);
        } else {
            ele.setAttribute(propsKey, Reflect.get(props, propsKey));
        }
    }
    if (vnode.shapeFlag & ShapeFlags.TEXT_CHILDREN) {
        ele.append(children);
    } else if (vnode.shapeFlag & ShapeFlags.ARRAY_CHILDREN) {
        mountChildren(vnode, ele);
    }
    container.append(ele);
}

function mountComponent(initialVNode: VNode, container: any) {
    const instance = createComponentInstance(initialVNode);
    setupComponent(instance);
    setupRenderEffect(instance, container);
}

function mountChildren(vnode: VNode, container: any) {
    vnode.children.map((child: any) => {
        patch(child, container);
    });
}

function mountText(vnode: VNode, container: any) {
    const {children} = vnode;
    const textNode = document.createTextNode(children);
    container.append(textNode);
}
