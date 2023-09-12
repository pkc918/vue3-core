import { describe, expect, test, vi } from "vitest";
import { isProxy, isReadonly, readonly } from "../reactive";

describe("test: readonly", () => {
    test("base usage", () => {
        const original = {
            val: 1,
            nested: {val: 2},
            ary: [{val: 3}]
        };
        const wrapped = readonly(original);
        expect(wrapped).not.toBe(original);
        expect(wrapped.val).toBe(1);
        expect(isReadonly(original)).toBe(false);
        expect(isReadonly(wrapped)).toBe(true);
        expect(isReadonly(wrapped.nested)).toBe(true);
        expect(isReadonly(wrapped.ary)).toBe(true);
        expect(isReadonly(wrapped.ary[0])).toBe(true);
        expect(isProxy(wrapped)).toBe(true);
    });

    test("warn when call set", () => {
        console.warn = vi.fn();
        const original = readonly({
            val: 1
        });
        original.val++;
        expect(console.warn).toBeCalled();
    });
});
