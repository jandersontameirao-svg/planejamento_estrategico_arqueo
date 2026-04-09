/**
 * OrganoArq Integration Client
 * Read-only client for consuming the organizational chart API.
 * All calls are server-to-server using ORGANOGRAM_INTERNAL_TOKEN.
 */

const BASE_URL = process.env.ORGANOGRAM_API_BASE_URL ?? "";
const TOKEN = process.env.ORGANOGRAM_INTERNAL_TOKEN ?? "";

async function fetchOrganogram<T>(path: string): Promise<T> {
  if (!BASE_URL || !TOKEN) {
    throw new Error("ORGANOGRAM_NOT_CONFIGURED");
  }

  const url = `${BASE_URL}/api/integration/v1${path}`;
  const res = await fetch(url, {
    headers: {
      Authorization: `Bearer ${TOKEN}`,
      "Content-Type": "application/json",
    },
    signal: AbortSignal.timeout(10_000),
  });

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`OrganoArq ${res.status}: ${body.slice(0, 200)}`);
  }

  return res.json() as Promise<T>;
}

// ─── DTOs ────────────────────────────────────────────────────────────────────

export interface OrgOverview {
  totalPositions: number;
  totalPeople: number;
  totalDepartments: number;
  hierarchyLevels: number;
  vacantPositions: number;
  occupancyRate: number;
  lastUpdated: string;
}

export interface OrgPerson {
  id: number;
  name: string;
  email: string | null;
  phone: string | null;
  photoUrl: string | null;
  isLeadership: boolean;
  employmentType: string | null;
}

export interface OrgNode {
  id: number;
  title: string;
  level: number;
  parentId: number | null;
  departmentId: number | null;
  departmentName: string | null;
  departmentColor: string | null;
  scopeType: string | null;
  isCorporateRole: boolean;
  isSharedAcrossUnits: boolean;
  people: OrgPerson[];
  children: OrgNode[];
}

export interface OrgLeader {
  id: number;
  title: string;
  level: number;
  person: OrgPerson | null;
  subordinatesCount: number;
}

export interface OrgDepartment {
  id: number;
  name: string;
  color: string | null;
  icon: string | null;
  positionsCount: number;
  peopleCount: number;
}

// ─── API methods ─────────────────────────────────────────────────────────────

export const organogramClient = {
  getOverview: () => fetchOrganogram<OrgOverview>("/overview"),

  getTree: () =>
    fetchOrganogram<{ tree: OrgNode[]; totalNodes: number }>("/tree"),

  getLeaders: () =>
    fetchOrganogram<{ leaders: OrgLeader[]; total: number }>("/leaders"),

  getDepartments: () =>
    fetchOrganogram<{ departments: OrgDepartment[]; total: number }>(
      "/departments"
    ),
};
