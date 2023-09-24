import { createVNode } from "../vnode";

export function renderSlots(slots, slotName) {
    const slot = Reflect.get(slots, slotName);
    if (slot) {
        return createVNode("div", {}, slot);
    }
}
