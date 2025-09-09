import "dotenv/config";
import express, {Router} from "express";
import cors from "cors";
import mongoose from "mongoose";
import {TelegramBot} from "./bot";
import {WebhookRoutes} from "./routes/webhook";
import {UserRoutes} from "./routes/users";
import {AdminRoutes} from "./routes/admin";

const app = express();
app.use(express.json());
app.use(cors({ origin: process.env.CORS_ORIGIN?.split(",") || true }));

(async () => {
    await mongoose.connect(process.env.MONGO_URI!);
    const User = (await import("./models/User.js")).default;
    const count = await User.countDocuments();
    if (count === 0) {
        const bcrypt = (await import("bcrypt")).default;
        const passwordHash = await bcrypt.hash(process.env.ADMIN_PASS!, 10);
        await User.create({ email: process.env.ADMIN_EMAIL!, passwordHash });
        console.log(`Seeded admin: ${process.env.ADMIN_EMAIL!} / ${process.env.ADMIN_PASS!}`);
    }

    const bot = new TelegramBot(process.env.TG_BOT_TOKEN!, process.env.CF_API_TOKEN!);
    bot.launch()

    const router = Router();
    app.use("/api/auth", new AdminRoutes(router).getRouter());
    app.use("/api/users", new UserRoutes(router).getRouter());
    app.use("/api", new WebhookRoutes(bot['bot'], router).getRouter());

    const port = Number(process.env.PORT) || 8080;
    app.listen(port, () => console.log("API listening on", port));
})().catch((e) => {
    console.error(e);
    process.exit(1);
});
