CREATE TABLE `pestel_fatores` (
	`id` int AUTO_INCREMENT NOT NULL,
	`empresaId` int NOT NULL,
	`categoria` enum('politico','economico','social','tecnologico','ambiental','legal') NOT NULL,
	`descricao` text NOT NULL,
	`impacto` int NOT NULL,
	`probabilidade` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `pestel_fatores_id` PRIMARY KEY(`id`)
);
