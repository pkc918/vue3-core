import { getCurrentInstance } from "./components";

export function provide(key: string | symbol, value: any) {
    const currentInstance = getCurrentInstance();
    if (currentInstance) {
        let {provides} = currentInstance;
        const parentProvides = currentInstance.parent?.provides as object;
        // 这两个值相等说明是第一次走这个逻辑，走完这个逻辑后，会修改 provides 的值，也就是初始化的过程
        if (provides === parentProvides) {
            provides = currentInstance.provides = Object.create(parentProvides); // 一个原型连接到 parentProvides 上的空对象
        }
        provides[key] = value;
    }
}

export function inject(key: string | symbol, defaultVal: any) {
    const currentInstance = getCurrentInstance();
    if (currentInstance) {
        const parentProvides = currentInstance.parent?.provides as object;
        if (key in parentProvides) {
            return parentProvides[key];
        }
        // 当没有 provides 这个属性的时候，可以给属性设置一个初始值
        if (defaultVal) {
            if (typeof defaultVal === "function") {
                return defaultVal();
            }
            return defaultVal;
        }
    }
}
