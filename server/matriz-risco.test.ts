import { describe as baseDescribe, it, expect, beforeAll } from "vitest";
import { appRouter } from "./routers";

const describe = process.env.DATABASE_URL ? baseDescribe : baseDescribe.skip;

describe("Matriz de Risco - Objetivos e Projetos", () => {
  let caller: ReturnType<typeof appRouter.createCaller>;

  beforeAll(() => {
    caller = appRouter.createCaller({ user: { id: 1, name: "Test User", email: "test@example.com", role: "admin" } });
  });

  it("deve criar objetivo com campos de impacto e probabilidade", async () => {
    await caller.objetivosGrupo.create({
      titulo: "Objetivo de Teste com Risco",
      descricao: "Teste de impacto e probabilidade",
      perspectivaBSC: "financeira",
      prazo: "2026-12-31",
      status: "planejado",
      impacto: "alto",
      probabilidade: "alta",
    });

    const objetivos = await caller.objetivosGrupo.list();
    const objetivo = objetivos.find(o => o.titulo === "Objetivo de Teste com Risco");

    expect(objetivo).toBeDefined();
    expect(objetivo?.impacto).toBe("alto");
    expect(objetivo?.probabilidade).toBe("alta");
  });

  it("deve criar projeto com campos de impacto e probabilidade", async () => {
    await caller.projetosGrupo.create({
      nome: "Projeto de Teste com Risco",
      descricao: "Teste de impacto e probabilidade",
      dataInicio: "2026-01-01",
      dataFim: "2026-12-31",
      status: "planejado",
      responsavel: "João Silva",
      impacto: "medio",
      probabilidade: "media",
    });

    const projetos = await caller.projetosGrupo.list();
    const projeto = projetos.find(p => p.nome === "Projeto de Teste com Risco");

    expect(projeto).toBeDefined();
    expect(projeto?.impacto).toBe("medio");
    expect(projeto?.probabilidade).toBe("media");
  });

  it("deve atualizar impacto e probabilidade de objetivo existente", async () => {
    await caller.objetivosGrupo.create({
      titulo: "Objetivo para Atualizar Risco",
      descricao: "Teste",
      perspectivaBSC: "clientes",
      prazo: "2026-12-31",
      status: "planejado",
      impacto: "baixo",
      probabilidade: "baixa",
    });

    const objetivos = await caller.objetivosGrupo.list();
    const objetivo = objetivos.find(o => o.titulo === "Objetivo para Atualizar Risco");
    expect(objetivo).toBeDefined();

    await caller.objetivosGrupo.update({
      id: objetivo!.id,
      titulo: "Objetivo para Atualizar Risco",
      impacto: "alto",
      probabilidade: "alta",
    });

    const objetivosAtualizados = await caller.objetivosGrupo.list();
    const atualizado = objetivosAtualizados.find(o => o.id === objetivo!.id);

    expect(atualizado?.impacto).toBe("alto");
    expect(atualizado?.probabilidade).toBe("alta");
  });

  it("deve atualizar impacto e probabilidade de projeto existente", async () => {
    await caller.projetosGrupo.create({
      nome: "Projeto para Atualizar Risco",
      descricao: "Teste",
      dataInicio: "2026-01-01",
      dataFim: "2026-12-31",
      status: "planejado",
      responsavel: "Maria Santos",
      impacto: "baixo",
      probabilidade: "baixa",
    });

    const projetos = await caller.projetosGrupo.list();
    const projeto = projetos.find(p => p.nome === "Projeto para Atualizar Risco");
    expect(projeto).toBeDefined();

    await caller.projetosGrupo.update({
      id: projeto!.id,
      nome: "Projeto para Atualizar Risco",
      impacto: "alto",
      probabilidade: "alta",
    });

    const projetosAtualizados = await caller.projetosGrupo.list();
    const atualizado = projetosAtualizados.find(p => p.id === projeto!.id);

    expect(atualizado?.impacto).toBe("alto");
    expect(atualizado?.probabilidade).toBe("alta");
  });

  it("deve listar objetivos com campos de risco", async () => {
    await caller.objetivosGrupo.create({
      titulo: "Objetivo Listagem Risco",
      descricao: "Teste",
      perspectivaBSC: "processos",
      prazo: "2026-12-31",
      status: "planejado",
      impacto: "medio",
      probabilidade: "media",
    });

    const objetivos = await caller.objetivosGrupo.list();
    const objetivoComRisco = objetivos.find(o => o.titulo === "Objetivo Listagem Risco");

    expect(objetivoComRisco).toBeDefined();
    expect(objetivoComRisco?.impacto).toBe("medio");
    expect(objetivoComRisco?.probabilidade).toBe("media");
  });

  it("deve listar projetos com campos de risco", async () => {
    await caller.projetosGrupo.create({
      nome: "Projeto Listagem Risco",
      descricao: "Teste",
      dataInicio: "2026-01-01",
      dataFim: "2026-12-31",
      status: "planejado",
      responsavel: "Pedro Oliveira",
      impacto: "alto",
      probabilidade: "baixa",
    });

    const projetos = await caller.projetosGrupo.list();
    const projetoComRisco = projetos.find(p => p.nome === "Projeto Listagem Risco");

    expect(projetoComRisco).toBeDefined();
    expect(projetoComRisco?.impacto).toBe("alto");
    expect(projetoComRisco?.probabilidade).toBe("baixa");
  });

  it("deve usar valores padrão quando impacto e probabilidade não são fornecidos", async () => {
    await caller.objetivosGrupo.create({
      titulo: "Objetivo Sem Risco Explícito",
      descricao: "Teste de valores padrão",
      perspectivaBSC: "aprendizado",
      prazo: "2026-12-31",
      status: "planejado",
    });

    const objetivos = await caller.objetivosGrupo.list();
    const objetivo = objetivos.find(o => o.titulo === "Objetivo Sem Risco Explícito");

    expect(objetivo).toBeDefined();
    // Valores padrão devem ser aplicados pelo banco (medio/media)
    expect(objetivo?.impacto).toBeDefined();
    expect(objetivo?.probabilidade).toBeDefined();
  });
});
