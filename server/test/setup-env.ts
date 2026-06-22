import "dotenv/config";

const testEnvDefaults: Record<string, string> = {
  SGC_ENABLED: "true",
  SGC_API_BASE_URL: "https://sgc-test.invalid",
  SGC_INTERNAL_TOKEN: "test-token",
  SGC_TIMEOUT_MS: "10000",
  SGC_PUBLIC_APP_URL: "https://arqueomanage-test.invalid",
  VITE_SGC_PUBLIC_APP_URL: "https://arqueomanage-test.invalid",
};

for (const [key, value] of Object.entries(testEnvDefaults)) {
  process.env[key] ??= value;
}
