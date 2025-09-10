export type AuthLoginSignInRequest = {
    email: string,
    password: string
}

export type AuthLoginSignInResponse = {
    token: string;
}
