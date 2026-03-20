CREATE TABLE `audit_logs` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`entityType` varchar(50) NOT NULL,
	`entityId` int NOT NULL,
	`action_audit` enum('create','update','delete','apply','sign') NOT NULL,
	`changes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `audit_logs_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `contract_amendments` (
	`id` int AUTO_INCREMENT NOT NULL,
	`contract_id` int NOT NULL,
	`business_number` varchar(30) NOT NULL,
	`seq` int NOT NULL,
	`title` varchar(255) NOT NULL,
	`description` text,
	`tipo_amendment` enum('financeiro','escopo') NOT NULL DEFAULT 'escopo',
	`additional_value` decimal(15,2) NOT NULL,
	`start_date` timestamp NOT NULL,
	`end_date` timestamp,
	`status_amendment` enum('active','completed','cancelled') NOT NULL DEFAULT 'active',
	`pdf_url` varchar(500),
	`pdf_file_key` varchar(500),
	`change_types` json,
	`financial_impact` json,
	`schedule_impact` json,
	`scope_changes` text,
	`ai_analysis` json,
	`effective_date` date,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `contract_amendments_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `contract_approvers` (
	`id` int AUTO_INCREMENT NOT NULL,
	`contract_id` int NOT NULL,
	`name` varchar(255) NOT NULL,
	`email` varchar(255) NOT NULL,
	`role` varchar(100),
	`order` int NOT NULL DEFAULT 1,
	`status_approver` enum('pending','approved','rejected') NOT NULL DEFAULT 'pending',
	`approved_at` timestamp,
	`observations` text,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `contract_approvers_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `contract_documents` (
	`id` int AUTO_INCREMENT NOT NULL,
	`contract_id` int NOT NULL,
	`name` varchar(255) NOT NULL,
	`type` varchar(100),
	`url` varchar(1000) NOT NULL,
	`file_key` varchar(500),
	`size` int,
	`mime_type` varchar(100),
	`ai_classification` varchar(255),
	`uploaded_by` int,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `contract_documents_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `contract_responsible` (
	`id` int AUTO_INCREMENT NOT NULL,
	`contract_id` int NOT NULL,
	`user_id` int,
	`name` varchar(255) NOT NULL,
	`email` varchar(255) NOT NULL,
	`role` varchar(100),
	`type_responsible` enum('manager','approver','executor','witness') NOT NULL DEFAULT 'executor',
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `contract_responsible_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `contract_risks` (
	`id` int AUTO_INCREMENT NOT NULL,
	`contract_id` int NOT NULL,
	`tipo_risk` enum('financeiro','legal','operacional','prazo') NOT NULL,
	`descricao` text NOT NULL,
	`severidade` enum('baixa','media','alta','critica') NOT NULL DEFAULT 'media',
	`acoes_mitigacao` text,
	`responsavel` varchar(255),
	`status_risk` enum('aberto','mitigado','aceito','fechado') NOT NULL DEFAULT 'aberto',
	`origin_risk` enum('manual','ai') NOT NULL DEFAULT 'manual',
	`confidence_risk` decimal(3,2),
	`evidence_quotes_risk` text,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `contract_risks_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `contracts` (
	`id` int AUTO_INCREMENT NOT NULL,
	`code` varchar(50),
	`business_number` varchar(20),
	`signed_date` date,
	`signed_year` int,
	`signed_seq` int,
	`is_signed` tinyint NOT NULL DEFAULT 0,
	`companyId` int NOT NULL,
	`clientId` int NOT NULL,
	`contract_seq` int,
	`title` varchar(255) NOT NULL,
	`description` text,
	`totalValue` decimal(15,2) NOT NULL,
	`startDate` timestamp NOT NULL,
	`endDate` timestamp,
	`status_contract` enum('active','completed','cancelled') NOT NULL DEFAULT 'active',
	`observations` text,
	`pdf_url` varchar(1000),
	`pdf_file_key` varchar(500),
	`manager_user_id` int,
	`manager_name` varchar(255),
	`manager_email` varchar(255),
	`approver_name` varchar(255),
	`approver_email` varchar(255),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `contracts_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `financial_milestones` (
	`id` int AUTO_INCREMENT NOT NULL,
	`contract_id` int NOT NULL,
	`amendment_id` int,
	`description` text NOT NULL,
	`valor_previsto` decimal(15,2) NOT NULL,
	`valor_pago` decimal(15,2) NOT NULL DEFAULT '0',
	`due_date` timestamp NOT NULL,
	`prazo_pagamento` int NOT NULL DEFAULT 0,
	`status_milestone` enum('pending','paid','overdue','cancelled') NOT NULL DEFAULT 'pending',
	`paid_date` timestamp,
	`data_recebimento` timestamp,
	`origin_milestone` enum('manual','ai') NOT NULL DEFAULT 'manual',
	`confidence` decimal(3,2) DEFAULT '1.00',
	`evidence_quotes` text,
	`condition_text` text,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `financial_milestones_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `sequences` (
	`id` int AUTO_INCREMENT NOT NULL,
	`key` varchar(100) NOT NULL,
	`current_value` int NOT NULL DEFAULT 0,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `sequences_id` PRIMARY KEY(`id`),
	CONSTRAINT `sequences_key_unique` UNIQUE(`key`)
);
