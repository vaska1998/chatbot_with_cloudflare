import { Router } from "express";
import AllowedUser from "../models/AllowedUser.js";
import { requireAuth } from "../middlewares/auth.js";

const router = Router();
router.use(requireAuth);

router.get("/", async (_req, res) => {
    const list = await AllowedUser.find().sort({ addedAt: -1 });
    res.json(list);
});

router.post("/", async (req, res) => {
    const { telegramId, username } = req.body || {};
    if (!telegramId) return res.status(400).json({ error: "telegramId required" });
    const doc = await AllowedUser.findOneAndUpdate(
        { telegramId },
        { $set: { username } },
        { upsert: true, new: true }
    );
    res.json(doc);
});

router.delete("/:telegramId", async (req, res) => {
    await AllowedUser.deleteOne({ telegramId: Number(req.params.telegramId) });
    res.json({ ok: true });
});

export default router;
