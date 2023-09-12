import { describe, expect, test, vi } from "vitest";
import { isReadonly, shallowReadonly } from "../reactive";

describe("test: shallowReadonly", () => {
    test("should not make non-reactive properties reactive", () => {
        const prop = shallowReadonly({user: {val: 1}});
        expect(isReadonly(prop)).toBe(true);
        expect(isReadonly(prop.user)).toBe(false);
    });

    test("warn when call set", () => {
        console.warn = vi.fn();
        const original = shallowReadonly({
            val: 1
        });
        original.val++;
        expect(console.warn).toBeCalled();
    });
});
