import { ComponentInstance, createComponentInstance, setupComponent } from "./components";
import { VNode } from "./vnode";
import { EMPTY_OBJ, Fragment, ShapeFlags, Text } from "../shared/shapeFlags";
import { createAppAPI } from "./createApp";
import { effect } from "../reactivity/effect";

export type ParentComponent = ComponentInstance | null

interface RendererOptions {
    createElement: (type: any) => any,
    patchProp: (ele: any, key: any, oldValue: any, newValue: any) => void,
    insert: (ele: any, parent: any, anchor: any) => void,
    remove: (ele: any) => void,
    setElementText: (container: any, text: any) => void
}

export function createRenderer(options: RendererOptions) {
    const {
        createElement: hostCreateElement,
        patchProp: hostPatchProp,
        insert: hostInsert,
        remove: hostRemove,
        setElementText: hostSetElementText
    } = options;

    function render(vnode: VNode, container: any) {
        patch(null, vnode, container, null, null);
    }

    function patch(n1: VNode | null, n2: VNode, container: any, parentComponent: ParentComponent, anchor: any) {
        console.log("type", n2.type);
        const {type} = n2;
        switch (type) {
            case Fragment:
                processFragment(n1, n2, container, parentComponent, anchor);
                break;
            case Text:
                processText(n1, n2, container);
                break;
            default:
                if (n2.shapeFlag & ShapeFlags.ELEMENT) {
                    processElement(n1, n2, container, parentComponent, anchor);
                } else if (n2.shapeFlag & ShapeFlags.STATEFUL_COMPONENT) {
                    processComponent(n1, n2, container, parentComponent, anchor);
                }
        }
    }

    function processElement(n1: VNode | null, n2: VNode, container: any, parentComponent: ParentComponent, anchor: any) {
        if (!n1) {
            mountElement(n2, container, parentComponent, anchor);
        } else {
            patchElement(n1, n2, container, parentComponent, anchor);
        }
    }

    function patchElement(n1: VNode, n2: VNode, container: any, parentComponent: ComponentInstance | null, anchor: any) {
        console.log("updateElement");
        console.log("current: ", n2);
        console.log("prevent: ", n1);
        console.log(container, parentComponent);
        // patchProps
        const oldProps = n1.props || EMPTY_OBJ;
        const newProps = n2.props || EMPTY_OBJ;
        const el = (n2.el = n1.el);
        patchChildren(n1, n2, el, parentComponent, anchor);
        patchProps(el, oldProps, newProps);
    }

    function patchChildren(n1: VNode, n2: VNode, container: any, parentComponent: any, anchor: any) {
        /*
        * text -> text
        * array -> text
        * text -> array
        * array -> array
        * */
        if (n2.shapeFlag & ShapeFlags.TEXT_CHILDREN) {
            if (n1.shapeFlag & ShapeFlags.ARRAY_CHILDREN) {
                // 1. 清空n1children
                // 2. 设置n2children
                unmountChildren(n1.children);
            }
            // 在 text -> text，array -> text 都能进入这个逻辑
            if (n1.children !== n2.children) {
                hostSetElementText(container, n2.children);
            }
        } else if (n2.shapeFlag & ShapeFlags.ARRAY_CHILDREN) {
            if (n1.shapeFlag & ShapeFlags.TEXT_CHILDREN) {
                hostSetElementText(container, "");
                mountChildren(n2.children, container, parentComponent, anchor);
            } else {
                patchKeyedChildren(n1.children, n2.children, container, parentComponent, anchor);
            }
        }
    }

    function patchKeyedChildren(c1: VNode[], c2: VNode[], container: any, parentComponent: any, parentAnchor: any) {
        function isSomeVNodeType(n1: VNode, n2: VNode) {
            return n1.type === n2.type && n1.key === n2.key;
        }

        // left
        let e1 = c1.length - 1;
        let l2 = c2.length;
        let e2 = l2 - 1;
        let i = 0;
        while (i <= e1 && i <= e2) {
            let n1 = c1[i];
            let n2 = c2[i];
            if (isSomeVNodeType(n1, n2)) {
                patch(n1, n2, container, parentComponent, parentAnchor);
            } else {
                break;
            }
            i++;
        }

        // right
        while (i <= e1 && i <= e2) {
            let n1 = c1[e1];
            let n2 = c2[e2];
            if (isSomeVNodeType(n1, n2)) {
                patch(n1, n2, container, parentComponent, parentAnchor);
            } else {
                break;
            }
            e1--;
            e2--;
        }

        // new children length > old children length
        if (i > e1) {
            if (i <= e2) {
                const nextPos = e2 + 1;
                const anchor = (nextPos >= l2) ? null : c2[nextPos].el;
                while (i <= e2) {
                    patch(null, c2[i], container, parentComponent, anchor);
                    i++;
                }
            }
        } else if (i > e2) {
            // cab -> ab
            while (i <= e1) {
                hostRemove(c1[i].el);
                i++;
            }
        } else {
            const s1 = i;
            const s2 = i;
            let newIndex: null | number = null;
            let patched = 0;
            const toBePatched = e2 - s2 + 1;
            let moved = false;
            let maxNewIndex = 0;

            const keyToNewIndexMap = new Map();
            for (let i = s2; i <= e2; i++) {
                const newChild = c2[i];
                keyToNewIndexMap.set(newChild.key, i);
            }

            // 建立一个对应新数组需要移动的地方的值，value是对应旧数组中移动区域的各元素的位置
            const newIndexToOldIndexMap = new Array(toBePatched);
            // 初始值为 0，最后可以判断如果是0，那就需要新建节点，否则都只需要移动
            for (let i = 0; i < toBePatched; i++) {
                newIndexToOldIndexMap[i] = 0;
            }

            for (let i = s1; i <= e1; i++) {
                const preChild = c1[i];

                if (patched >= toBePatched) {
                    hostRemove(preChild.el);
                    continue;
                }

                if (preChild.key) {
                    newIndex = keyToNewIndexMap.get(preChild.key);
                } else {
                    for (let j = s2; j <= e2; j++) {
                        if (isSomeVNodeType(preChild, c2[j])) {
                            newIndex = j;
                        }
                    }
                }

                if (!newIndex) {
                    hostRemove(preChild.el);
                } else {
                    /*
                    * 首先，它是按照老节点顺序查找，由小到大，如果不是，那就说明该节点需要移动，否则不需要
                    */
                    if (newIndex >= maxNewIndex) {
                        maxNewIndex = newIndex;
                    } else {
                        moved = true;
                    }
                    // 当前找到的下表是 newIndex，但是需要对应到从0开始，所以需要减去前面相同部分，归0
                    // 赋的值是当前 i，因为 0 有特殊含义，所以需要 +1
                    newIndexToOldIndexMap[newIndex - s2] = i + 1;
                    patch(preChild, c2[newIndex], container, parentComponent, null);
                    patched++;
                }
            }

            // 返回最长连续子串
            const increasingNewIndexSequence = getSequence(newIndexToOldIndexMap) || [];
            let sequenceIndex = increasingNewIndexSequence.length - 1;
            for (let j = toBePatched - 1; j >= 0; j--) {
                const currentReallyIndex = j + s2; // 得到当前循环的位置的真实对应新节点中的位置
                const currentChild = c2[currentReallyIndex];
                const anchor = currentReallyIndex + 1 < l2 ? c2[currentReallyIndex + 1].el : null;

                if (newIndexToOldIndexMap[j] === 0) {
                    // 说明旧无，新有的节点
                    patch(null, currentChild, container, parentComponent, anchor);
                } else if (moved) {
                    // increasingNewIndexSequence 存储的是最长连续字串的下标，
                    // 所以当 j 和 increasingNewIndexSequence对应位置（比如j是最后一个元素，那么对比的increasing...里面也是最后一个元素）的值相同时，
                    // 就说明存在节点
                    if (sequenceIndex < 0 || j !== increasingNewIndexSequence[sequenceIndex]) {
                        // 有值且不相等的时候，就是需要移动了
                        hostInsert(currentChild.el, container, anchor);
                    } else {
                        // 相同的时候说明，位置和元素都是没问题的，不用处理，继续下一个
                        sequenceIndex--;
                    }
                }
            }
        }
    }

    function unmountChildren(children: VNode[]) {
        for (let i = 0; i < children.length; i++) {
            hostRemove(children[i].el);
        }
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

    function processComponent(n1: VNode | null, n2: VNode, container: any, parentComponent: ParentComponent, anchor: any) {
        mountComponent(n2, container, parentComponent, anchor);
    }

    function processFragment(n1: VNode | null, n2: VNode, container: any, parentComponent: ParentComponent, anchor: any) {
        mountChildren(n2.children, container, parentComponent, anchor);
    }

    function processText(n1: VNode | null, n2: VNode, container: any) {
        mountText(n1, n2, container);
    }

    function mountElement(vnode: VNode, container: any, parentComponent: ParentComponent, anchor: any) {
        const {type, props, children} = vnode;
        const ele = (vnode.el = hostCreateElement(type));
        for (const propsKey in props) {
            const customEvent = Reflect.get(props, propsKey);
            hostPatchProp(ele, propsKey, null, customEvent);
        }
        if (vnode.shapeFlag & ShapeFlags.TEXT_CHILDREN) {
            ele.append(children);
        } else if (vnode.shapeFlag & ShapeFlags.ARRAY_CHILDREN) {
            mountChildren(vnode.children, ele, parentComponent, anchor);
        }
        hostInsert(ele, container, anchor);
    }

    function mountComponent(initialVNode: VNode, container: any, parentComponent: ParentComponent, anchor: any) {
        const instance = createComponentInstance(initialVNode, parentComponent);
        setupComponent(instance);
        setupRenderEffect(instance, container, anchor);
    }

    function mountChildren(children: VNode[], container: any, parentComponent: ParentComponent, anchor: any) {
        children.map((child: any) => {
            patch(null, child, container, parentComponent, anchor);
        });
    }

    function mountText(n1: VNode | null, n2: VNode, container: any) {
        const {children} = n2;
        const textNode = document.createTextNode(children);
        container.append(textNode);
    }


    function setupRenderEffect(instance: ComponentInstance, container: any, anchor: any) {
        effect(() => {
            if (!instance.isMounted) {
                const subTree = (instance.subTree = instance.render?.call(instance.proxy));
                patch(null, subTree, container, instance, anchor);
                instance.vnode.el = subTree.el;
                instance.isMounted = true;
            } else {
                const subTree = instance.render?.call(instance.proxy);
                const prevSubTree = instance.subTree;
                instance.subTree = subTree;
                patch(prevSubTree, subTree, container, instance, anchor);
            }
        });
    }

    function getSequence(arr: number[]): number[] {
        const p = arr.slice();
        const result = [0];
        let i: number, j: number, u: number, v: number, c: number;
        const len = arr.length;
        for (i = 0; i < len; i++) {
            const arrI = arr[i];
            if (arrI !== 0) {
                j = result[result.length - 1];
                if (arr[j] < arrI) {
                    p[i] = j;
                    result.push(i);
                    continue;
                }
                u = 0;
                v = result.length - 1;
                while (u < v) {
                    c = (u + v) >> 1;
                    if (arr[result[c]] < arrI) {
                        u = c + 1;
                    } else {
                        v = c;
                    }
                }
                if (arrI < arr[result[u]]) {
                    if (u > 0) {
                        p[i] = result[u - 1];
                    }
                    result[u] = i;
                }
            }
        }
        u = result.length;
        v = result[u - 1];
        while (u-- > 0) {
            result[u] = v;
            v = p[v];
        }
        return result;
    }

    return {
        createApp: createAppAPI(render)
    };
}
