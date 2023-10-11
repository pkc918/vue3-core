import { ShapeFlags, Text } from "../shared/shapeFlags";
import { ComponentInstance } from "./components";

export interface VNode {
    type: any;
    key?: any;
    component?: ComponentInstance;
    props?: any;
    children?: any;
    el?: any;
    shapeFlag: ShapeFlags;
}

export function createVNode(type: any, props?: any, children?: any): VNode {
    const vnode = {
        type,
        key: props && props.key,
        props,
        children,
        el: null,
        shapeFlag: getShapeFlag(type)
    }
    if (typeof children === "string") {
        vnode.shapeFlag |= ShapeFlags.TEXT_CHILDREN;
    } else if (Array.isArray(children)) {
        vnode.shapeFlag |= ShapeFlags.ARRAY_CHILDREN;
    }

    // 当本身是组件，且 children 是 object 时, 该 children 是 slots
    if (vnode.shapeFlag & ShapeFlags.STATEFUL_COMPONENT) {
        if (typeof children === "object") {
            vnode.shapeFlag |= ShapeFlags.SLOTS_CHILDREN;
        }
    }

    return vnode;
}

export function createTextVNode(text: string) {
    return createVNode(Text, {}, text);
}

function getShapeFlag(type: any) {
    return typeof type === "string" ? ShapeFlags.ELEMENT : ShapeFlags.STATEFUL_COMPONENT;
}
