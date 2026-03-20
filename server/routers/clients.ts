/**
 * MÓDULO CLIENTES — Router tRPC
 *
 * Módulo isolado — não interfere com o SGC existente.
 * Montado em routers.ts como `clients: clientsRouter`.
 */
import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { router, protectedProcedure, publicProcedure } from "../_core/trpc";
import {
  getAllClients,
  getClientsByCompanyId,
  getClientById,
  getClientByTaxId,
  createClient,
  updateClient,
  deleteClient,
  linkClientToCompany,
  unlinkClientFromCompany,
  generateClientCode,
} from "../clients.db";
import { consultarCNPJ } from "../services/cnpjConsulta";
import { extractDataFromCNPJCard } from "../services/cnpjOcr";

// ─── Shared Input Schema ──────────────────────────────────────────────────────

const clientInputSchema = z.object({
  name: z.string().min(1),
  taxId: z.string().min(11),
  fantasyName: z.string().optional(),
  logradouro: z.string().optional(),
  complemento: z.string().optional(),
  bairro: z.string().optional(),
  cep: z.string().optional(),
  municipio: z.string().optional(),
  uf: z.string().max(2).optional(),
  telefone: z.string().optional(),
  email: z.string().optional(),
  contact: z.string().optional(),
  atividadeEconomica: z.string().optional(),
  naturezaJuridica: z.string().optional(),
  dataAbertura: z.string().optional(),
  situacaoCadastral: z.string().optional(),
  logoUrl: z.string().optional(),
});

// ─── Helpers ─────────────────────────────────────────────────────────────────

function normalizeTaxId(taxId: string): string {
  return taxId.replace(/[^\d]/g, "");
}

function parseDataAbertura(value?: string): string | undefined {
  if (!value || !value.trim()) return undefined;
  // YYYY-MM-DD direto
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) return value;
  // DD/MM/YYYY
  if (/^\d{2}\/\d{2}\/\d{4}$/.test(value)) {
    const [d, m, y] = value.split("/");
    return `${y}-${m}-${d}`;
  }
  const dateObj = new Date(value);
  if (!isNaN(dateObj.getTime())) return dateObj.toISOString().split("T")[0];
  return undefined;
}

// ─── Router ───────────────────────────────────────────────────────────────────

export const clientsRouter = router({
  /** Lista todos os clientes (global) */
  list: protectedProcedure.query(async () => {
    return getAllClients();
  }),

  /** Lista clientes vinculados a uma empresa */
  listByCompany: protectedProcedure
    .input(z.object({ companyId: z.number() }))
    .query(async ({ input }) => {
      return getClientsByCompanyId(input.companyId);
    }),

  /** Busca um cliente por ID */
  getById: protectedProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      const client = await getClientById(input.id);
      return client ?? null;
    }),

  /** Cria um novo cliente global */
  create: protectedProcedure.input(clientInputSchema).mutation(async ({ input }) => {
    const taxIdClean = normalizeTaxId(input.taxId);

    // Verificar duplicata
    const existing = await getClientByTaxId(taxIdClean);
    if (existing) {
      throw new TRPCError({
        code: "CONFLICT",
        message: `Já existe um cliente cadastrado com o CNPJ/CPF ${input.taxId}`,
      });
    }

    const clientData: any = {
      code: generateClientCode(taxIdClean),
      name: input.name,
      taxId: taxIdClean,
      fantasyName: input.fantasyName || null,
      logradouro: input.logradouro || null,
      complemento: input.complemento || null,
      bairro: input.bairro || null,
      cep: input.cep || null,
      municipio: input.municipio || null,
      uf: input.uf || null,
      telefone: input.telefone || null,
      email: input.email || null,
      contact: input.contact || null,
      atividadeEconomica: input.atividadeEconomica || null,
      naturezaJuridica: input.naturezaJuridica || null,
      dataAbertura: parseDataAbertura(input.dataAbertura) ?? null,
      situacaoCadastral: input.situacaoCadastral || null,
      logoUrl: input.logoUrl || null,
    };

    return createClient(clientData);
  }),

  /** Atualiza dados de um cliente */
  update: protectedProcedure
    .input(clientInputSchema.partial().extend({ id: z.number() }))
    .mutation(async ({ input }) => {
      const { id, taxId, dataAbertura, ...rest } = input;
      const client = await getClientById(id);
      if (!client) throw new TRPCError({ code: "NOT_FOUND", message: "Cliente não encontrado" });

      const updateData: any = { ...rest };

      if (taxId) {
        const taxIdClean = normalizeTaxId(taxId);
        const existing = await getClientByTaxId(taxIdClean);
        if (existing && existing.id !== id) {
          throw new TRPCError({
            code: "CONFLICT",
            message: `Já existe outro cliente com o CNPJ/CPF ${taxId}`,
          });
        }
        updateData.taxId = taxIdClean;
      }

      if (dataAbertura !== undefined) {
        updateData.dataAbertura = parseDataAbertura(dataAbertura) ?? null;
      }

      await updateClient(id, updateData);
      return { success: true };
    }),

  /** Exclui um cliente (apenas admin) */
  delete: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input, ctx }) => {
      if (ctx.user.role !== "admin") {
        throw new TRPCError({ code: "FORBIDDEN", message: "Apenas administradores podem excluir clientes" });
      }
      const client = await getClientById(input.id);
      if (!client) throw new TRPCError({ code: "NOT_FOUND", message: "Cliente não encontrado" });
      await deleteClient(input.id);
      return { success: true };
    }),

  /** Vincula um cliente a uma empresa */
  linkToCompany: protectedProcedure
    .input(z.object({ clientId: z.number(), companyId: z.number() }))
    .mutation(async ({ input }) => {
      return linkClientToCompany(input.clientId, input.companyId);
    }),

  /** Desvincula um cliente de uma empresa */
  unlinkFromCompany: protectedProcedure
    .input(z.object({ clientId: z.number(), companyId: z.number() }))
    .mutation(async ({ input }) => {
      await unlinkClientFromCompany(input.clientId, input.companyId);
      return { success: true };
    }),

  /** Consulta CNPJ na BrasilAPI (Receita Federal) */
  consultarCNPJ: publicProcedure
    .input(z.object({ cnpj: z.string().min(11) }))
    .query(async ({ input }) => {
      return consultarCNPJ(input.cnpj);
    }),

  /** Extrai dados de imagem/PDF do Cartão CNPJ via IA */
  extractFromCNPJCard: protectedProcedure
    .input(z.object({ imageBase64: z.string() }))
    .mutation(async ({ input }) => {
      return extractDataFromCNPJCard(input.imageBase64);
    }),
});
