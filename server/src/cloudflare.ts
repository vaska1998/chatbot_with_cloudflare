import axios, { AxiosInstance } from "axios";

export type DnsRecordPayload = {
    type: "A" | "AAAA" | "CNAME" | "TXT" | "MX" | "NS" | "SRV" | "CAA";
    name: string;
    content: string;
    ttl?: number;
    priority?: number;
    proxied?: boolean;
};

export class CloudflareClient {
    private cf: AxiosInstance;

    constructor(apiToken: string, baseURL = "https://api.cloudflare.com/client/v4") {
        this.cf = axios.create({
            baseURL,
            headers: {
                Authorization: `Bearer ${apiToken}`,
                "Content-Type": "application/json",
            },
        });
    }

    async createZone(domain: string) {
        const { data } = await this.cf.post("/zones", { name: domain, jump_start: false });
        if (!data.success) throw new Error(JSON.stringify(data.errors));
        return data.result;
    }

    async getZoneByName(domain: string) {
        const { data } = await this.cf.get("/zones", { params: { name: domain, status: "active" } });
        if (!data.success) throw new Error(JSON.stringify(data.errors));
        return data.result[0];
    }

    async listDns(zoneId: string) {
        const { data } = await this.cf.get(`/zones/${zoneId}/dns_records`);
        if (!data.success) throw new Error(JSON.stringify(data.errors));
        return data.result;
    }

    async createDns(zoneId: string, payload: DnsRecordPayload) {
        const { data } = await this.cf.post(`/zones/${zoneId}/dns_records`, payload);
        if (!data.success) throw new Error(JSON.stringify(data.errors));
        return data.result;
    }

    async updateDns(zoneId: string, recordId: string, payload: Partial<DnsRecordPayload>) {
        const { data } = await this.cf.put(`/zones/${zoneId}/dns_records/${recordId}`, payload);
        if (!data.success) throw new Error(JSON.stringify(data.errors));
        return data.result;
    }

    async deleteDns(zoneId: string, recordId: string) {
        const { data } = await this.cf.delete(`/zones/${zoneId}/dns_records/${recordId}`);
        if (!data.success) throw new Error(JSON.stringify(data.errors));
        return data.result;
    }
}

