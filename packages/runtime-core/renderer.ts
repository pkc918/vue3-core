import { ComponentInstance, createComponentInstance, setupComponent } from "./components";
import { VNode } from "./vnode";
import { Fragment, Text, ShapeFlags, EMPTY_OBJ } from "../shared/shapeFlags";
import { createAppAPI } from "./createApp";
import { effect } from "../reactivity/effect";

export type ParentComponent = ComponentInstance | null

interface RendererOptions {
    createElement: (type: any) => any,
    patchProp: (ele: any, key: any, oldValue: any, newValue: any) => void,
    insert: (ele: any, parent: any) => void
}

export function createRenderer(options: RendererOptions) {
    const {createElement: hostCreateElement, patchProp: hostPatchProp, insert: hostInsert} = options;

    function render(vnode: VNode, container: any) {
        patch(null, vnode, container, null);
    }

    function patch(n1: VNode | null, n2: VNode, container: any, parentComponent: ParentComponent) {
        console.log("type", n2.type);
        const {type} = n2;
        switch (type) {
            case Fragment:
                processFragment(n1, n2, container, parentComponent);
                break;
            case Text:
                processText(n1, n2, container);
                break;
            default:
                if (n2.shapeFlag & ShapeFlags.ELEMENT) {
                    processElement(n1, n2, container, parentComponent);
                } else if (n2.shapeFlag & ShapeFlags.STATEFUL_COMPONENT) {
                    processComponent(n1, n2, container, parentComponent);
                }
        }
    }

    function processElement(n1: VNode | null, n2: VNode, container: any, parentComponent: ParentComponent) {
        if (!n1) {
            mountElement(n2, container, parentComponent);
        } else {
            patchElement(n1, n2, container, parentComponent);
        }
    }

    function patchElement(n1: VNode, n2: VNode, container: any, parentComponent: ComponentInstance | null) {
        console.log("updateElement");
        console.log("current: ", n2);
        console.log("prevent: ", n1);
        console.log(container, parentComponent);
        // patchProps
        const oldProps = n1.props || EMPTY_OBJ;
        const newProps = n2.props || EMPTY_OBJ;
        const el = (n2.el = n1.el);
        patchProps(el, oldProps, newProps);
    }

    function patchProps(el: any, oldProps: any, newProps: any) {
        if (oldProps !== newProps) {
            for (const newPropsKey in newProps) {
                const oldPropValue = oldProps[newPropsKey];
                const newPropValue = newProps[newPropsKey];
                hostPatchProp(el, newPropsKey, oldPropValue, newPropValue);
            }
            if (oldProps !== EMPTY_OBJ) {
                for (const oldPropsKey in oldProps) {
                    const oldPropValue = oldProps[oldPropsKey];
                    if (!(oldPropsKey in newProps)) {
                        hostPatchProp(el, oldPropsKey, oldPropValue, null);
                    }
                }
            }

        }
    }

    function processComponent(n1: VNode | null, n2: VNode, container: any, parentComponent: ParentComponent) {
        mountComponent(n2, container, parentComponent);
    }

    function processFragment(n1: VNode | null, n2: VNode, container: any, parentComponent: ParentComponent) {
        mountChildren(n2, container, parentComponent);
    }

    function processText(n1: VNode | null, n2: VNode, container: any) {
        mountText(n1, n2, container);
    }

    function mountElement(vnode: VNode, container: any, parentComponent: ParentComponent) {
        const {type, props, children} = vnode;
        const ele = (vnode.el = hostCreateElement(type));
        for (const propsKey in props) {
            const customEvent = Reflect.get(props, propsKey);
            hostPatchProp(ele, propsKey, null, customEvent);
        }
        if (vnode.shapeFlag & ShapeFlags.TEXT_CHILDREN) {
            ele.append(children);
        } else if (vnode.shapeFlag & ShapeFlags.ARRAY_CHILDREN) {
            mountChildren(vnode, ele, parentComponent);
        }
        hostInsert(ele, container);
    }

    function mountComponent(initialVNode: VNode, container: any, parentComponent: ParentComponent) {
        const instance = createComponentInstance(initialVNode, parentComponent);
        setupComponent(instance);
        setupRenderEffect(instance, container);
    }

    function mountChildren(vnode: VNode, container: any, parentComponent: ParentComponent) {
        vnode.children.map((child: any) => {
            patch(null, child, container, parentComponent);
        });
    }

    function mountText(n1: VNode | null, n2: VNode, container: any) {
        const {children} = n2;
        const textNode = document.createTextNode(children);
        container.append(textNode);
    }


    function setupRenderEffect(instance: ComponentInstance, container: any) {
        effect(() => {
            if (!instance.isMounted) {
                const subTree = (instance.subTree = instance.render?.call(instance.proxy));
                patch(null, subTree, container, instance);
                instance.vnode.el = subTree.el;
                instance.isMounted = true;
            } else {
                const subTree = instance.render?.call(instance.proxy);
                const prevSubTree = instance.subTree;
                instance.subTree = subTree;
                patch(prevSubTree, subTree, container, instance);
            }

        });

    }

    return {
        createApp: createAppAPI(render)
    };
}
