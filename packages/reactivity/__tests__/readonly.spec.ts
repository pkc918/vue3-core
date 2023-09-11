import { describe, expect, test, vi } from "vitest";
import { isReadonly, readonly } from "../reactive";

describe("test: readonly", () => {
    test("base usage", () => {
        const original = {
            val: 1
        };
        const wrapped = readonly(original);
        expect(wrapped).not.toBe(original);
        expect(wrapped.val).toBe(1);
        expect(isReadonly(original)).toBe(false);
        expect(isReadonly(wrapped)).toBe(true);
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
