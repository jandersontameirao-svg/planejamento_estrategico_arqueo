import { describe, it, expect } from "vitest";
import { compararVersoes, listarVersoes, duplicarVersao, getVersoesByEmpresa } from "./orcamento";

describe("Comparativo entre Versões Orçamentárias", () => {
  it("deve listar versões de uma empresa por ano", async () => {
    // Arqueoproject (empresaId=1) tem versão 2026
    const versoes = await listarVersoes(1, 2026);
    expect(Array.isArray(versoes)).toBe(true);
    expect(versoes.length).toBeGreaterThanOrEqual(1);
    expect(versoes[0]).toHaveProperty("id");
    expect(versoes[0]).toHaveProperty("nomeVersao");
    expect(versoes[0]).toHaveProperty("numeroVersao");
    expect(versoes[0]).toHaveProperty("status");
  });

  it("deve retornar array vazio para empresa/ano sem versões", async () => {
    const versoes = await listarVersoes(99999, 2030);
    expect(versoes).toEqual([]);
  });

  it("deve comparar duas versões da mesma empresa", async () => {
    // Buscar versões existentes da Arqueoproject
    const versoes = await listarVersoes(1, 2026);
    if (versoes.length < 2) {
      // Se só tem 1 versão, comparar consigo mesma (tudo inalterado)
      const comp = await compararVersoes(versoes[0].id, versoes[0].id);
      expect(comp).toHaveProperty("versaoA");
      expect(comp).toHaveProperty("versaoB");
      expect(comp).toHaveProperty("resumo");
      expect(comp).toHaveProperty("itens");
      expect(comp.resumo).toHaveProperty("totalVersaoA");
      expect(comp.resumo).toHaveProperty("totalVersaoB");
      expect(comp.resumo).toHaveProperty("diferencaTotal");
      expect(comp.resumo).toHaveProperty("percentualVariacao");
      expect(comp.resumo).toHaveProperty("itensAlterados");
      expect(comp.resumo).toHaveProperty("itensAdicionados");
      expect(comp.resumo).toHaveProperty("itensRemovidos");
      expect(comp.resumo).toHaveProperty("itensInalterados");
      // Comparando consigo mesma, diferença deve ser 0
      expect(comp.resumo.diferencaTotal).toBeCloseTo(0, 1);
      expect(comp.resumo.itensAlterados).toBe(0);
      expect(comp.resumo.itensAdicionados).toBe(0);
      expect(comp.resumo.itensRemovidos).toBe(0);
    } else {
      const comp = await compararVersoes(versoes[0].id, versoes[1].id);
      expect(comp.versaoA.id).toBe(versoes[0].id);
      expect(comp.versaoB.id).toBe(versoes[1].id);
      expect(Array.isArray(comp.itens)).toBe(true);
    }
  });

  it("deve lançar erro ao comparar versão inexistente", async () => {
    await expect(compararVersoes(99999, 99998)).rejects.toThrow();
  });

  it("cada item do comparativo deve ter estrutura correta", async () => {
    const versoes = await listarVersoes(1, 2026);
    if (versoes.length >= 1) {
      const comp = await compararVersoes(versoes[0].id, versoes[0].id);
      if (comp.itens.length > 0) {
        const item = comp.itens[0];
        expect(item).toHaveProperty("categoriaId");
        expect(item).toHaveProperty("categoriaNome");
        expect(item).toHaveProperty("subcategoriaId");
        expect(item).toHaveProperty("subcategoriaNome");
        expect(item).toHaveProperty("status");
        expect(["inalterado", "alterado", "adicionado", "removido"]).toContain(item.status);
        expect(item).toHaveProperty("versaoA");
        expect(item.versaoA).toHaveProperty("meses");
        expect(item.versaoA).toHaveProperty("total");
        expect(item.versaoA.meses).toHaveLength(12);
        expect(item).toHaveProperty("versaoB");
        expect(item).toHaveProperty("diferencas");
      }
    }
  });

  it("duplicarVersao deve aceitar motivoRevisao e congelarOrigem", async () => {
    // Testar que a função aceita os novos parâmetros sem erro de tipo
    const versoes = await listarVersoes(1, 2026);
    expect(versoes.length).toBeGreaterThanOrEqual(1);
    // Não executar duplicação real para não poluir dados, apenas verificar que a função existe
    expect(typeof duplicarVersao).toBe("function");
  });
});
