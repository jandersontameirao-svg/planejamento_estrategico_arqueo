CREATE TABLE `aprovacao_acoes` (
	`id` int AUTO_INCREMENT NOT NULL,
	`boletim_id` int NOT NULL,
	`user_id` int NOT NULL,
	`action_aprovacao_acao` enum('SUBMITTED','APPROVED','REJECTED','CHANGES_REQUESTED','SIGNED','APPROVED_MANUAL') NOT NULL,
	`observations` text,
	`approval_method` enum('EMAIL','PDF_ASSINADO','SEI','PORTAL_CLIENTE','OUTRO'),
	`approver_name` varchar(255),
	`approver_email` varchar(255),
	`approved_at` timestamp,
	`attachment_file_key` varchar(500),
	`attachment_file_url` varchar(1000),
	`attachment_file_name` varchar(255),
	`metadata` json,
	`notes` text,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`created_by` int,
	CONSTRAINT `aprovacao_acoes_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `boletins_aprovacao_historico` (
	`id` int AUTO_INCREMENT NOT NULL,
	`code` varchar(20) NOT NULL,
	`boletim_id` int NOT NULL,
	`aprovador_id` int,
	`action_aprovacao` enum('submitted','approved','rejected','returned','paid') NOT NULL,
	`status_aprovacao` enum('pending','approved','rejected','returned') NOT NULL,
	`observations` text,
	`pdf_url` varchar(500),
	`pdf_file_key` varchar(500),
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `boletins_aprovacao_historico_id` PRIMARY KEY(`id`),
	CONSTRAINT `boletins_aprovacao_historico_code_unique` UNIQUE(`code`)
);
--> statement-breakpoint
CREATE TABLE `boletins_aprovacao_links` (
	`id` int AUTO_INCREMENT NOT NULL,
	`code` varchar(50) NOT NULL,
	`boletim_id` int NOT NULL,
	`aprovador_id` int NOT NULL,
	`token` varchar(255) NOT NULL,
	`expires_at` timestamp,
	`accessed_at` timestamp,
	`is_used` boolean NOT NULL DEFAULT false,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `boletins_aprovacao_links_id` PRIMARY KEY(`id`),
	CONSTRAINT `boletins_aprovacao_links_code_unique` UNIQUE(`code`),
	CONSTRAINT `boletins_aprovacao_links_token_unique` UNIQUE(`token`)
);
--> statement-breakpoint
CREATE TABLE `boletins_aprovacao_tokens` (
	`id` int AUTO_INCREMENT NOT NULL,
	`token` varchar(64) NOT NULL,
	`boletim_id` int NOT NULL,
	`aprovador_email` varchar(320) NOT NULL,
	`status_token` enum('PENDING','USED','EXPIRED') NOT NULL DEFAULT 'PENDING',
	`action_token` enum('APPROVED','REJECTED'),
	`observations` text,
	`expires_at` timestamp NOT NULL,
	`used_at` timestamp,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `boletins_aprovacao_tokens_id` PRIMARY KEY(`id`),
	CONSTRAINT `boletins_aprovacao_tokens_token_unique` UNIQUE(`token`)
);
--> statement-breakpoint
CREATE TABLE `boletins_aprovadores` (
	`id` int AUTO_INCREMENT NOT NULL,
	`code` varchar(20) NOT NULL,
	`contrato_id` int NOT NULL,
	`nome` varchar(255) NOT NULL,
	`email` varchar(255) NOT NULL,
	`role_aprovador` enum('project_manager','financial','technical','other') NOT NULL,
	`is_active` boolean NOT NULL DEFAULT true,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `boletins_aprovadores_id` PRIMARY KEY(`id`),
	CONSTRAINT `boletins_aprovadores_code_unique` UNIQUE(`code`)
);
--> statement-breakpoint
CREATE TABLE `boletins_cliente_aprovacoes` (
	`id` int AUTO_INCREMENT NOT NULL,
	`boletim_id` int NOT NULL,
	`aprovador_id` int NOT NULL,
	`approval_status_cliente` enum('pending','approved','rejected') NOT NULL DEFAULT 'pending',
	`approved_at` timestamp,
	`rejected_at` timestamp,
	`observations` text,
	`rejection_reason` text,
	`client_contact_name` varchar(255),
	`client_contact_email` varchar(255),
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `boletins_cliente_aprovacoes_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `boletins_medicao` (
	`id` int AUTO_INCREMENT NOT NULL,
	`code` varchar(50) NOT NULL,
	`contrato_id` int NOT NULL,
	`marco_id` int,
	`scope_marco_id` int,
	`period_start` timestamp NOT NULL,
	`period_end` timestamp NOT NULL,
	`reference_code` varchar(100),
	`status_boletim` enum('DRAFT','SUBMITTED','IN_REVIEW','CHANGES_REQUESTED','APPROVED','REJECTED','EXPORTED_MANUAL','APPROVED_MANUAL','SIGNED','PAID','CANCELLED') NOT NULL DEFAULT 'DRAFT',
	`payment_status_boletim` enum('UNPAID','PAID') NOT NULL DEFAULT 'UNPAID',
	`total` decimal(15,2) NOT NULL DEFAULT '0',
	`origin_boletim` enum('MANUAL','AUTO_FROM_AI_MILESTONES') NOT NULL DEFAULT 'MANUAL',
	`source_run_id` varchar(255),
	`current_approver_id` int,
	`approver_name` varchar(255),
	`approver_email` varchar(255),
	`submitted_at` timestamp,
	`approved_at` timestamp,
	`rejected_at` timestamp,
	`rejection_reason` text,
	`observations` text,
	`approval_observations` text,
	`created_by` int NOT NULL,
	`updated_by` int,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `boletins_medicao_id` PRIMARY KEY(`id`),
	CONSTRAINT `boletins_medicao_code_unique` UNIQUE(`code`),
	CONSTRAINT `unique_source_run_boletim` UNIQUE(`contrato_id`,`source_run_id`)
);
--> statement-breakpoint
CREATE TABLE `boletins_medicao_itens` (
	`id` int AUTO_INCREMENT NOT NULL,
	`boletim_id` int NOT NULL,
	`descricao` text NOT NULL,
	`quantidade` decimal(15,2) NOT NULL,
	`unidade` varchar(50) NOT NULL,
	`preco_unitario` decimal(15,2) NOT NULL,
	`total` decimal(15,2) NOT NULL,
	`marco_id` int,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `boletins_medicao_itens_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `contratos_recomendacoes` (
	`id` int AUTO_INCREMENT NOT NULL,
	`contrato_id` int NOT NULL,
	`empresa_id` int NOT NULL,
	`type_recomendacao` enum('clause','process','monitoring','documentation','financial') NOT NULL,
	`priority_recomendacao` enum('high','medium','low') NOT NULL DEFAULT 'medium',
	`title` varchar(255) NOT NULL,
	`description` text NOT NULL,
	`reasoning` text,
	`related_risks` json,
	`based_on_contracts` json,
	`was_helpful` boolean,
	`feedback_notes` text,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `contratos_recomendacoes_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `contratos_responsaveis` (
	`id` int AUTO_INCREMENT NOT NULL,
	`contrato_id` int NOT NULL,
	`responsible_name` varchar(255) NOT NULL,
	`responsible_email` varchar(255) NOT NULL,
	`financial_email` varchar(255) NOT NULL,
	`role` varchar(100),
	`is_active` boolean NOT NULL DEFAULT true,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `contratos_responsaveis_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `ia_analise_historico` (
	`id` int AUTO_INCREMENT NOT NULL,
	`code` varchar(20) NOT NULL,
	`contrato_id` int,
	`aditivo_id` int,
	`user_id` int NOT NULL,
	`analysis_type_ia` enum('contract','amendment') NOT NULL,
	`extracted_data` json NOT NULL,
	`file_name` varchar(255),
	`file_url` varchar(500),
	`file_key` varchar(500),
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `ia_analise_historico_id` PRIMARY KEY(`id`),
	CONSTRAINT `ia_analise_historico_code_unique` UNIQUE(`code`)
);
--> statement-breakpoint
CREATE TABLE `marcos_alertas` (
	`id` int AUTO_INCREMENT NOT NULL,
	`code` varchar(20) NOT NULL,
	`marco_id` int NOT NULL,
	`contrato_id` int NOT NULL,
	`empresa_id` int NOT NULL,
	`alert_type_marco` enum('approaching_due','due_today','overdue','overdue_critical') NOT NULL,
	`status_alerta_marco` enum('active','acknowledged','resolved','dismissed') NOT NULL DEFAULT 'active',
	`notification_sent` boolean NOT NULL DEFAULT false,
	`notification_sent_at` timestamp,
	`acknowledged_at` timestamp,
	`days_before_due` int,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `marcos_alertas_id` PRIMARY KEY(`id`),
	CONSTRAINT `marcos_alertas_code_unique` UNIQUE(`code`)
);
--> statement-breakpoint
CREATE TABLE `sequencias` (
	`key` varchar(100) NOT NULL,
	`current_value` int NOT NULL DEFAULT 0,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `sequencias_key` PRIMARY KEY(`key`)
);
--> statement-breakpoint
CREATE INDEX `aprovacao_acoes_boletim_id_idx` ON `aprovacao_acoes` (`boletim_id`);