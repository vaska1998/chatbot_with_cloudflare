import {NextFunction, Response, Request} from "express";
import Joi from "joi";

interface ValidatedResponse<Body> extends Response {
    locals: {
        validatedBody: Body;
    };
}

export function validateBody<T>  (schema: Joi.ObjectSchema)  {
    return (req: Request, res: Response, next: NextFunction) => {
        const { error, value } = schema.validate(req.body, { abortEarly: false });
        if (error) {
            return res.status(400).json({ errors: error.details });
        }
        (res as ValidatedResponse<T>).locals.validatedBody = value;
        next();
    };
}
