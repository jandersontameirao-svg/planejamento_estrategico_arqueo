CREATE TABLE `objetivo_grupo_kpis` (
	`id` int AUTO_INCREMENT NOT NULL,
	`objetivoId` int NOT NULL,
	`kpiId` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `objetivo_grupo_kpis_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `projeto_grupo_kpis` (
	`id` int AUTO_INCREMENT NOT NULL,
	`projetoId` int NOT NULL,
	`kpiId` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `projeto_grupo_kpis_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `projetos_grupo` (
	`id` int AUTO_INCREMENT NOT NULL,
	`nome` varchar(255) NOT NULL,
	`descricao` text,
	`objetivoId` int,
	`area` varchar(100),
	`responsavel` varchar(255),
	`dataInicio` date,
	`dataFim` date,
	`status` enum('planejado','em_andamento','concluido','cancelado') NOT NULL DEFAULT 'planejado',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `projetos_grupo_id` PRIMARY KEY(`id`)
);
