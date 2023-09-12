import { describe, expect, it } from "vitest";
import { isProxy, isReactive, reactive } from "../reactive";

describe("test: reactive", () => {
    it('should access', () => {
        const original = {foo: 1};
        const proxyData = reactive(original);
        expect(original).not.toBe(proxyData);
        expect(original.foo).toBe(1);
        expect(isReactive(proxyData)).toBe(true);
        expect(isProxy(proxyData)).toBe(true);
    });

    it("should deep reactive", () => {
        const original = {
            nested: {
                val: 1
            },
            ary: [{val: 2}]
        };
        const observed = reactive(original);
        expect(isReactive(observed)).toBe(true);
        expect(isReactive(observed.nested)).toBe(true);
        expect(isReactive(observed.ary)).toBe(true);
        expect(isReactive(observed.ary[0])).toBe(true);
    });
});
