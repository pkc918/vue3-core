export const extend = Object.assign;

export const isObject = (val: any) => {
    return val !== null && typeof val === "object";
};


export function hasChange(val: any, newVal: any) {
    return !Object.is(val, newVal);
}
