import { describe, expect, it } from "vitest";
import { reactive } from "../reactive";
import { effect } from "../effect";

describe("test: effect", () => {
    it('should access', () => {
        const user = reactive<{
            age: number
        }>({
            age: 10,
        });
        let nextAge: any;
        effect(() => {
            nextAge = user.age + 1;
        });
        expect(nextAge).toBe(11);
        user.age++;
        expect(nextAge).toBe(12);
    });
});
