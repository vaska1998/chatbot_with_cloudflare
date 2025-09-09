import { Telegraf } from "telegraf";
import { chatGuard } from "./middlewares/chatGuard.js";
import AllowedUser from "./models/AllowedUser.js";
import { createZone, getZoneByName, createDns, updateDns, deleteDns, listDns } from "./cloudflare.js";

export const bot = new Telegraf(process.env.TG_BOT_TOKEN!);

bot.use(chatGuard);

bot.start(async (ctx) => {
    const isPrivate = ctx.chat?.type === "private";
    if (isPrivate) {
        const allowed = await AllowedUser.findOne({ telegramId: ctx.from!.id });
        if (!allowed) return ctx.reply("Access is denied. Contact your administrator.");
    }
    return ctx.reply([
        "Commands:",
        "/register_domain example.com",
        "/ns example.com",
        "/dns_list example.com",
        "/dns_create <domain> <type> <name> <content> [ttl] [proxied]",
        "/dns_update <domain> <record_id> <JSON_payload>",
        "/dns_delete <domain> <record_id>"
    ].join("\n"));
});

bot.command("register_domain", async (ctx) => {
    const [, domain] = ctx.message!.text.split(/\s+/);
    if (!domain) return ctx.reply("\n" +
        "Specify the domain: /register_domain example.com");
    try {
        const zone = await createZone(domain);
        const ns = zone.name_servers || zone.nameservers || [];
        await ctx.reply(`The zone is created. NS:\n${ns.join("\n")}`);
    } catch (e:any) {
        await ctx.reply(`Error: ${e.message || e}`);
    }
});

bot.command("ns", async (ctx) => {
    const [, domain] = ctx.message!.text.split(/\s+/);
    if (!domain) return ctx.reply("\n" +
        "Specify the domain: /ns example.com");
    try {
        const zone = await getZoneByName(domain);
        if (!zone) return ctx.reply("\n" + "Zone not found or not active.");
        const ns = zone.name_servers || zone.nameservers || [];
        await ctx.reply(`NS для ${domain}:\n${ns.join("\n")}`);
    } catch (e:any) {
        await ctx.reply(`Error: ${e.message || e}`);
    }
});

bot.command("dns_list", async (ctx) => {
    const [, domain] = ctx.message!.text.split(/\s+/);
    if (!domain) return ctx.reply("\n" +
        "Specify the domain: /dns_list example.com");
    try {
        const zone = await getZoneByName(domain);
        if (!zone) return ctx.reply("Zone not found.");
        const recs = await listDns(zone.id);
        await ctx.reply(`DNS records (${recs.length}):\n` + recs.map((r:any)=>`${r.id} ${r.type} ${r.name} -> ${r.content}`).join("\n"));
    } catch (e:any) {
        await ctx.reply(`Error: ${e.message || e}`);
    }
});

bot.command("dns_create", async (ctx) => {
    const parts = ctx.message!.text.split(/\s+/);
    if (parts.length < 5) return ctx.reply("Example: /dns_create example.com A api 1.2.3.4 300 true");
    const [, domain, type, name, content, ttlRaw, proxiedRaw] = parts;
    try {
        const zone = await getZoneByName(domain);
        if (!zone) return ctx.reply("Zone not found.");
        const payload:any = { type, name, content };
        if (ttlRaw) payload.ttl = Number(ttlRaw);
        if (typeof proxiedRaw !== "undefined") payload.proxied = proxiedRaw === "true";
        const result = await createDns(zone.id, payload);
        await ctx.reply(`Created: ${result.id} ${result.type} ${result.name} -> ${result.content}`);
    } catch (e:any) {
        await ctx.reply(`Error: ${e.message || e}`);
    }
});

bot.command("dns_update", async (ctx) => {
    const [, domain, recordId, ...jsonParts] = ctx.message!.text.split(/\s+/);
    if (!domain || !recordId || jsonParts.length === 0) return ctx.reply("Example: /dns_update example.com 12345 '{\"name\":\"api\",\"content\":\"1.1.1.1\"}'");
    try {
        const zone = await getZoneByName(domain);
        if (!zone) return ctx.reply("Zone not found.");
        const payload = JSON.parse(jsonParts.join(" "));
        const result = await updateDns(zone.id, recordId, payload);
        await ctx.reply(`Updated: ${result.id} ${result.type} ${result.name} -> ${result.content}`);
    } catch (e:any) {
        await ctx.reply(`Error: ${e.message || e}`);
    }
});

bot.command("dns_delete", async (ctx) => {
    const [, domain, recordId] = ctx.message!.text.split(/\s+/);
    if (!domain || !recordId) return ctx.reply("Example: /dns_delete example.com 12345");
    try {
        const zone = await getZoneByName(domain);
        if (!zone) return ctx.reply("Zone not found.");
        await deleteDns(zone.id, recordId);
        await ctx.reply("Deleted.");
    } catch (e:any) {
        await ctx.reply(`Error: ${e.message || e}`);
    }
});
