import { ComponentInstance } from "./components";
import { ShapeFlags } from "../shared/shapeFlags";

export function initSlots(instance: ComponentInstance, children: any) {
    // 不是所有 children 都是 slots
    if (instance.vnode.shapeFlag & ShapeFlags.SLOTS_CHILDREN) {
        normalizeObjectSlots(children, instance.slots);
    }
}

function normalizeObjectSlots(children: any, slots: any) {
    console.log("children", children);
    for (const key in children) {
        const value = children[key];
        slots[key] = (props: any) => normalizeSlotValue(value?.(props));
    }
}

function normalizeSlotValue(value: any) {
    return Array.isArray(value) ? value : [value];
}
