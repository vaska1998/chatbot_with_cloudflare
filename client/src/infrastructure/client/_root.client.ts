import {ProxyClient} from "./proxy/proxy";

export abstract class _RootClient {
    constructor(public proxy: ProxyClient) {
    }
}
