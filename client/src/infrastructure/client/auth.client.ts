import {_RootClient} from "./_root.client";
import {ProxyClient} from "./proxy/proxy";
import {AuthLoginSignInRequest, AuthLoginSignInResponse} from "../dto/auth/login";
import {ClientResponse} from "./response";

export class AuthClient extends _RootClient {
    /* eslint-disable @typescript-eslint/no-useless-constructor */
    constructor(proxy: ProxyClient) {
        super(proxy);
    }

    login(content: AuthLoginSignInRequest): Promise<ClientResponse<AuthLoginSignInResponse>> {
        return this.proxy.post("/api/auth/login", content);
    }
}
