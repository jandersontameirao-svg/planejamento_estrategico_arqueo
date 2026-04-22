CREATE TABLE `balanco_patrimonial_audit_log` (
	`id` int AUTO_INCREMENT NOT NULL,
	`empresa_id` int NOT NULL,
	`balanco_id` int,
	`acao` enum('criar','editar','excluir','importar','consolidar') NOT NULL,
	`campo_alterado` varchar(100),
	`valor_antes` text,
	`valor_depois` text,
	`descricao` text,
	`usuario_id` int NOT NULL,
	`usuario_nome` varchar(255),
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `balanco_patrimonial_audit_log_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `balanco_patrimonial_dados` (
	`id` int AUTO_INCREMENT NOT NULL,
	`empresa_id` int NOT NULL,
	`mes` int NOT NULL,
	`ano` int NOT NULL,
	`ativo_tangivel` decimal(18,2) DEFAULT '0',
	`ativo_intangivel` decimal(18,2) DEFAULT '0',
	`amortizacao` decimal(18,2) DEFAULT '0',
	`clientes` decimal(18,2) DEFAULT '0',
	`outros_ativos_financeiros` decimal(18,2) DEFAULT '0',
	`outros_ativos_correntes` decimal(18,2) DEFAULT '0',
	`caixa_bancos` decimal(18,2) DEFAULT '0',
	`emprestimos_obtidos` decimal(18,2) DEFAULT '0',
	`provisoes` decimal(18,2) DEFAULT '0',
	`fornecedores` decimal(18,2) DEFAULT '0',
	`outros_passivos_financeiros` decimal(18,2) DEFAULT '0',
	`impostos_a_pagar` decimal(18,2) DEFAULT '0',
	`outras_contas_a_pagar` decimal(18,2) DEFAULT '0',
	`outros_passivos_correntes` decimal(18,2) DEFAULT '0',
	`capital_social` decimal(18,2) DEFAULT '0',
	`reservas` decimal(18,2) DEFAULT '0',
	`prestacoes_suplementares` decimal(18,2) DEFAULT '0',
	`resultados_transitados` decimal(18,2) DEFAULT '0',
	`resultado_liquido_exercicio` decimal(18,2) DEFAULT '0',
	`status` enum('rascunho','revisao','consolidado') NOT NULL DEFAULT 'rascunho',
	`observacoes` text,
	`criado_por` int,
	`criado_por_nome` varchar(255),
	`atualizado_por` int,
	`atualizado_por_nome` varchar(255),
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `balanco_patrimonial_dados_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `balanco_patrimonial_uploads` (
	`id` int AUTO_INCREMENT NOT NULL,
	`empresa_id` int NOT NULL,
	`ano` int NOT NULL,
	`nome_arquivo` varchar(500) NOT NULL,
	`url_arquivo` text NOT NULL,
	`tipo_arquivo` varchar(20) NOT NULL,
	`status` enum('processando','revisao','consolidado','erro') NOT NULL DEFAULT 'processando',
	`mensagem_erro` text,
	`dados_extraidos` json,
	`confirmado` boolean DEFAULT false,
	`criado_por` int,
	`criado_por_nome` varchar(255),
	`atualizado_por` int,
	`atualizado_por_nome` varchar(255),
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `balanco_patrimonial_uploads_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE INDEX `idx_balanco_audit_empresa` ON `balanco_patrimonial_audit_log` (`empresa_id`);--> statement-breakpoint
CREATE INDEX `idx_balanco_empresa_mes_ano` ON `balanco_patrimonial_dados` (`empresa_id`,`mes`,`ano`);