import { getDb } from "./server/db.ts";
import { objetivosGrupo, projetosGrupo } from "./drizzle/schema.ts";
import { eq } from "drizzle-orm";

async function seedTestData() {
  console.log("🌱 Iniciando seed de dados de teste para matriz de risco...");

  try {
    const db = await getDb();

    // Buscar primeira empresa
    const empresas = await db.query.empresas.findMany({ limit: 1 });
    if (empresas.length === 0) {
      console.error("❌ Nenhuma empresa encontrada. Crie uma empresa primeiro.");
      process.exit(1);
    }

    const empresaId = empresas[0].id;
    console.log(`✅ Usando empresa: ${empresas[0].nome} (ID: ${empresaId})`);

    // Limpar dados anteriores
    await db.delete(objetivosGrupo).where(eq(objetivosGrupo.empresaId, empresaId));
    await db.delete(projetosGrupo).where(eq(projetosGrupo.empresaId, empresaId));
    console.log("🗑️  Dados anteriores removidos");

    // Inserir objetivos de teste com diferentes posições na matriz
    const objetivos = [
      {
        titulo: "Aumentar Receita em 30%",
        descricao: "Objetivo estratégico de crescimento de receita",
        status: "em_progresso",
        dataInicio: new Date("2024-01-01"),
        dataFim: new Date("2024-12-31"),
        empresaId,
        impacto: "alto",
        probabilidade: "alta",
        metodologia: "matriz_risco_padrao",
        observacoes: "Risco crítico - requer atenção imediata",
      },
      {
        titulo: "Reduzir Custos Operacionais",
        descricao: "Otimização de processos para redução de custos",
        status: "em_progresso",
        dataInicio: new Date("2024-01-15"),
        dataFim: new Date("2024-06-30"),
        empresaId,
        impacto: "medio",
        probabilidade: "media",
        metodologia: "iso31000",
        observacoes: "Risco médio - monitorar regularmente",
      },
      {
        titulo: "Melhorar Satisfação do Cliente",
        descricao: "Implementar programa de qualidade de atendimento",
        status: "planejado",
        dataInicio: new Date("2024-02-01"),
        dataFim: new Date("2024-08-31"),
        empresaId,
        impacto: "alto",
        probabilidade: "media",
        metodologia: "coso",
        observacoes: "Risco alto - impacto significativo",
      },
      {
        titulo: "Expandir para Novo Mercado",
        descricao: "Entrada em novo segmento de mercado",
        status: "planejado",
        dataInicio: new Date("2024-03-01"),
        dataFim: new Date("2024-12-31"),
        empresaId,
        impacto: "baixo",
        probabilidade: "baixa",
        metodologia: "matriz_risco_padrao",
        observacoes: "Risco baixo - boa oportunidade",
      },
      {
        titulo: "Implementar Sistema ERP",
        descricao: "Modernização de infraestrutura de TI",
        status: "em_progresso",
        dataInicio: new Date("2024-01-10"),
        dataFim: new Date("2024-09-30"),
        empresaId,
        impacto: "alto",
        probabilidade: "baixa",
        metodologia: "iso31000",
        observacoes: "Risco médio - probabilidade baixa mas impacto alto",
      },
    ];

    await db.insert(objetivosGrupo).values(objetivos);
    console.log(`✅ ${objetivos.length} objetivos de teste inseridos`);

    // Inserir projetos de teste
    const projetos = [
      {
        nome: "Projeto A - Desenvolvimento de App",
        descricao: "Desenvolvimento de aplicativo mobile",
        status: "em_progresso",
        dataInicio: new Date("2024-01-01"),
        dataFim: new Date("2024-06-30"),
        empresaId,
        impacto: "medio",
        probabilidade: "alta",
        metodologia: "matriz_risco_padrao",
        observacoes: "Risco alto - prazo apertado",
      },
      {
        nome: "Projeto B - Migração de Dados",
        descricao: "Migração de dados para novo datacenter",
        status: "planejado",
        dataInicio: new Date("2024-02-15"),
        dataFim: new Date("2024-04-30"),
        empresaId,
        impacto: "alto",
        probabilidade: "media",
        metodologia: "coso",
        observacoes: "Risco alto - dados críticos",
      },
      {
        nome: "Projeto C - Treinamento de Equipe",
        descricao: "Programa de capacitação profissional",
        status: "em_progresso",
        dataInicio: new Date("2024-01-20"),
        dataFim: new Date("2024-05-31"),
        empresaId,
        impacto: "baixo",
        probabilidade: "media",
        metodologia: "iso31000",
        observacoes: "Risco baixo - investimento em pessoas",
      },
      {
        nome: "Projeto D - Segurança da Informação",
        descricao: "Implementação de políticas de segurança",
        status: "planejado",
        dataInicio: new Date("2024-03-01"),
        dataFim: new Date("2024-08-31"),
        empresaId,
        impacto: "alto",
        probabilidade: "alta",
        metodologia: "matriz_risco_padrao",
        observacoes: "Risco crítico - segurança é prioridade",
      },
      {
        nome: "Projeto E - Otimização de Processos",
        descricao: "Reengenharia de processos operacionais",
        status: "em_progresso",
        dataInicio: new Date("2024-02-01"),
        dataFim: new Date("2024-07-31"),
        empresaId,
        impacto: "medio",
        probabilidade: "baixa",
        metodologia: "coso",
        observacoes: "Risco médio - mudanças organizacionais",
      },
    ];

    await db.insert(projetosGrupo).values(projetos);
    console.log(`✅ ${projetos.length} projetos de teste inseridos`);

    console.log("\n✅ Seed de dados de teste concluído com sucesso!");
    console.log(`📊 Total: ${objetivos.length} objetivos + ${projetos.length} projetos`);
    console.log("🎯 Acesse a página de Matriz de Risco para visualizar os dados");

    process.exit(0);
  } catch (error) {
    console.error("❌ Erro ao fazer seed:", error);
    process.exit(1);
  }
}

seedTestData();
