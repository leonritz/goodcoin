const ROOT_URL =
  process.env.NEXT_PUBLIC_URL ||
  (process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : 'http://localhost:3000');

/**
 * MiniApp configuration object. Must follow the Farcaster MiniApp specification.
 *
 * @see {@link https://miniapps.farcaster.xyz/docs/guides/publishing}
 */
export const minikitConfig = {
    "accountAssociation": {
    "header": "eyJmaWQiOjEzODE5NTAsInR5cGUiOiJjdXN0b2R5Iiwia2V5IjoiMHhEMkRjODJFYWQ0Yjg3ZkQ1Y0U5ODM1MmU3OEQ2QzkyQTk0QjA4NzlFIn0",
    "payload": "eyJkb21haW4iOiJnb29kY29pbi1oZW5uYS52ZXJjZWwuYXBwIn0",
    "signature": "1hQ73X3nSw8Hz+p1Qm7IrpxbmGg2GUwwl1UuonydYSFUM0lHmMfGM0aLAf8L8V6YUPWUOUCiLLl1byCqUi+DJhs="
  },
  miniapp: {
    version: "1",
    name: "GoodCoin", 
    subtitle: "Positive Vibes", 
    description: "Positives Vibes For All",
    screenshotUrls: [`${ROOT_URL}/screenshot-portrait.png`],
    iconUrl: `${ROOT_URL}/blue-icon.png`,
    splashImageUrl: `${ROOT_URL}/blue-hero.png`,
    splashBackgroundColor: "#403abf",
    homeUrl: ROOT_URL,
    webhookUrl: `${ROOT_URL}/api/webhook`,
    primaryCategory: "social",
    tags: ["marketing", "ads", "quickstart", "waitlist"],
    heroImageUrl: `${ROOT_URL}/blue-hero.png`, 
    tagline: "",
    ogTitle: "",
    ogDescription: "",
    ogImageUrl: `${ROOT_URL}/blue-hero.png`,
  },
} as const;

