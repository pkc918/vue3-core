import { describe, expect, test, vi } from "vitest";
import { computed } from "../computed";
import { reactive } from "../reactive";

describe("test: computed", () => {
    test("computed basic usage", () => {
        const mockFn = vi.fn(() => {
            return obj.age;
        });
        const obj = reactive({
            age: 1
        });
        const original = computed(mockFn);
        expect(original.value).toBe(1);
        expect(mockFn).toBeCalled();
    });

    test("computed lazy usage", () => {
        const mockFn = vi.fn(() => {
            return obj.age;
        });
        const obj = reactive({
            age: 1
        });
        const original = computed(mockFn);
        expect(original.value).toBe(1);
        expect(mockFn).toBeCalledTimes(1);
        original.value;
        expect(mockFn).toBeCalledTimes(1);
        obj.age = 2;
        expect(mockFn).toBeCalledTimes(1);
        expect(original.value).toBe(2);
        expect(mockFn).toBeCalledTimes(2);
    });
});
