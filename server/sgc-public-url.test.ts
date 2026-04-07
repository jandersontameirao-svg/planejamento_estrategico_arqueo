import { describe, it, expect } from "vitest";

describe("VITE_SGC_PUBLIC_APP_URL", () => {
  it("should be set and be a valid URL", () => {
    const url = process.env.VITE_SGC_PUBLIC_APP_URL;
    expect(url).toBeDefined();
    expect(url).not.toBe("");
    expect(url).toMatch(/^https?:\/\//);
  });

  it("should not have trailing slash", () => {
    const url = process.env.VITE_SGC_PUBLIC_APP_URL;
    expect(url).toBeDefined();
    expect(url!.endsWith("/")).toBe(false);
  });

  it("should point to the SGC domain", () => {
    const url = process.env.VITE_SGC_PUBLIC_APP_URL;
    expect(url).toContain("arqueomanage");
  });
});
