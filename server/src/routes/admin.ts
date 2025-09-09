import { Router } from "express";
import User from "../models/User.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

const router = Router();

router.post("/login", async (req, res) => {
    const { email, password } = req.body || {};
    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ error: "Invalid creds" });

    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) return res.status(401).json({ error: "Invalid creds" });

    const token = jwt.sign({ sub: user.id, email }, process.env.JWT_SECRET!, { expiresIn: "7d" });
    res.json({ token });
});

export default router;
