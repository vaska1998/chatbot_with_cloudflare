import Joi from "joi";

export const UserUpdateAddedSchema = Joi.object({
    telegramId: Joi.number().required(),
    username: Joi.string().optional(),
});

export type UserUpdateAddedDto = {
    telegramId: number;
    username?: string;
}

export type UserResponseDto = {
    _id: string;
    telegramId: number;
    username?: string;
}
