import axios from "axios";

const cf = axios.create({
    baseURL: "https://api.cloudflare.com/client/v4",
    headers: {
        Authorization: `Bearer ${process.env.CF_API_TOKEN}`,
        "Content-Type": "application/json"
    }
});

export async function createZone(domain: string) {
    const { data } = await cf.post("/zones", { name: domain, jump_start: false });
    if (!data.success) throw new Error(JSON.stringify(data.errors));
    return data.result;
}

export async function getZoneByName(domain: string) {
    const { data } = await cf.get("/zones", { params: { name: domain, status: "active" } });
    if (!data.success) throw new Error(JSON.stringify(data.errors));
    return data.result[0];
}

export async function listDns(zoneId: string) {
    const { data } = await cf.get(`/zones/${zoneId}/dns_records`);
    if (!data.success) throw new Error(JSON.stringify(data.errors));
    return data.result;
}

export async function createDns(zoneId: string, payload: {
    type: "A"|"AAAA"|"CNAME"|"TXT"|"MX"|"NS"|"SRV"|"CAA";
    name: string;
    content: string;
    ttl?: number;
    priority?: number;
    proxied?: boolean;
}) {
    const { data } = await cf.post(`/zones/${zoneId}/dns_records`, payload);
    if (!data.success) throw new Error(JSON.stringify(data.errors));
    return data.result;
}

export async function updateDns(zoneId: string, recordId: string, payload: any) {
    const { data } = await cf.put(`/zones/${zoneId}/dns_records/${recordId}`, payload);
    if (!data.success) throw new Error(JSON.stringify(data.errors));
    return data.result;
}

export async function deleteDns(zoneId: string, recordId: string) {
    const { data } = await cf.delete(`/zones/${zoneId}/dns_records/${recordId}`);
    if (!data.success) throw new Error(JSON.stringify(data.errors));
    return data.result;
}
