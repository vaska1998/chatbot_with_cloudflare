import {AuthCredentials, AuthCredentialsWithClaims, parseTokenClaims, saveTokenToCookie} from "../tools/token";
import React, {PropsWithChildren, useContext, useState} from "react";
import {ClientManagerType, createClientManager} from "../infrastructure/client/manager";
import {AxiosProxy} from "../infrastructure/client/proxy/axios.proxy";

export type AppUserProviderProps = {
    user: AuthCredentialsWithClaims | null;
    client: ClientManagerType;
}

type AppUserContextContent = AppUserProviderProps & {
    isAuthorized: boolean;
    signIn: (credentials: AuthCredentials, rememberMe: boolean) => void;
}

export const AppUserContext = React.createContext<AppUserContextContent | null>(null);

export const AppUserProvider: React.FC<PropsWithChildren<AppUserProviderProps>> = ({ children, user, client }: PropsWithChildren<AppUserProviderProps>) => {
    const [reactUser, setReactUser] = useState<AuthCredentialsWithClaims | null>(user);
    const [isAuthorized, setIsAuthorized] = useState(!!user);
    const [reactClient, setReactClient] = useState(client);

    const signIn = (credentials: AuthCredentials, rememberMe: boolean) => {
        const {accessToken} = credentials;
        saveTokenToCookie({
            accessToken,
            refreshToken: '',
        }, rememberMe);
        const claims = parseTokenClaims(accessToken);
        setReactUser({
            accessToken,
            refreshToken: '',
            claims
        });
        setIsAuthorized(true);
        const  _client = createClientManager(new AxiosProxy(process.env.REACT_APP_PUBLIC_API_URL ?? '', accessToken));
        setReactClient(_client);
    };

    return (
        <AppUserContext.Provider
            value={{user: reactUser, isAuthorized, client: reactClient, signIn}}>
            {children}
        </AppUserContext.Provider>
    );
};

export const useAppUser = () => useContext(AppUserContext)!;
