import { createVNode } from "../vnode";
import { Fragment } from "../../shared/shapeFlags";

export function renderSlots(slots: object, slotName: string | symbol, props: object) {
    const slot = Reflect.get(slots, slotName);
    if (slot) {
        if (typeof slot === "function") {
            return createVNode(Fragment, {}, slot(props));
        }
    }
}
