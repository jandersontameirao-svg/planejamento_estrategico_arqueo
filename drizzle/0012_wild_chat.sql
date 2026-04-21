CREATE TABLE `capital_giro_dados` (
	`id` int AUTO_INCREMENT NOT NULL,
	`empresa_id` int NOT NULL,
	`mes` int NOT NULL,
	`ano` int NOT NULL,
	`faturamento` decimal(15,2) NOT NULL DEFAULT '0',
	`cmv` decimal(15,2) NOT NULL DEFAULT '0',
	`contas_receber` decimal(15,2) NOT NULL DEFAULT '0',
	`estoques` decimal(15,2) NOT NULL DEFAULT '0',
	`contas_pagar` decimal(15,2) NOT NULL DEFAULT '0',
	`pmr` decimal(10,2),
	`pme` decimal(10,2),
	`pmpf` decimal(10,2),
	`ccc` decimal(10,2),
	`observacoes` text,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `capital_giro_dados_id` PRIMARY KEY(`id`),
	CONSTRAINT `uniq_mes_ano_empresa` UNIQUE(`empresa_id`,`mes`,`ano`)
);
--> statement-breakpoint
CREATE TABLE `dre_audit_log` (
	`id` int AUTO_INCREMENT NOT NULL,
	`entidade` varchar(100) NOT NULL,
	`entidade_id` int,
	`acao` enum('criar','editar','excluir','importar','consolidar','reclassificar','forecast') NOT NULL,
	`descricao` text NOT NULL,
	`dados_anteriores` json,
	`dados_novos` json,
	`usuario_id` int NOT NULL,
	`usuario_nome` varchar(255),
	`ip` varchar(45),
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `dre_audit_log_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `dre_dados` (
	`id` int AUTO_INCREMENT NOT NULL,
	`empresa_id` int NOT NULL,
	`ano` int NOT NULL,
	`mes` int NOT NULL,
	`tipo_lancamento` enum('realizado','orcado','projetado','forecast') NOT NULL,
	`linha_dre` varchar(100) NOT NULL,
	`conta_id` int,
	`descricao` varchar(500),
	`valor` decimal(18,2) NOT NULL DEFAULT '0',
	`projeto_id` int,
	`contrato_id` int,
	`cliente_id` int,
	`centro_custo` varchar(100),
	`upload_id` int,
	`observacoes` text,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `dre_dados_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `dre_forecast` (
	`id` int AUTO_INCREMENT NOT NULL,
	`empresa_id` int NOT NULL,
	`ano` int NOT NULL,
	`mes` int NOT NULL,
	`cenario` enum('conservador','base','otimista') NOT NULL,
	`linha_dre` varchar(100) NOT NULL,
	`valor` decimal(18,2) NOT NULL DEFAULT '0',
	`premissa` text,
	`versao` int NOT NULL DEFAULT 1,
	`criado_por` int,
	`criado_por_nome` varchar(255),
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `dre_forecast_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `dre_natureza_operacional` (
	`id` int AUTO_INCREMENT NOT NULL,
	`empresa_id` int NOT NULL,
	`natureza` enum('produto','servico') NOT NULL DEFAULT 'servico',
	`definido_por` varchar(255),
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `dre_natureza_operacional_id` PRIMARY KEY(`id`),
	CONSTRAINT `dre_natureza_operacional_empresa_id_unique` UNIQUE(`empresa_id`)
);
--> statement-breakpoint
CREATE TABLE `dre_plano_contas` (
	`id` int AUTO_INCREMENT NOT NULL,
	`codigo` varchar(20) NOT NULL,
	`nome` varchar(255) NOT NULL,
	`linha_dre` varchar(100) NOT NULL,
	`tipo` enum('receita','deducao','custo','despesa','depreciacao','resultado_financeiro','imposto') NOT NULL,
	`natureza_aplicavel` enum('produto','servico','ambos') NOT NULL DEFAULT 'ambos',
	`ordem` int NOT NULL DEFAULT 0,
	`ativo` boolean NOT NULL DEFAULT true,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `dre_plano_contas_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `dre_uploads` (
	`id` int AUTO_INCREMENT NOT NULL,
	`empresa_id` int NOT NULL,
	`nome_arquivo` varchar(500) NOT NULL,
	`tipo_arquivo` varchar(20) NOT NULL,
	`tamanho_bytes` int,
	`url_arquivo` text NOT NULL,
	`s3_key` text,
	`periodo` varchar(7),
	`ano` int,
	`mes` int,
	`status` enum('pendente','processando','processado','erro','revisado','consolidado') NOT NULL DEFAULT 'pendente',
	`erro_mensagem` text,
	`dados_extraidos` json,
	`dados_revisados` json,
	`usuario_id` int NOT NULL,
	`usuario_nome` varchar(255),
	`processado_em` timestamp,
	`revisado_em` timestamp,
	`consolidado_em` timestamp,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `dre_uploads_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `empresa_cliente` (
	`id` int AUTO_INCREMENT NOT NULL,
	`empresa_id` int NOT NULL,
	`cliente_id` int NOT NULL,
	`created_at` bigint,
	CONSTRAINT `empresa_cliente_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `planos_acao_risco` (
	`id` int AUTO_INCREMENT NOT NULL,
	`risco_id` int NOT NULL,
	`empresa_id` int NOT NULL,
	`titulo` varchar(255) NOT NULL,
	`objetivo` text,
	`descricao` text,
	`tipo_prioridade_plano` enum('corte_custos','mitigacao','prevencao','contingencia','monitoramento') NOT NULL DEFAULT 'mitigacao',
	`economia_estimada` varchar(100),
	`prazo_implementacao` varchar(100),
	`impacto_operacional` enum('nenhum','baixo','medio','alto') NOT NULL DEFAULT 'nenhum',
	`benchmarking` text,
	`acoes` json,
	`gerado_por_ia` boolean DEFAULT false,
	`ia_contexto` text,
	`status_plano_risco` enum('rascunho','ativo','concluido','cancelado') NOT NULL DEFAULT 'rascunho',
	`created_by_user_id` int,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `planos_acao_risco_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `riscos_empresa` (
	`id` int AUTO_INCREMENT NOT NULL,
	`empresa_id` int NOT NULL,
	`titulo` varchar(255) NOT NULL,
	`descricao` text,
	`origem` enum('orcamentario','estrategico','operacional','contratual','financeiro','regulatorio','outro') NOT NULL DEFAULT 'estrategico',
	`categoria_risco` enum('financeiro','juridico','operacional','prazo','escopo','reputacional','regulatorio','rh','tecnologia','outro') NOT NULL DEFAULT 'outro',
	`prob_risco` enum('baixa','media','alta') NOT NULL DEFAULT 'media',
	`impacto_risco` enum('baixo','medio','alto') NOT NULL DEFAULT 'medio',
	`sev_risco` enum('baixa','media','alta','critica') NOT NULL DEFAULT 'media',
	`status_risco` enum('identificado','em_mitigacao','mitigado','materializado','aceito','monitorando') NOT NULL DEFAULT 'identificado',
	`responsavel` varchar(255),
	`data_identificacao` date,
	`data_revisao` date,
	`contrato_id` int,
	`gerado_por_ia` boolean DEFAULT false,
	`created_by_user_id` int,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `riscos_empresa_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `riscos_historico` (
	`id` int AUTO_INCREMENT NOT NULL,
	`risco_id` int NOT NULL,
	`empresa_id` int NOT NULL,
	`user_id` int,
	`user_name` varchar(200),
	`tipo_evento` enum('criado','editado','excluido','plano_criado','plano_ia','status_alterado','comentario') NOT NULL,
	`descricao` text NOT NULL,
	`campos_alterados` json,
	`valor_anterior` json,
	`valor_novo` json,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `riscos_historico_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `contratos` MODIFY COLUMN `numero` varchar(100);--> statement-breakpoint
ALTER TABLE `contratos` MODIFY COLUMN `tipo` enum('servico','produto','misto','consultoria','manutencao','outros') NOT NULL DEFAULT 'servico';--> statement-breakpoint
ALTER TABLE `contratos` MODIFY COLUMN `status` enum('rascunho','ativo','suspenso','encerrado','rescindido') NOT NULL DEFAULT 'rascunho';--> statement-breakpoint
ALTER TABLE `contratos` MODIFY COLUMN `cliente_id` int;--> statement-breakpoint
ALTER TABLE `contratos_auditoria` MODIFY COLUMN `acao` varchar(100) NOT NULL;--> statement-breakpoint
ALTER TABLE `contratos_marcos` MODIFY COLUMN `data_prevista` date;--> statement-breakpoint
ALTER TABLE `contratos` ADD `responsavel_id` int;--> statement-breakpoint
ALTER TABLE `contratos_auditoria` ADD `contrato_id` int NOT NULL;--> statement-breakpoint
ALTER TABLE `contratos_auditoria` ADD `descricao` text;--> statement-breakpoint
ALTER TABLE `contratos_auditoria` ADD `dados_antes` text;--> statement-breakpoint
ALTER TABLE `contratos_auditoria` ADD `dados_depois` text;--> statement-breakpoint
ALTER TABLE `empresas` ADD `sgcEmpresaId` int;--> statement-breakpoint
ALTER TABLE `objetivos` ADD `responsavelOrganoId` varchar(100);--> statement-breakpoint
ALTER TABLE `objetivos` ADD `responsavelOrganoNome` varchar(255);--> statement-breakpoint
ALTER TABLE `objetivos` ADD `responsavelOrganoCargo` varchar(255);--> statement-breakpoint
ALTER TABLE `objetivos_grupo` ADD `responsavelOrganoId` varchar(100);--> statement-breakpoint
ALTER TABLE `objetivos_grupo` ADD `responsavelOrganoNome` varchar(255);--> statement-breakpoint
ALTER TABLE `objetivos_grupo` ADD `responsavelOrganoCargo` varchar(255);--> statement-breakpoint
CREATE INDEX `idx_dre_empresa_periodo` ON `dre_dados` (`empresa_id`,`ano`,`mes`);--> statement-breakpoint
CREATE INDEX `idx_dre_linha` ON `dre_dados` (`linha_dre`,`tipo_lancamento`);--> statement-breakpoint
CREATE INDEX `idx_forecast_empresa` ON `dre_forecast` (`empresa_id`,`ano`,`cenario`);--> statement-breakpoint
ALTER TABLE `contratos_auditoria` DROP COLUMN `entidade`;--> statement-breakpoint
ALTER TABLE `contratos_auditoria` DROP COLUMN `entidade_id`;--> statement-breakpoint
ALTER TABLE `contratos_auditoria` DROP COLUMN `payload_anterior`;--> statement-breakpoint
ALTER TABLE `contratos_auditoria` DROP COLUMN `payload_novo`;--> statement-breakpoint
ALTER TABLE `contratos_auditoria` DROP COLUMN `ip`;--> statement-breakpoint
ALTER TABLE `contratos_auditoria` DROP COLUMN `user_agent`;--> statement-breakpoint
ALTER TABLE `contratos_auditoria` DROP COLUMN `observacoes`;