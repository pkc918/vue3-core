import { VNode } from "./vnode";

export function shouldUpdateComponent(preVNode: VNode, nextVNode: VNode) {
    const {props: preProps} = preVNode;
    const {props: nextProps} = nextVNode;
    for (let key in nextProps) {
        if (preProps[key] !== nextProps[key]) {
            return true;
        }
    }
    return false;
}
