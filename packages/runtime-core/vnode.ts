export interface VNode {
    type: any;
    props?: any;
    children?: any;
    el?: any;
}

export function createVNode(type: any, props?: undefined, children?: undefined): VNode {
    return {
        type,
        props,
        children
    };
}
