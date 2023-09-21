import { createComponentInstance, setupComponent, setupRenderEffect } from "./components";
import { VNode } from "./vnode";
import { ShapeFlags } from "../shared/shapeFlags";

export function render(vnode: VNode, container: any) {
    patch(vnode, container);
}

export function patch(vnode: VNode, container: any) {
    console.log(vnode.type);

    if (vnode.shapeFlag & ShapeFlags.ELEMENT) {
        processElement(vnode, container);
    } else if (vnode.shapeFlag & ShapeFlags.STATEFUL_COMPONENT) {
        processComponent(vnode, container);
    }
}

function processElement(vnode: VNode, container: any) {
    mountElement(vnode, container);
}

function mountElement(vnode: VNode, container: any) {
    const {type, props, children} = vnode;
    const ele = (vnode.el = document.createElement(type));
    for (const propsKey in props) {
        ele.setAttribute(propsKey, Reflect.get(props, propsKey));
    }
    if (vnode.shapeFlag & ShapeFlags.TEXT_CHILDREN) {
        ele.append(children);
    } else if (vnode.shapeFlag & ShapeFlags.ARRAY_CHILDREN) {
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

function mountComponent(initialVNode: VNode, container: any) {
    const instance = createComponentInstance(initialVNode);
    setupComponent(instance);
    setupRenderEffect(instance, container);
}


