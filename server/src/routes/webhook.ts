import { Router } from "express";
import { getClientIp } from "../utils/ip.js";
import { bot } from "../bot.js";

const router = Router();

router.all("/notify", async (req, res) => {
    const ip = getClientIp(req);
    const allowedChatId = Number(process.env.TG_ALLOWED_CHAT_ID);
    await bot.telegram.sendMessage(
        allowedChatId,
        `HTTP ${req.method} ${req.originalUrl}\nIP: ${ip}\nBody: ${JSON.stringify(req.body).slice(0, 2000)}`
    );
    res.json({ ok: true });
});

export default router;
