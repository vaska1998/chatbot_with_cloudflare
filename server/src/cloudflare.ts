import axios, { AxiosInstance } from "axios";

export type DnsRecordPayload = {
    type: "A" | "AAAA" | "CNAME" | "TXT" | "MX" | "NS" | "SRV" | "CAA";
    name: string;
    content: string;
    ttl?: number;
    priority?: number;
    proxied?: boolean;
};

export type DomainsProps = {
    name: string;
    auto_renew: boolean;
    registration: {
        first_name: string,
        last_name: string,
        email: string,
        address: string,
        city: string,
        country: string,
        zip: string
    }
}

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

    async registrarNewDomain(content: DomainsProps) {
        const { data } = await this.cf.post("/accounts/registrar/domains", content);
        if (!data.success) {
            throw new Error(JSON.stringify(data.errors));
        }

        return data.result.name_servers;
    }

    async onboardDomain(domain: string, accountId: string) {
        const { data } = await this.cf.post("/zones", { name: domain, account: {"id": accountId}, jump_start: true });
        if (!data.success) {
            throw new Error(JSON.stringify(data.errors));
        }

        return data.result;
    }

    async getZoneByName(domain: string) {
        const { data } = await this.cf.get("/zones" );
        if (!data.success) {
            throw new Error(JSON.stringify(data.errors));
        }

        const zone = data.result.find((z: any) => z.name === domain);
        if (!zone) {
            throw new Error(`Zone ${domain} not found`);
        }

        return zone;
    }

    async listDns(zoneId: string) {
        const { data } = await this.cf.get(`/zones/${zoneId}/dns_records`);
        if (!data.success) {
            throw new Error(JSON.stringify(data.errors));
        }

        return data.result;
    }

    async createDns(zoneId: string, payload: DnsRecordPayload) {
        const { data } = await this.cf.post(`/zones/${zoneId}/dns_records`, payload);
        if (!data.success) {
            throw new Error(JSON.stringify(data.errors));
        }

        return data.result;
    }

    async updateDns(zoneId: string, recordId: string, payload: Partial<DnsRecordPayload>) {
        const { data } = await this.cf.put(`/zones/${zoneId}/dns_records/${recordId}`, payload);
        if (!data.success) {
            throw new Error(JSON.stringify(data.errors));
        }

        return data.result;
    }

    async deleteDns(zoneId: string, recordId: string) {
        const { data } = await this.cf.delete(`/zones/${zoneId}/dns_records/${recordId}`);
        if (!data.success) {
            throw new Error(JSON.stringify(data.errors));
        }

        return data.result;
    }
}

