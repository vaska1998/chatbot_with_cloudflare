import { Telegraf } from "telegraf";
import { CloudflareClient, DnsRecordPayload } from "./cloudflare";
import {chatGuard} from "./middlewares/chatGuard";
import AllowedUser from "./models/AllowedUser";

const validTypes = ["A", "AAAA", "CNAME", "TXT", "MX", "NS", "SRV", "CAA"] as const;
type DnsType = (typeof validTypes)[number];

export class TelegramBot {
    private bot: Telegraf;
    private cfClient: CloudflareClient;
    private readonly cfApiAccountId: string;

    constructor(token: string, cfApiToken: string, cfApiAccountId: string) {
        this.bot = new Telegraf(token);
        this.cfClient = new CloudflareClient(cfApiToken);
        this.cfApiAccountId = cfApiAccountId;
        this.bot.use(chatGuard);
        this.registerCommands();
    }

    private registerCommands() {
        this.bot.start(async (ctx) => {
            const isPrivate = ctx.chat?.type === "private";
            if (isPrivate) {
                const allowed = await AllowedUser.findOne({ telegramId: ctx.from!.id });
                if (!allowed) return ctx.reply("Access is denied. Contact your administrator.");
            }

            return ctx.reply([
                "Commands:",
                "/register_domain <domain> <first_name> <last_name> <email> <city> <country> <zip>",
                "/create_zone example.com",
                "/ns example.com",
                "/dns_list example.com",
                "/dns_create <domain> <type> <name> <content> [ttl] [proxied]",
                "/dns_update <domain> <record_id> <JSON_payload>",
                "/dns_delete <domain> <record_id>"
            ].join("\n"));
        });

        this.bot.command("register_new_domain", async (ctx) => {
            const parts = ctx.message!.text.split(/\s+/);
            if (parts.length < 8) {
                return ctx.reply("Usage: /register_new_domain <domain> <first_name> <last_name> <email> <city> <country> <zip>");
            }

            const [, domain, first_name, last_name, email, city, country, zip] = parts;

            try {
                const nameServers = await this.cfClient.registrarNewDomain({
                    name: domain,
                    auto_renew: true,
                    registration: {
                        first_name,
                        last_name,
                        email,
                        address: "N/A",
                        city,
                        country,
                        zip
                    }
                });

                await ctx.reply(
                    `Domain ${domain} successfully registered!\n` +
                    `Add the following NS records at your current registrar:\n${nameServers.join("\n")}`
                );
            } catch (e: any) {
                await ctx.reply(`Error registering domain: ${e.message || e}`);
            }

        })

        this.bot.command("onboard_domain", async (ctx) => {
            const [, domain] = ctx.message!.text.split(/\s+/);
            if (!domain) {
                return ctx.reply("Specify the domain: /onboard_domain example.com");
            }

            try {
                const zone = await this.cfClient.onboardDomain(domain, this.cfApiAccountId);
                const ns = zone.name_servers || zone.nameservers || [];
                await ctx.reply(`The zone is created. NS:\n${ns.join("\n")}`);
            } catch (e: any) {
                await ctx.reply(`Error: ${e.message  || e}`);
            }
        });

        this.bot.command("ns", async (ctx) => {
            const [, domain] = ctx.message!.text.split(/\s+/);
            if (!domain) {
                return ctx.reply("Specify the domain: /ns example.com");
            }

            try {
                const zone = await this.cfClient.getZoneByName(domain);
                if (!zone) {
                    return ctx.reply("Zone not found or not active.");
                }

                const ns = zone.name_servers || zone.nameservers || [];
                await ctx.reply(`NS для ${domain}:\n${ns.join("\n")}`);
            } catch (e: any) {
                await ctx.reply(`Error: ${e.message || e}`);
            }
        });

        this.bot.command("dns_list", async (ctx) => {
            const [, domain] = ctx.message!.text.split(/\s+/);
            if (!domain) {
                return ctx.reply("Specify the domain: /dns_list example.com");
            }

            try {
                const zone = await this.cfClient.getZoneByName(domain);
                if (!zone) {
                    return ctx.reply("Zone not found.");
                }

                const recs = await this.cfClient.listDns(zone.id);
                await ctx.reply(`DNS records (${recs.length}):\n` +
                    recs.map((r: any) => `${r.id} ${r.type} ${r.name} -> ${r.content}`).join("\n"));
            } catch (e: any) {
                await ctx.reply(`Error: ${e.message || e}`);
            }
        });

        this.bot.command("dns_create", async (ctx) => {
            const parts = ctx.message!.text.split(/\s+/);
            if (parts.length < 5) {
                return ctx.reply("Example: /dns_create example.com A api 1.2.3.4 300 true");
            }

            const [, domain, type, name, content, ttlRaw, proxiedRaw] = parts;
            try {
                const zone = await this.cfClient.getZoneByName(domain);
                if (!zone) {
                    return ctx.reply("Zone not found.");
                }

                const payload: DnsRecordPayload = { type: type as DnsType, name, content };
                if (ttlRaw) {
                    payload.ttl = Number(ttlRaw);
                }

                if (typeof proxiedRaw !== "undefined") {
                    payload.proxied = proxiedRaw === "true";
                }

                const result = await this.cfClient.createDns(zone.id, payload);
                await ctx.reply(`Created: ${result.id} ${result.type} ${result.name} -> ${result.content}`);
            } catch (e: any) {
                await ctx.reply(`Error: ${e.message || e}`);
            }
        });

        this.bot.command("dns_update", async (ctx) => {
            const [, domain, recordId, ...jsonParts] = ctx.message!.text.split(/\s+/);
            if (!domain || !recordId || jsonParts.length === 0) {
                return ctx.reply("Example: /dns_update example.com 12345 {\"name\":\"api\",\"content\":\"1.1.1.1\"}");
            }

            try {
                const zone = await this.cfClient.getZoneByName(domain);
                if (!zone) {
                    return ctx.reply("Zone not found.");
                }

                const payload = JSON.parse(jsonParts[0]);
                const result = await this.cfClient.updateDns(zone.id, recordId, payload);
                await ctx.reply(`Updated: ${result.id} ${result.type} ${result.name} -> ${result.content}`);
            } catch (e: any) {
                await ctx.reply(`Error: ${e.message || e}`);
            }
        });

        this.bot.command("dns_delete", async (ctx) => {
            const [, domain, recordId] = ctx.message!.text.split(/\s+/);
            if (!domain || !recordId) {
                return ctx.reply("Example: /dns_delete example.com 12345");
            }

            try {
                const zone = await this.cfClient.getZoneByName(domain);
                if (!zone) {
                    return ctx.reply("Zone not found.");
                }

                await this.cfClient.deleteDns(zone.id, recordId);
                await ctx.reply("Deleted");
            } catch (e: any) {
                await ctx.reply(`Error: ${e.message || e}`);
            }
        });
    }

    public launch() {
        this.bot.launch().then(() => console.log("Bot launched!")).catch(console.error);
    }
}

