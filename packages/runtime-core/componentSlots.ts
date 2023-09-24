import { ComponentInstance } from "./components";

export function initSlots(instance: ComponentInstance, children: any) {
    normalizeObjectSlots(children, instance.slots);
}

function normalizeObjectSlots(children: any, slots: any) {
    console.log("children", children);
    for (const key in children) {
        const value = children[key];
        slots[key] = normalizeSlotValue(value);
    }
}

function normalizeSlotValue(value: any) {
    return Array.isArray(value) ? value : [value];
}
