import {AuthClient} from "./auth.client";
import {ProxyClient} from "./proxy/proxy";
import {UserClient} from "./user.client";

export type ClientManagerType = {
    auth: AuthClient;
    user: UserClient;
};

export const createClientManager = (proxy: ProxyClient): ClientManagerType => ({
    auth: new AuthClient(proxy),
    user: new UserClient(proxy),
});
