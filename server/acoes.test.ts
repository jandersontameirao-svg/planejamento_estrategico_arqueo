import { describe, it, expect, beforeAll } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

describe("Módulo de Plano de Ação", () => {
  const mockContext: TrpcContext = {
    user: {
      id: "test-user-id",
      openId: "test-open-id",
      name: "Test User",
      email: "test@example.com",
      role: "admin",
    },
  };

  const caller = appRouter.createCaller(mockContext);
  let empresaId: number;

  beforeAll(async () => {
    // Criar empresa de teste
    const empresa = await caller.empresas.create({
      nome: "Empresa Teste Ações",
      tipoAtuacao: "servicos",
      status: "ativa",
    });
    empresaId = empresa.id;
  });

  it("deve criar uma ação", async () => {
    const acao = await caller.acoesGrupo.create({
      empresaId,
      descricao: "Implementar novo sistema de CRM",
      responsavel: "João Silva",
      prazo: "2025-06-30",
      custo: "50000.00",
      status: "pendente",
    });

    expect(acao).toHaveProperty("success", true);
  });

  it("deve listar ações", async () => {
    const acoes = await caller.acoesGrupo.list();
    expect(Array.isArray(acoes)).toBe(true);
  });

  it("deve atualizar uma ação", async () => {
    // Criar ação
    await caller.acoesGrupo.create({
      empresaId,
      descricao: "Ação para atualizar",
      status: "pendente",
    });

    // Listar para pegar o ID
    const acoes = await caller.acoesGrupo.list();
    const acao = acoes.find(a => a.descricao === "Ação para atualizar");
    
    if (acao) {
      const resultado = await caller.acoesGrupo.update({
        id: acao.id,
        descricao: "Ação atualizada",
        status: "em_andamento",
      });

      expect(resultado).toHaveProperty("success", true);
    }
  });

  it("deve deletar uma ação", async () => {
    // Criar ação
    await caller.acoesGrupo.create({
      empresaId,
      descricao: "Ação para deletar",
      status: "cancelada",
    });

    // Listar para pegar o ID
    const acoes = await caller.acoesGrupo.list();
    const acao = acoes.find(a => a.descricao === "Ação para deletar");
    
    if (acao) {
      const resultado = await caller.acoesGrupo.delete({
        id: acao.id,
      });

      expect(resultado).toHaveProperty("success", true);

      // Verificar se foi deletada
      const acoesAposDelete = await caller.acoesGrupo.list();
      const acaoDeletada = acoesAposDelete.find(a => a.id === acao.id);
      expect(acaoDeletada).toBeUndefined();
    }
  });

  it("deve vincular ação a objetivo estratégico", async () => {
    // Criar objetivo
    await caller.objetivosGrupo.create({
      titulo: "Objetivo para vincular ação",
      perspectivaBSC: "financeira",
      status: "planejado",
    });

    // Buscar objetivo
    const objetivos = await caller.objetivosGrupo.list();
    const objetivo = objetivos.find(o => o.titulo === "Objetivo para vincular ação");

    if (objetivo) {
      // Criar ação vinculada
      const resultado = await caller.acoesGrupo.create({
        empresaId,
        descricao: "Ação vinculada a objetivo",
        objetivoId: objetivo.id,
        status: "pendente",
      });

      expect(resultado).toHaveProperty("success", true);

      // Verificar vinculação
      const acoesPorObjetivo = await caller.acoesGrupo.listByObjetivo({
        objetivoId: objetivo.id,
      });
      expect(acoesPorObjetivo.length).toBeGreaterThan(0);
    }
  });

  it("deve vincular ação a projeto", async () => {
    // Criar projeto
    await caller.projetosGrupo.create({
      nome: "Projeto para vincular ação",
      status: "planejado",
    });

    // Buscar projeto
    const projetos = await caller.projetosGrupo.list();
    const projeto = projetos.find(p => p.nome === "Projeto para vincular ação");

    if (projeto) {
      // Criar ação vinculada
      const resultado = await caller.acoesGrupo.create({
        empresaId,
        descricao: "Ação vinculada a projeto",
        projetoId: projeto.id,
        status: "pendente",
      });

      expect(resultado).toHaveProperty("success", true);

      // Verificar vinculação
      const acoesPorProjeto = await caller.acoesGrupo.listByProjeto({
        projetoId: projeto.id,
      });
      expect(acoesPorProjeto.length).toBeGreaterThan(0);
    }
  });

  it("deve filtrar ações por status", async () => {
    // Criar ações com diferentes status
    await caller.acoesGrupo.create({
      empresaId,
      descricao: "Ação pendente",
      status: "pendente",
    });

    await caller.acoesGrupo.create({
      empresaId,
      descricao: "Ação em andamento",
      status: "em_andamento",
    });

    // Filtrar por status
    const acoesPendentes = await caller.acoesGrupo.listByStatus({
      status: "pendente",
    });

    const acoesEmAndamento = await caller.acoesGrupo.listByStatus({
      status: "em_andamento",
    });

    expect(acoesPendentes.every(a => a.status === "pendente")).toBe(true);
    expect(acoesEmAndamento.every(a => a.status === "em_andamento")).toBe(true);
  });

  it("deve filtrar ações por responsável", async () => {
    const responsavelTeste = "Maria Santos";

    // Criar ação com responsável específico
    await caller.acoesGrupo.create({
      empresaId,
      descricao: "Ação de Maria",
      responsavel: responsavelTeste,
      status: "pendente",
    });

    // Filtrar por responsável
    const acoesMaria = await caller.acoesGrupo.listByResponsavel({
      responsavel: responsavelTeste,
    });

    expect(acoesMaria.every(a => a.responsavel === responsavelTeste)).toBe(true);
  });

  it("deve criar ação com todos os campos preenchidos", async () => {
    const resultado = await caller.acoesGrupo.create({
      empresaId,
      descricao: "Ação completa com todos os campos",
      responsavel: "Pedro Oliveira",
      prazo: "2025-12-31",
      custo: "25000.50",
      status: "em_andamento",
      observacoes: "Esta é uma ação de teste com todos os campos preenchidos",
    });

    expect(resultado).toHaveProperty("success", true);

    // Verificar se foi criada
    const acoes = await caller.acoesGrupo.list();
    const acao = acoes.find(a => a.descricao === "Ação completa com todos os campos");
    
    expect(acao).toBeDefined();
    if (acao) {
      expect(acao.responsavel).toBe("Pedro Oliveira");
      expect(acao.status).toBe("em_andamento");
      expect(acao.observacoes).toBe("Esta é uma ação de teste com todos os campos preenchidos");
    }
  });
});
