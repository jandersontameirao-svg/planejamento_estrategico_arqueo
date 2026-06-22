import { describe as baseDescribe, it, expect } from "vitest";
import { organogramClient } from "./integrations/organogramClient";

const describe =
  process.env.ORGANOGRAM_API_BASE_URL && process.env.ORGANOGRAM_INTERNAL_TOKEN
    ? baseDescribe
    : baseDescribe.skip;

describe("OrganoArq Integration", () => {
  it("should fetch overview with valid credentials", async () => {
    const overview = await organogramClient.getOverview();
    expect(overview).toBeDefined();
    expect(typeof overview.totalPositions).toBe("number");
    expect(typeof overview.totalPeople).toBe("number");
    expect(overview.totalPositions).toBeGreaterThan(0);
    expect(overview.totalPeople).toBeGreaterThan(0);
  }, 15_000);

  it("should fetch leaders list", async () => {
    const result = await organogramClient.getLeaders();
    expect(result.leaders).toBeDefined();
    expect(Array.isArray(result.leaders)).toBe(true);
    expect(result.total).toBeGreaterThan(0);
  }, 15_000);

  it("should fetch departments list", async () => {
    const result = await organogramClient.getDepartments();
    expect(result.departments).toBeDefined();
    expect(Array.isArray(result.departments)).toBe(true);
    expect(result.total).toBeGreaterThan(0);
  }, 15_000);

  it("should fetch org tree", async () => {
    const result = await organogramClient.getTree();
    expect(result.tree).toBeDefined();
    expect(Array.isArray(result.tree)).toBe(true);
    expect(result.tree.length).toBeGreaterThan(0);
    // CEO should be the root
    const root = result.tree[0];
    expect(root.parentId).toBeNull();
    expect(root.people.length).toBeGreaterThan(0);
  }, 15_000);
});
