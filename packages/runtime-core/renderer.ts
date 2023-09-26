import { ComponentInstance, createComponentInstance, setupComponent, setupRenderEffect } from "./components";
import { VNode } from "./vnode";
import { Fragment, Text, ShapeFlags } from "../shared/shapeFlags";

export type ParentComponent = ComponentInstance | null

export function render(vnode: VNode, container: any) {
    patch(vnode, container, null);
}

export function patch(vnode: VNode, container: any, parentComponent: ParentComponent) {
    console.log("type", vnode.type);
    const {type} = vnode;
    switch (type) {
        case Fragment:
            processFragment(vnode, container, parentComponent);
            break;
        case Text:
            processText(vnode, container);
            break;
        default:
            if (vnode.shapeFlag & ShapeFlags.ELEMENT) {
                processElement(vnode, container, parentComponent);
            } else if (vnode.shapeFlag & ShapeFlags.STATEFUL_COMPONENT) {
                processComponent(vnode, container, parentComponent);
            }
    }
}

function processElement(vnode: VNode, container: any, parentComponent: ParentComponent) {
    mountElement(vnode, container, parentComponent);
}

function processComponent(vnode: VNode, container: any, parentComponent: ParentComponent) {
    mountComponent(vnode, container, parentComponent);
}

function processFragment(vnode: VNode, container: any, parentComponent: ParentComponent) {
    mountChildren(vnode, container, parentComponent);
}

function processText(vnode: VNode, container: any) {
    mountText(vnode, container);
}

function mountElement(vnode: VNode, container: any, parentComponent: ParentComponent) {
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
        mountChildren(vnode, ele, parentComponent);
    }
    container.append(ele);
}

function mountComponent(initialVNode: VNode, container: any, parentComponent: ParentComponent) {
    const instance = createComponentInstance(initialVNode, parentComponent);
    setupComponent(instance);
    setupRenderEffect(instance, container);
}

function mountChildren(vnode: VNode, container: any, parentComponent: ParentComponent) {
    vnode.children.map((child: any) => {
        patch(child, container, parentComponent);
    });
}

function mountText(vnode: VNode, container: any) {
    const {children} = vnode;
    const textNode = document.createTextNode(children);
    container.append(textNode);
}
