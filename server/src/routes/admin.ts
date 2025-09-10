import { Router, Request, Response } from "express";
import User from "../models/User.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import {AuthDto, AuthSchema, LoginResponse} from "../dto/auth.dto";
import {validateBody} from "../middlewares/validator";

export class AdminRoutes {
    private readonly router: Router;

    constructor(router: Router) {
        this.router = router
        this.registerRoutes()
    }

    private registerRoutes() {
        this.router.post("/login", validateBody(AuthSchema), this.login.bind(this))
    }

    private async login(req: Request<AuthDto>, res: Response<LoginResponse>) {
        const { email, password } = req.body || {};
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(401).json({ error: "Invalid creds" });
        }

        const ok = await bcrypt.compare(password, user.passwordHash);
        if (!ok) {
            return res.status(401).json({ error: "Invalid creds" });
        }

        const token = jwt.sign({ sub: user.id, email }, process.env.JWT_SECRET!, { expiresIn: "7d" });
        res.json({ token });
    }

    public getRouter(): Router {
        return this.router;
    }
}
