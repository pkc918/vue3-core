import { createRenderer } from "../runtime-core";

function createElement(type: any): any {
    return document.createElement(type);
}

function patchProp(ele: any, key: any, value: any) {
    const isOn = (eventName: string) => /^on[A-Z]/.test(eventName);
    if (isOn(key)) {
        const eventName = key.slice(2).toLowerCase();
        ele.addEventListener(eventName, value);
    } else {
        ele.setAttribute(key, value);
    }
}

function insert(ele: any, parent: any) {
    parent.append(ele);
}

const renderer = createRenderer({
    createElement,
    patchProp,
    insert
});

export function createApp(rootComponent: any) {
    return renderer.createApp(rootComponent);
}

export * from "../runtime-core";
