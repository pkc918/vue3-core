import { describe, expect, test, vi } from "vitest";
import { isRef, proxyRefs, ref, unRef } from "../ref";
import { effect } from "../effect";
import { reactive } from "../reactive";

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

    test("isRef event", () => {
        const original = ref(1);
        const num = 1;
        const data = reactive({
            val: 1
        });
        expect(isRef(original)).toBe(true);
        expect(isRef(num)).toBe(false);
        expect(isRef(data)).toBe(false);
    });

    test("unRef event", () => {
        console.warn = vi.fn();
        const original = ref(1);
        expect(unRef(original)).toBe(1);
        expect(unRef(1));
        expect(console.warn).toBeCalled();
    });

    test("proxyRefs event", () => {
        const obj = {
            refVal: ref(1),
            num: 1
        };
        const original = proxyRefs(obj);
        expect(obj.refVal.value).toBe(1);
        expect(original.refVal).toBe(1);
        original.refVal = 2;
        expect(original.refVal).toBe(2);
        expect(obj.refVal.value).toBe(2);
        original.refVal = ref(3);
        expect(original.refVal).toBe(3);
        expect(obj.refVal.value).toBe(3);
    });
});
