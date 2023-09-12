export const extend = Object.assign;

export const isObject = (val: Object) => {
    return val !== null && typeof val === "object";
};
