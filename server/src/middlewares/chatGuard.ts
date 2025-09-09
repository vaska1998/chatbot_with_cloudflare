import { Context, MiddlewareFn } from "telegraf";

export const chatGuard: MiddlewareFn<Context> = async (ctx, next) => {
    const allowedChatId = Number(process.env.TG_ALLOWED_CHAT_ID);
    const chatId = ctx.chat?.id;
    if (chatId === allowedChatId) return next();

    if (ctx.chat?.type === "private") {
        const AllowedUser = (await import("../models/AllowedUser.js")).default;
        const tgId = ctx.from?.id;
        if (!tgId) return;
        const ok = await AllowedUser.findOne({ telegramId: tgId });
        if (ok) return next();
        return ctx.reply("You don`t have access to the bot. Contact the administrator.");
    }

    return;
};
