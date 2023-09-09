import { describe, expect, it, vi } from "vitest";
import { reactive } from "../reactive";
import { effect } from "../effect";

describe("test: effect", () => {
    it("should access", () => {
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

    it("should return runner when call effect", () => {
        const fn = vi.fn();
        const runner = effect(() => {
            fn();
            return "You have to tell me the truthy";
        });
        expect(fn).toBeCalledTimes(1);
        const res = runner();
        expect(fn).toBeCalledTimes(2);
        expect(res).toBe("You have to tell me the truthy");
    });

    it("should call scheduler when it not undefined", () => {
        let dummy: any;
        let run: any;
        const scheduler = vi.fn(() => {
            run = runner
        });
        const obj = reactive({
            foo: 10
        });
        const runner = effect(() => {
            dummy = obj.foo;
        }, {scheduler});
        expect(dummy).toBe(10)
        expect(scheduler).not.toBeCalled();
        obj.foo++;
        expect(dummy).toBe(10)
        expect(scheduler).toBeCalledTimes(1)
        run();
        expect(dummy).toBe(11)
    });
});
