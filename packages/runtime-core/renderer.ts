import { createComponentInstance, setupComponent, setupRenderEffect } from "./components";

export function render(vnode: {}, container) {
    patch(vnode, container);
}

export function patch(vnode, container) {
    processComponent(vnode, container);
}

export function processComponent(vnode: {}, container) {
    mountComponent(vnode, container);
}

function mountComponent(vnode, container) {
    const instance = createComponentInstance(vnode);
    setupComponent(instance);
    setupRenderEffect(instance, container);
}


