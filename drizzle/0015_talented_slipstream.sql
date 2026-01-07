CREATE TABLE `template_configs` (
	`id` int AUTO_INCREMENT NOT NULL,
	`empresaId` int NOT NULL,
	`logoUrl` text,
	`logoKey` text,
	`corPrimaria` varchar(7) NOT NULL DEFAULT '#8B1538',
	`corSecundaria` varchar(7) NOT NULL DEFAULT '#FF6B35',
	`incluirPestel` tinyint NOT NULL DEFAULT 1,
	`incluirSwot` tinyint NOT NULL DEFAULT 1,
	`incluirOkr` tinyint NOT NULL DEFAULT 1,
	`incluirBsc` tinyint NOT NULL DEFAULT 1,
	`incluirGraficos` tinyint NOT NULL DEFAULT 1,
	`incluirRecomendacoes` tinyint NOT NULL DEFAULT 1,
	`rodapePersonalizado` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `template_configs_id` PRIMARY KEY(`id`)
);
