import { ComponentInstance } from "./components";

export interface ComponentInstancePublicProperties{
    $el: Function
}

const publicPropertiesMap: ComponentInstancePublicProperties = {
    $el: (instance: ComponentInstance) => instance.vnode.el
};
export const publicInstanceProxyHandlers = {
    get({_: instance}: any, key: string | symbol) {
        const {setupState} = instance;
        if (key in setupState) {
            return Reflect.get(setupState, key);
        }
        const publicProperties = Reflect.get(publicPropertiesMap, key);
        if (publicProperties) {
            return publicProperties(instance);
        }
    }
};
