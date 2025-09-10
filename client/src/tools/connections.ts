import {AuthCredentialsWithClaims, CREDENTIALS_KEY, parseTokenCredentials} from "./token";
import {ClientManagerType, createClientManager} from "../infrastructure/client/manager";
import {IncomingMessage} from "http";
import {getCookie} from "./cookie";
import {AxiosProxy} from "../infrastructure/client/proxy/axios.proxy";

export type ConnectionType = {
    credentials: AuthCredentialsWithClaims | null;
    client: ClientManagerType;
};

export const getConnection = (req?: IncomingMessage): ConnectionType => {
    if (!req && typeof window == 'undefined') {
        throw 'Please, to use connection provide REQ object';
    }

    const fullCookieString = req ? req.headers.cookie : window.document.cookie;
    const credentialsJsonString = getCookie(CREDENTIALS_KEY, fullCookieString || '');
    const credentials = parseTokenCredentials(credentialsJsonString);
    return {
        credentials,
        client: createClientManager(new AxiosProxy(process.env.REACT_APP_PUBLIC_API_URL ?? '', credentials?.accessToken ?? '')),
    };
};
