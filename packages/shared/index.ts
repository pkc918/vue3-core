export const extend = Object.assign;

export const isObject = (val: any) => {
    return val !== null && typeof val === "object";
};

export function hasChange(val: any, newVal: any) {
    return !Object.is(val, newVal);
}

export function hasOwn(target: object, key: any) {
    return Object.prototype.hasOwnProperty.call(target, key);
}

export function camelize(eventName: string) {
    return eventName.replace(/-(\w)/g, (_, word: string) => {
        return word ? word.toUpperCase() : "";
    });
}

export function capitalize(eventName: string) {
    return eventName.charAt(0).toUpperCase() + eventName.slice(1);
}

export function toHandlerKey(eventName: string) {
    return eventName ? `on${capitalize(eventName)}` : "";
}
