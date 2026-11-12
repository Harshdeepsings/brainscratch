// Lightweight URL classifier — no external dependencies.
// Detects platform from hostname + path, builds embed URLs.

export type ContentType =
    | "youtube" | "twitter" | "instagram" | "linkedin"
    | "googledocs" | "googlesheets" | "notion" | "text";

export interface ClassificationResult {
    type: ContentType;
    embedUrl: string | null;
    platformName: string;
}

const NOTE: ClassificationResult = { type: "text", embedUrl: null, platformName: "Note" };

export function isValidHttpUrl(raw?: string): boolean {
    if (!raw) return false;
    try { return /^https?:$/.test(new URL(raw.trim()).protocol); }
    catch { return false; }
}

export function classifyUrl(raw?: string): ClassificationResult {
    if (!isValidHttpUrl(raw)) return NOTE;

    const url = raw!.trim();
    const { hostname, pathname } = new URL(url);
    const host = hostname.toLowerCase();

    // Google Docs
    const docId = host.includes("docs.google.com") && pathname.match(/\/document\/d\/([a-zA-Z0-9_-]+)/)?.[1];
    if (docId) return { type: "googledocs", embedUrl: `https://docs.google.com/document/d/${docId}/preview`, platformName: "Google Docs" };

    // Google Sheets
    const sheetId = host.includes("docs.google.com") && pathname.match(/\/spreadsheets\/d\/([a-zA-Z0-9_-]+)/)?.[1];
    if (sheetId) return { type: "googlesheets", embedUrl: `https://docs.google.com/spreadsheets/d/${sheetId}/preview`, platformName: "Google Sheets" };

    // Notion
    if (host.includes("notion.so") || host.endsWith(".notion.site"))
        return { type: "notion", embedUrl: url, platformName: "Notion" };

    // YouTube
    if (host.includes("youtube.com") || host.includes("youtu.be")) {
        const vid = url.match(/(?:v=|youtu\.be\/|embed\/|shorts\/)([\w-]{11})/)?.[1];
        return { type: "youtube", embedUrl: vid ? `https://www.youtube.com/embed/${vid}` : null, platformName: "YouTube" };
    }

    // X / Twitter
    if (host.includes("twitter.com") || host.includes("x.com"))
        return { type: "twitter", embedUrl: null, platformName: "X / Twitter" };

    // Instagram
    if (host.includes("instagram.com")) {
        const pid = pathname.match(/\/(?:p|reel|tv)\/([\w-]+)/)?.[1];
        return { type: "instagram", embedUrl: pid ? `https://www.instagram.com/p/${pid}/embed/` : null, platformName: "Instagram" };
    }

    // LinkedIn
    if (host.includes("linkedin.com")) {
        const aid = url.match(/(?:activity-|activity:|share:)(\d+)/)?.[1];
        return { type: "linkedin", embedUrl: aid ? `https://www.linkedin.com/embed/feed/update/urn:li:activity:${aid}` : null, platformName: "LinkedIn" };
    }

    return { type: "text", embedUrl: null, platformName: "Web Link" };
}
