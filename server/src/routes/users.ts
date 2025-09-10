import {Router, Request, Response} from "express";
import AllowedUser from "../models/AllowedUser.js";
import { requireAuth } from "../middlewares/auth.js";
import {validateBody} from "../middlewares/validator";
import {UserResponseDto, UserUpdateAddedDto, UserUpdateAddedSchema} from "../dto/users.dto";

export class UserRoutes {
    private readonly router: Router;

    constructor(router: Router) {
        this.router = router;
        this.router.use(requireAuth);
        this.registerRoutes();
    }

    private registerRoutes() {
        this.router.get("/", this.getAllowedUsers.bind(this));
        this.router.post("/", validateBody(UserUpdateAddedSchema),this.addOrUpdateAllowedUser.bind(this));
        this.router.delete("/:telegramId", this.deleteAllowedUser.bind(this));
    }

    private async getAllowedUsers(_req: Request, res: Response<UserResponseDto[]>) {
        const list = await AllowedUser.find().sort({ addedAt: -1 });
        const response: UserResponseDto[] = list.map(u => ({
            _id: u._id.toString(),
            telegramId: u.telegramId,
            username: u.username,
        }));
        res.json(response);
    }

    private async addOrUpdateAllowedUser(req: Request<{}, {}, UserUpdateAddedDto>, res: Response<UserResponseDto>) {
        const { telegramId, username } = req.body || {};
        const doc = await AllowedUser.findOneAndUpdate(
            { telegramId },
            { $set: { username } },
            { upsert: true, new: true }
        );
        const response: UserResponseDto = {
            _id: doc._id.toString(),
            telegramId: doc.telegramId,
            username: doc.username,
        };

        res.json(response);
    }

    private async deleteAllowedUser(req: Request<{ telegramId: string }>, res: Response<{ telegramId: string }>) {
        await AllowedUser.deleteOne({ telegramId: Number(req.params.telegramId) });
        res.json({ telegramId: req.params.telegramId });
    }

    public getRouter(): Router {
        return this.router;
    }
}
