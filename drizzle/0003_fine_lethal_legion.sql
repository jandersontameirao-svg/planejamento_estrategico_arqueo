CREATE TABLE `identidade_grupo` (
	`id` int AUTO_INCREMENT NOT NULL,
	`missao` text,
	`visao` text,
	`valores` text,
	`politica` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `identidade_grupo_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `objetivos_grupo` (
	`id` int AUTO_INCREMENT NOT NULL,
	`titulo` varchar(255) NOT NULL,
	`descricao` text,
	`prazo` date,
	`status` enum('planejado','em_andamento','concluido','cancelado') DEFAULT 'planejado',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `objetivos_grupo_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `kpis` MODIFY COLUMN `empresaId` int;