import {setCookie} from "./cookie";

const getAtob = (): ((x: string) => string) => typeof window != 'undefined' ? window.atob : atob;
export type AuthCredentials = {
    accessToken: string;
    refreshToken: string;
}
export type AuthCredentialClaims = {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    iss: number;
    exp: number;
};

export type AuthCredentialsWithClaims = AuthCredentials & {
    claims: AuthCredentialClaims;
};

export const CREDENTIALS_KEY = 'vd_credentials';
export const parseTokenClaims = (token: string): AuthCredentialClaims => JSON.parse(getAtob()(token.split('.')[1]));
export const checkTokenExpired = (claims: AuthCredentialClaims) => !claims || !claims.exp || claims.exp >= new Date().getTime();
export const parseTokenCredentials = (jsonString: string | null): AuthCredentialsWithClaims | null => {
    if (!jsonString || !jsonString.length) {
        return null;
    }

    const credentials = JSON.parse(jsonString) as AuthCredentialsWithClaims;
    if (credentials == null) {
        return null;
    }

    const  claims = parseTokenClaims(credentials.accessToken);
    if (claims == null || checkTokenExpired(claims)) {
        return null;
    }

    return {
        ...credentials,
        claims,
    };
};

export const saveTokenToCookie = (credentials: AuthCredentials, remember: boolean) => {
    setCookie(
        CREDENTIALS_KEY,
        JSON.stringify(credentials),
        remember ? 30 : 0,
    );
};
