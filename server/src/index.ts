import "dotenv/config";
import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import { bot } from "./bot.js";
import adminRoutes from "./routes/admin.js";
import userRoutes from "./routes/users.js";
import webhookRoutes from "./routes/webhook.js";

const app = express();
app.use(express.json());
app.use(cors({ origin: process.env.CORS_ORIGIN?.split(",") || true }));

app.use("/api/auth", adminRoutes);
app.use("/api/users", userRoutes);
app.use("/api", webhookRoutes);

(async () => {
    await mongoose.connect(process.env.MONGO_URI!);
    const User = (await import("./models/User.js")).default;
    const count = await User.countDocuments();
    if (count === 0) {
        const bcrypt = (await import("bcrypt")).default;
        const passwordHash = await bcrypt.hash("admin123", 10);
        await User.create({ email: "admin@example.com", passwordHash });
        console.log("Seeded admin: admin@example.com / admin123");
    }

    bot.launch().then(() => console.log("Bot launched")).catch(console.error);

    const port = Number(process.env.PORT) || 8080;
    app.listen(port, () => console.log("API listening on", port));
})().catch((e) => {
    console.error(e);
    process.exit(1);
});

process.once("SIGINT", () => bot.stop("SIGINT"));
process.once("SIGTERM", () => bot.stop("SIGTERM"));
