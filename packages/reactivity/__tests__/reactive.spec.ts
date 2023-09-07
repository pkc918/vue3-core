import { describe, expect, it } from "vitest";
import { reactive } from "../reactive";

describe("test: reactive", () => {
    it('should access', () => {
        const original = {foo: 1};
        const proxyData = reactive(original);
        expect(original).not.toBe(proxyData);
        expect(original.foo).toBe(1);
    });
});
