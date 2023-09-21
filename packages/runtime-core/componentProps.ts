import { ComponentInstance } from "./components";

export function initProps(instance: ComponentInstance, rawProps: any) {
    instance.props = rawProps || {};
}
