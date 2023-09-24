import { ComponentInstance } from "./components";
import { hasOwn } from "../shared";

export interface ComponentInstancePublicProperties{
    $el: Function;
    $slots: Function;
}

const publicPropertiesMap: ComponentInstancePublicProperties = {
    $el: (instance: ComponentInstance) => instance.vnode.el,
    $slots: (instance: ComponentInstance) => instance.slots
};
export const publicInstanceProxyHandlers = {
    get({_: instance}: any, key: string | symbol) {

        const {setupState, props} = instance;
        if (hasOwn(setupState, key)) {
            return Reflect.get(setupState, key);
        } else if (hasOwn(props, key)) {
            return Reflect.get(props, key);
        }
        const publicProperties = Reflect.get(publicPropertiesMap, key);
        if (publicProperties) {
            return publicProperties(instance);
        }
    }
};
