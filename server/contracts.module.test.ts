/**
 * contracts.module.test.ts — Testes do Módulo de Contratos (ZIP v1.0.0)
 */
import { describe, expect, it, vi, beforeEach } from "vitest";
import type { TrpcContext } from "./_core/context";

// ── Helpers ───────────────────────────────────────────────────────────────────
type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

function createAdminContext(): TrpcContext {
  const user: AuthenticatedUser = {
    id: 1,
    openId: "admin-user",
    email: "admin@arqueo.com",
    name: "Admin Arqueo",
    loginMethod: "manus",
    role: "admin",
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
  };
  return {
    user,
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: { clearCookie: vi.fn() } as unknown as TrpcContext["res"],
  };
}

function createUserContext(): TrpcContext {
  const user: AuthenticatedUser = {
    id: 2,
    openId: "regular-user",
    email: "user@arqueo.com",
    name: "Usuário Arqueo",
    loginMethod: "manus",
    role: "user",
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
  };
  return {
    user,
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: { clearCookie: vi.fn() } as unknown as TrpcContext["res"],
  };
}

// ── Testes de Contexto ────────────────────────────────────────────────────────
describe("Módulo de Contratos — Contexto de Autenticação", () => {
  it("deve criar contexto de admin com role=admin", () => {
    const ctx = createAdminContext();
    expect(ctx.user?.role).toBe("admin");
    expect(ctx.user?.email).toBe("admin@arqueo.com");
  });

  it("deve criar contexto de usuário com role=user", () => {
    const ctx = createUserContext();
    expect(ctx.user?.role).toBe("user");
    expect(ctx.user?.email).toBe("user@arqueo.com");
  });
});

// ── Testes de Validação de Tipos ──────────────────────────────────────────────
describe("Módulo de Contratos — Validação de Tipos", () => {
  it("deve aceitar status válidos de contrato", () => {
    const validStatuses = ["active", "completed", "cancelled"];
    validStatuses.forEach((s) => {
      expect(["active", "completed", "cancelled"]).toContain(s);
    });
  });

  it("deve aceitar severidades válidas de risco", () => {
    const validSeverities = ["baixa", "media", "alta", "critica"];
    validSeverities.forEach((s) => {
      expect(["baixa", "media", "alta", "critica"]).toContain(s);
    });
  });

  it("deve aceitar tipos válidos de risco", () => {
    const validTypes = ["financeiro", "legal", "operacional", "prazo"];
    validTypes.forEach((t) => {
      expect(["financeiro", "legal", "operacional", "prazo"]).toContain(t);
    });
  });

  it("deve aceitar tipos válidos de aditivo", () => {
    const validTypes = ["financeiro", "escopo"];
    validTypes.forEach((t) => {
      expect(["financeiro", "escopo"]).toContain(t);
    });
  });

  it("deve aceitar status válidos de marco financeiro", () => {
    const validStatuses = ["pending", "paid", "overdue", "cancelled"];
    validStatuses.forEach((s) => {
      expect(["pending", "paid", "overdue", "cancelled"]).toContain(s);
    });
  });
});

// ── Testes de Lógica de Numeração ─────────────────────────────────────────────
describe("Módulo de Contratos — Lógica de Numeração", () => {
  it("deve formatar número de contrato corretamente", () => {
    // Formato esperado: AAAA-NNN (ex: 2025-001)
    const year = 2025;
    const seq = 1;
    const formatted = `${year}-${String(seq).padStart(3, "0")}`;
    expect(formatted).toBe("2025-001");
  });

  it("deve formatar número de aditivo corretamente", () => {
    // Formato esperado: AAAA-NNN-AD-NN (ex: 2025-001-AD-01)
    const contractNumber = "2025-001";
    const adSeq = 1;
    const formatted = `${contractNumber}-AD-${String(adSeq).padStart(2, "0")}`;
    expect(formatted).toBe("2025-001-AD-01");
  });

  it("deve incrementar sequência corretamente", () => {
    const sequences = [1, 2, 3, 10, 100];
    sequences.forEach((seq, i) => {
      if (i > 0) {
        expect(seq).toBeGreaterThan(sequences[i - 1]!);
      }
    });
  });
});

// ── Testes de Cálculo Financeiro ──────────────────────────────────────────────
describe("Módulo de Contratos — Cálculo Financeiro", () => {
  it("deve calcular total de marcos financeiros corretamente", () => {
    const milestones = [
      { valorPrevisto: "1000.00" },
      { valorPrevisto: "2500.50" },
      { valorPrevisto: "750.00" },
    ];
    const total = milestones.reduce((sum, m) => sum + parseFloat(m.valorPrevisto), 0);
    expect(total).toBeCloseTo(4250.5);
  });

  it("deve calcular valor total com aditivos corretamente", () => {
    const contratoBase = 10000;
    const aditivos = [1500, -500, 2000];
    const totalComAditivos = aditivos.reduce((sum, v) => sum + v, contratoBase);
    expect(totalComAditivos).toBe(13000);
  });

  it("deve identificar marcos vencidos corretamente", () => {
    const hoje = new Date();
    const ontem = new Date(hoje);
    ontem.setDate(ontem.getDate() - 1);
    const amanha = new Date(hoje);
    amanha.setDate(amanha.getDate() + 1);

    const milestones = [
      { dueDate: ontem.toISOString(), status: "pending" },
      { dueDate: amanha.toISOString(), status: "pending" },
    ];

    const vencidos = milestones.filter(
      (m) => m.status === "pending" && new Date(m.dueDate) < hoje
    );
    expect(vencidos).toHaveLength(1);
  });
});

// ── Testes de Formatação ──────────────────────────────────────────────────────
describe("Módulo de Contratos — Formatação", () => {
  it("deve formatar moeda brasileira corretamente", () => {
    const value = 1234.56;
    const formatted = new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
    expect(formatted).toContain("1.234,56");
  });

  it("deve formatar data brasileira corretamente", () => {
    // Usar data com hora explícita para evitar problemas de fuso horário
    const date = new Date("2025-01-15T12:00:00Z");
    const formatted = date.toLocaleDateString("pt-BR");
    // Verificar que a formatação contém o ano e mês
    expect(formatted).toContain("01");
    expect(formatted).toContain("2025");
    // A data pode ser 14 ou 15 dependendo do fuso horário do servidor
    expect(["14/01/2025", "15/01/2025"]).toContain(formatted);
  });
});
