CREATE TABLE `areas_negocio` (
	`id` int AUTO_INCREMENT NOT NULL,
	`nome` varchar(255) NOT NULL,
	`descricao` text,
	`pais` varchar(100),
	`status` enum('ativa','inativa') NOT NULL DEFAULT 'ativa',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `areas_negocio_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `empresas` ADD `areaId` int;