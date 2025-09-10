import Joi from "joi";

export type LoginResponse = { token: string } | { error: string };

export type AuthDto = { email: string; password: string };

export const AuthSchema = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required(),
})
