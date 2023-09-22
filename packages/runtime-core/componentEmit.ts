import { ComponentInstance } from "./components";
import { camelize, toHandlerKey } from "../shared";

export function emit(instance: ComponentInstance, eventName: string, ...args: any[]) {
    // add -> onAdd
    console.log("instance", eventName);
    const {props} = instance;
    const handlerName = toHandlerKey(camelize(eventName));
    const handler = Reflect.get(props, handlerName);
    handler?.(...args);
}


