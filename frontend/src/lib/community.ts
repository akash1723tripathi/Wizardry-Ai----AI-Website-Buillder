// Published sites are untrusted HTML: without allow-same-origin their scripts can't
// read this app's storage or call the API with the viewer's session
export const PUBLISHED_SITE_SANDBOX = "allow-scripts allow-forms allow-popups allow-modals";

export interface CommunitySite {
    id: string;
    name: string;
    initial_prompt: string;
    current_code: string;
    createdAt: string;
    updatedAt: string;
    user?: { name?: string | null } | null;
}

const relative = new Intl.RelativeTimeFormat(undefined, { numeric: "auto" });

export const timeAgo = (iso: string) => {
    const seconds = (new Date(iso).getTime() - Date.now()) / 1000;
    const units: [Intl.RelativeTimeFormatUnit, number][] = [
        ["year", 31536000], ["month", 2592000], ["week", 604800], ["day", 86400], ["hour", 3600], ["minute", 60],
    ];
    for (const [unit, size] of units) {
        if (Math.abs(seconds) >= size) return relative.format(Math.round(seconds / size), unit);
    }
    return "just now";
};
