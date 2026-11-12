import { classifyUrl, isValidHttpUrl } from "./urlClassifier";

interface TestCase {
    name: string;
    input?: string;
    expectedType: string;
    expectedPlatform: string;
    expectedEmbedUrlHas?: string;
}

const testCases: TestCase[] = [
    // YouTube
    { name: "YouTube watch URL", input: "https://www.youtube.com/watch?v=dQw4w9WgXcQ", expectedType: "youtube", expectedPlatform: "YouTube", expectedEmbedUrlHas: "embed/dQw4w9WgXcQ" },
    { name: "YouTube short URL", input: "https://youtu.be/dQw4w9WgXcQ", expectedType: "youtube", expectedPlatform: "YouTube", expectedEmbedUrlHas: "embed/dQw4w9WgXcQ" },
    { name: "YouTube shorts URL", input: "https://www.youtube.com/shorts/dQw4w9WgXcQ", expectedType: "youtube", expectedPlatform: "YouTube", expectedEmbedUrlHas: "embed/dQw4w9WgXcQ" },

    // X / Twitter
    { name: "Twitter status", input: "https://twitter.com/jack/status/20", expectedType: "twitter", expectedPlatform: "X / Twitter" },
    { name: "X.com status", input: "https://x.com/elonmusk/status/1780000000000000000", expectedType: "twitter", expectedPlatform: "X / Twitter" },

    // Instagram
    { name: "Instagram post", input: "https://www.instagram.com/p/DF7q8s-test/", expectedType: "instagram", expectedPlatform: "Instagram", expectedEmbedUrlHas: "/embed/" },
    { name: "Instagram reel", input: "https://www.instagram.com/reel/DF7q8s-reel/", expectedType: "instagram", expectedPlatform: "Instagram", expectedEmbedUrlHas: "/embed/" },

    // LinkedIn
    { name: "LinkedIn activity", input: "https://www.linkedin.com/posts/satyanadella_ai-innovation-activity-7123456789012345678/", expectedType: "linkedin", expectedPlatform: "LinkedIn", expectedEmbedUrlHas: "urn:li:activity:7123456789012345678" },

    // Google Docs & Sheets
    { name: "Google Docs", input: "https://docs.google.com/document/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms/edit", expectedType: "googledocs", expectedPlatform: "Google Docs", expectedEmbedUrlHas: "/preview" },
    { name: "Google Sheets", input: "https://docs.google.com/spreadsheets/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms/edit#gid=0", expectedType: "googlesheets", expectedPlatform: "Google Sheets", expectedEmbedUrlHas: "/preview" },

    // Notion
    { name: "Notion page", input: "https://www.notion.so/my-workspace/Product-Roadmap-1234567890abcdef1234567890abcdef", expectedType: "notion", expectedPlatform: "Notion" },
    { name: "Notion site", input: "https://acme.notion.site/Public-Documentation-1234567890abcdef", expectedType: "notion", expectedPlatform: "Notion" },

    // Fallbacks
    { name: "Unknown domain", input: "https://example.com/blog/article-123", expectedType: "text", expectedPlatform: "Web Link" },
    { name: "GitHub", input: "https://github.com/facebook/react", expectedType: "text", expectedPlatform: "Web Link" },
    { name: "Empty string", input: "", expectedType: "text", expectedPlatform: "Note" },
    { name: "Plain text", input: "Remember to buy groceries", expectedType: "text", expectedPlatform: "Note" },
    { name: "javascript: protocol", input: "javascript:alert(1)", expectedType: "text", expectedPlatform: "Note" },
    { name: "ftp: protocol", input: "ftp://ftp.example.com/file.txt", expectedType: "text", expectedPlatform: "Note" },
    { name: "file: protocol", input: "file:///C:/Users/test/secrets.txt", expectedType: "text", expectedPlatform: "Note" },
];

function run() {
    let passed = 0, failed = 0;
    console.log("--- urlClassifier tests ---");

    for (const t of testCases) {
        const r = classifyUrl(t.input);
        const reasons: string[] = [];
        if (r.type !== t.expectedType) reasons.push(`type: '${r.type}' != '${t.expectedType}'`);
        if (r.platformName !== t.expectedPlatform) reasons.push(`platform: '${r.platformName}' != '${t.expectedPlatform}'`);
        if (t.expectedEmbedUrlHas && (!r.embedUrl || !r.embedUrl.includes(t.expectedEmbedUrlHas)))
            reasons.push(`embedUrl missing '${t.expectedEmbedUrlHas}'`);

        if (reasons.length === 0) { passed++; console.log(`[PASS] ${t.name}`); }
        else { failed++; console.error(`[FAIL] ${t.name} -> ${reasons.join(", ")}`); }
    }

    // isValidHttpUrl tests
    const protocols = [
        ["https://secure.com", true], ["http://insecure.com", true],
        ["javascript:void(0)", false], ["data:text/html,<script>", false],
        ["chrome://settings", false], ["invalid", false],
    ] as const;

    for (const [url, expected] of protocols) {
        if (isValidHttpUrl(url) === expected) { passed++; console.log(`[PASS] isValidHttpUrl('${url}') -> ${expected}`); }
        else { failed++; console.error(`[FAIL] isValidHttpUrl('${url}') expected ${expected}`); }
    }

    console.log(`\n${passed} passed, ${failed} failed.\n`);
    process.exit(failed > 0 ? 1 : 0);
}

run();