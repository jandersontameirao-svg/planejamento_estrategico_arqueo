import { router, protectedProcedure } from "../_core/trpc";
import { organogramClient } from "../integrations/organogramClient";

export const organogramaRouter = router({
  /**
   * Visão geral: totais e métricas do organograma
   */
  overview: protectedProcedure.query(async () => {
    return organogramClient.getOverview();
  }),

  /**
   * Árvore hierárquica completa com pessoas em cada cargo
   */
  tree: protectedProcedure.query(async () => {
    return organogramClient.getTree();
  }),

  /**
   * Lideranças do grupo (cargos raiz)
   */
  leaders: protectedProcedure.query(async () => {
    return organogramClient.getLeaders();
  }),

  /**
   * Departamentos com contagem de cargos e pessoas
   */
  departments: protectedProcedure.query(async () => {
    return organogramClient.getDepartments();
  }),
});
