import { describe, expect, test, vi } from "vitest";
import { ref } from "../ref";
import { effect } from "../effect";

describe("test: ref", () => {
    test("ref basic usage", () => {
        const original = ref(1);
        expect(original.value).toBe(1);
    });

    test("should be reactive", () => {
        const mockFn = vi.fn();
        let dummy: any;
        const original = ref(1);
        effect(() => {
            mockFn();
            dummy = original.value;
        });
        expect(mockFn).toBeCalledTimes(1);
        expect(dummy).toBe(1);
        original.value = 2;
        expect(mockFn).toBeCalledTimes(2);
        expect(dummy).toBe(2);
        original.value = 2;
        expect(mockFn).toBeCalledTimes(2);
        expect(dummy).toBe(2);
    });

    test("should make nested properties reactive", () => {
        const origin = ref({
            val: 1
        });
        let dummy: any;
        effect(() => {
            dummy = origin.value.val;
        });
        expect(dummy).toBe(1);
        origin.value.val = 2;
        expect(dummy).toBe(2);
        origin.value = {
            val: 3
        };
        expect(dummy).toBe(3);
    });
});
