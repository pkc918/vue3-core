import { createVNode, VNode } from "./vnode";


export function createAppAPI(render: (vnode: VNode, container: any) => void) {
    return function createApp(rootComponent: any) {
        return {
            mount(rootContainer: any) {
                const vnode = createVNode(rootComponent);
                render(vnode, rootContainer);
            }
        }
    }
}

