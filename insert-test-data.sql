-- Buscar primeira empresa
SELECT id, nome FROM empresas LIMIT 1;

-- Inserir objetivos de teste
INSERT INTO objetivos_grupo (titulo, descricao, status, data_inicio, data_fim, empresa_id, impacto, probabilidade, metodologia, observacoes)
VALUES 
  ('Aumentar Receita em 30%', 'Objetivo estratégico de crescimento de receita', 'em_progresso', '2024-01-01', '2024-12-31', 1, 'alto', 'alta', 'matriz_risco_padrao', 'Risco crítico - requer atenção imediata'),
  ('Reduzir Custos Operacionais', 'Otimização de processos para redução de custos', 'em_progresso', '2024-01-15', '2024-06-30', 1, 'medio', 'media', 'iso31000', 'Risco médio - monitorar regularmente'),
  ('Melhorar Satisfação do Cliente', 'Implementar programa de qualidade de atendimento', 'planejado', '2024-02-01', '2024-08-31', 1, 'alto', 'media', 'coso', 'Risco alto - impacto significativo'),
  ('Expandir para Novo Mercado', 'Entrada em novo segmento de mercado', 'planejado', '2024-03-01', '2024-12-31', 1, 'baixo', 'baixa', 'matriz_risco_padrao', 'Risco baixo - boa oportunidade'),
  ('Implementar Sistema ERP', 'Modernização de infraestrutura de TI', 'em_progresso', '2024-01-10', '2024-09-30', 1, 'alto', 'baixa', 'iso31000', 'Risco médio - probabilidade baixa mas impacto alto');

-- Inserir projetos de teste
INSERT INTO projetos_grupo (nome, descricao, status, data_inicio, data_fim, empresa_id, impacto, probabilidade, metodologia, observacoes)
VALUES 
  ('Projeto A - Desenvolvimento de App', 'Desenvolvimento de aplicativo mobile', 'em_progresso', '2024-01-01', '2024-06-30', 1, 'medio', 'alta', 'matriz_risco_padrao', 'Risco alto - prazo apertado'),
  ('Projeto B - Migração de Dados', 'Migração de dados para novo datacenter', 'planejado', '2024-02-15', '2024-04-30', 1, 'alto', 'media', 'coso', 'Risco alto - dados críticos'),
  ('Projeto C - Treinamento de Equipe', 'Programa de capacitação profissional', 'em_progresso', '2024-01-20', '2024-05-31', 1, 'baixo', 'media', 'iso31000', 'Risco baixo - investimento em pessoas'),
  ('Projeto D - Segurança da Informação', 'Implementação de políticas de segurança', 'planejado', '2024-03-01', '2024-08-31', 1, 'alto', 'alta', 'matriz_risco_padrao', 'Risco crítico - segurança é prioridade'),
  ('Projeto E - Otimização de Processos', 'Reengenharia de processos operacionais', 'em_progresso', '2024-02-01', '2024-07-31', 1, 'medio', 'baixa', 'coso', 'Risco médio - mudanças organizacionais');
