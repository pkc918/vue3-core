import { createRenderer } from "../runtime-core";

function createElement(type: any): any {
    return document.createElement(type);
}

function patchProp(ele: any, key: any, oldProp: any, newProp: any) {
    const isOn = (eventName: string) => /^on[A-Z]/.test(eventName);
    if (isOn(key)) {
        const eventName = key.slice(2).toLowerCase();
        ele.addEventListener(eventName, newProp);
    } else {
        if (newProp) {
            ele.setAttribute(key, newProp);
        } else {
            ele.removeAttribute(key);
        }
    }
}

function insert(ele: any, parent: any) {
    parent.append(ele);
}

function remove(ele: any) {
    const parentNode = ele.parentNode;
    if (parentNode) {
        parentNode.removeChild(ele);
    }
}

function setElementText(ele: any, text: string) {
    ele.textContent = text;
}

const renderer = createRenderer({
    createElement,
    patchProp,
    insert,
    remove,
    setElementText
});

export function createApp(rootComponent: any) {
    return renderer.createApp(rootComponent);
}

export * from "../runtime-core";
