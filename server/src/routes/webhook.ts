import { Router, Request, Response } from "express";
import { getClientIp } from "../utils/ip.js";
import {Telegraf} from "telegraf";

export class WebhookRoutes {
    private readonly router: Router;
    private bot: Telegraf;

    constructor(bot: Telegraf, router: Router) {
        this.router = router
        this.bot = bot;
        this.registerRoutes()
    }

    private registerRoutes() {
        this.router.all("/notify", this.notify.bind(this))
    }

    private async notify(req: Request, res: Response) {
        const ip = getClientIp(req);
        const allowedChatId = Number(process.env.TG_ALLOWED_CHAT_ID)
        await this.bot.telegram.sendMessage(
            allowedChatId,
            `HTTP ${req.method} ${req.originalUrl}\nIP: ${ip}\nBody: ${JSON.stringify(req.body).slice(0, 2000)}`
        );
        res.json({ ok: true });
    }

    public getRouter(): Router {
        return this.router;
    }
}
