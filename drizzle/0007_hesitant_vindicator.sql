CREATE TABLE `avaliacao_avaliadores` (
	`id` int AUTO_INCREMENT NOT NULL,
	`avaliacao_id` int NOT NULL,
	`user_id` int,
	`nome` varchar(255) NOT NULL,
	`email` varchar(320),
	`cargo` varchar(255),
	`tipo_avaliador` enum('interno','externo','gestor','cliente') NOT NULL DEFAULT 'interno',
	`status_avaliador` enum('pendente','em_andamento','concluido') NOT NULL DEFAULT 'pendente',
	`nota_calculada` decimal(5,2),
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `avaliacao_avaliadores_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `avaliacao_criterios` (
	`id` int AUTO_INCREMENT NOT NULL,
	`metodologia_id` int NOT NULL,
	`grupo_id` int NOT NULL,
	`titulo` varchar(255) NOT NULL,
	`descricao` text,
	`peso` decimal(5,2) NOT NULL DEFAULT '1.00',
	`ordem` int NOT NULL DEFAULT 0,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `avaliacao_criterios_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `avaliacao_criterios_grupos` (
	`id` int AUTO_INCREMENT NOT NULL,
	`metodologia_id` int NOT NULL,
	`nome` varchar(255) NOT NULL,
	`peso` decimal(5,2) NOT NULL DEFAULT '1.00',
	`cor` varchar(20) DEFAULT '#3B82F6',
	`ordem` int NOT NULL DEFAULT 0,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `avaliacao_criterios_grupos_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `avaliacao_metodologias` (
	`id` int AUTO_INCREMENT NOT NULL,
	`empresa_id` int NOT NULL,
	`nome` varchar(255) NOT NULL,
	`tipo_metodologia` enum('360','nps','csat','customizada') NOT NULL DEFAULT 'customizada',
	`descricao` text,
	`escala_min` int NOT NULL DEFAULT 0,
	`escala_max` int NOT NULL DEFAULT 10,
	`nota_minima` decimal(5,2) NOT NULL DEFAULT '7.00',
	`ativa` boolean NOT NULL DEFAULT true,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `avaliacao_metodologias_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `avaliacao_plano_itens` (
	`id` int AUTO_INCREMENT NOT NULL,
	`plano_id` int NOT NULL,
	`acao` varchar(500) NOT NULL,
	`responsavel` varchar(255),
	`prazo` date,
	`status_item_plano` enum('pendente','em_andamento','concluido') NOT NULL DEFAULT 'pendente',
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `avaliacao_plano_itens_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `avaliacao_planos` (
	`id` int AUTO_INCREMENT NOT NULL,
	`avaliacao_id` int NOT NULL,
	`contrato_id` int NOT NULL,
	`titulo` varchar(255) NOT NULL,
	`descricao` text,
	`status_plano` enum('aberto','em_andamento','concluido','cancelado') NOT NULL DEFAULT 'aberto',
	`prazo` date,
	`responsavel` varchar(255),
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `avaliacao_planos_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `avaliacao_respostas` (
	`id` int AUTO_INCREMENT NOT NULL,
	`avaliacao_id` int NOT NULL,
	`avaliador_id` int NOT NULL,
	`criterio_id` int NOT NULL,
	`nota` decimal(5,2) NOT NULL,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `avaliacao_respostas_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `contratos_avaliacoes` (
	`id` int AUTO_INCREMENT NOT NULL,
	`contrato_id` int NOT NULL,
	`empresa_id` int NOT NULL,
	`metodologia_id` int NOT NULL,
	`titulo` varchar(255) NOT NULL,
	`descricao` text,
	`periodo` varchar(50),
	`status_avaliacao` enum('rascunho','em_andamento','finalizada','cancelada') NOT NULL DEFAULT 'rascunho',
	`nota_final` decimal(5,2),
	`plano_acao_triggered` boolean NOT NULL DEFAULT false,
	`plano_acao_id` int,
	`gestor_user_id` int,
	`observacoes` text,
	`created_by_user_id` int,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `contratos_avaliacoes_id` PRIMARY KEY(`id`)
);
