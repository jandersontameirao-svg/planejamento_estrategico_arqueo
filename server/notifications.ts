import { getDb } from "./db";
import { notifyOwner } from "./_core/notification";

export async function checkAndNotifyIncompleteAnalyses() {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const { empresas } = await import("../drizzle/schema");
  const { sql } = await import("drizzle-orm");

  // Buscar todas as empresas ativas
  const allEmpresas = await db.select().from(empresas);

  const notificacoes: string[] = [];

  for (const empresa of allEmpresas) {
    const empresaId = empresa.id;
    const empresaNome = empresa.nome;

    // Verificar PESTEL
    const pestelCount: any = await db.execute(sql`
      SELECT COUNT(*) as count FROM pestel_fatores WHERE empresaId = ${empresaId}
    `);
    const pestelTotal = pestelCount.rows?.[0]?.count || pestelCount[0]?.count || 0;
    const pestelProgresso = Math.min((pestelTotal / 6) * 100, 100);

    if (pestelTotal > 0 && pestelProgresso < 50) {
      notificacoes.push(
        `⚠️ ${empresaNome}: Análise PESTEL incompleta (${pestelProgresso.toFixed(0)}% - ${pestelTotal}/6 fatores)`
      );
    }

    // Verificar SWOT
    const swotCount: any = await db.execute(sql`
      SELECT COUNT(*) as count FROM analise_swot_tows WHERE empresaId = ${empresaId}
    `);
    const swotTotal = swotCount.rows?.[0]?.count || swotCount[0]?.count || 0;
    const swotProgresso = Math.min((swotTotal / 8) * 100, 100);

    if (swotTotal > 0 && swotProgresso < 50) {
      notificacoes.push(
        `⚠️ ${empresaNome}: Análise SWOT incompleta (${swotProgresso.toFixed(0)}% - ${swotTotal}/8 itens)`
      );
    }

    // Verificar OKR
    const okrCount: any = await db.execute(sql`
      SELECT COUNT(*) as count FROM analise_okr WHERE empresaId = ${empresaId}
    `);
    const okrTotal = okrCount.rows?.[0]?.count || okrCount[0]?.count || 0;
    const okrProgresso = Math.min((okrTotal / 3) * 100, 100);

    if (okrTotal > 0 && okrProgresso < 50) {
      notificacoes.push(
        `⚠️ ${empresaNome}: OKRs incompletos (${okrProgresso.toFixed(0)}% - ${okrTotal}/3 objetivos)`
      );
    }

    // Verificar BSC
    const bscCount: any = await db.execute(sql`
      SELECT COUNT(*) as count FROM bsc_indicadores WHERE empresaId = ${empresaId}
    `);
    const bscTotal = bscCount.rows?.[0]?.count || bscCount[0]?.count || 0;
    const bscProgresso = Math.min((bscTotal / 8) * 100, 100);

    if (bscTotal > 0 && bscProgresso < 50) {
      notificacoes.push(
        `⚠️ ${empresaNome}: BSC incompleto (${bscProgresso.toFixed(0)}% - ${bscTotal}/8 indicadores)`
      );
    }
  }

  // Enviar notificação se houver análises incompletas
  if (notificacoes.length > 0) {
    const mensagem = `Análises Estratégicas Incompletas:\n\n${notificacoes.join("\n")}`;
    await notifyOwner({
      title: "🔔 Alerta: Análises Incompletas",
      content: mensagem,
    });
    return { success: true, count: notificacoes.length, notificacoes };
  }

  return { success: true, count: 0, notificacoes: [] };
}

export async function checkAndNotifyOkrsAtRisk() {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const { empresas } = await import("../drizzle/schema");
  const { sql } = await import("drizzle-orm");

  // Buscar todas as empresas ativas
  const allEmpresas = await db.select().from(empresas);

  const alertas: string[] = [];

  for (const empresa of allEmpresas) {
    const empresaId = empresa.id;
    const empresaNome = empresa.nome;

    // Buscar OKRs da empresa
    const okrs: any = await db.execute(sql`
      SELECT objetivo, progresso, periodo
      FROM analise_okr
      WHERE empresaId = ${empresaId}
    `);

    const okrsList = okrs.rows || okrs;

    okrsList.forEach((okr: any) => {
      const progresso = okr.progresso || 0;
      const periodo = okr.periodo || "";

      // Verificar se o progresso está abaixo de 30% (risco)
      if (progresso < 30) {
        alertas.push(
          `🚨 ${empresaNome}: OKR "${okr.objetivo}" com progresso crítico (${progresso}%) ${periodo ? `- Período: ${periodo}` : ""}`
        );
      }
    });
  }

  // Enviar notificação se houver OKRs em risco
  if (alertas.length > 0) {
    const mensagem = `OKRs em Risco (Progresso < 30%):\n\n${alertas.join("\n")}`;
    await notifyOwner({
      title: "🚨 Alerta: OKRs em Risco",
      content: mensagem,
    });
    return { success: true, count: alertas.length, alertas };
  }

  return { success: true, count: 0, alertas: [] };
}
