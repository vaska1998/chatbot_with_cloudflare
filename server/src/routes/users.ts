import { Router, Request, Response } from "express";
import AllowedUser from "../models/AllowedUser.js";
import { requireAuth } from "../middlewares/auth.js";

export class UserRoutes {
    private readonly router: Router;

    constructor(router: Router) {
        this.router = router;
        this.router.use(requireAuth);
        this.registerRoutes();
    }

    private registerRoutes() {
        this.router.get("/", this.getAllowedUsers.bind(this));
        this.router.post("/", this.addOrUpdateAllowedUser.bind(this));
        this.router.delete("/:telegramId", this.deleteAllowedUser.bind(this));
    }

    private async getAllowedUsers(_req: Request, res: Response) {
        const list = await AllowedUser.find().sort({ addedAt: -1 });
        res.json(list);
    }

    private async addOrUpdateAllowedUser(req: Request, res: Response) {
        const { telegramId, username } = req.body || {};
        if (!telegramId) return res.status(400).json({ error: "telegramId required" });

        const doc = await AllowedUser.findOneAndUpdate(
            { telegramId },
            { $set: { username } },
            { upsert: true, new: true }
        );
        res.json(doc);
    }

    private async deleteAllowedUser(req: Request, res: Response) {
        await AllowedUser.deleteOne({ telegramId: Number(req.params.telegramId) });
        res.json({ telegramId: req.params.telegramId });
    }

    public getRouter(): Router {
        return this.router;
    }
}
