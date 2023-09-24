import { createVNode } from "../vnode";

export function renderSlots(slots: object, slotName: string | symbol, props: object) {
    const slot = Reflect.get(slots, slotName);
    if (slot) {
        if (typeof slot === "function") {
            return createVNode("div", {}, slot(props));
        }
    }
}
