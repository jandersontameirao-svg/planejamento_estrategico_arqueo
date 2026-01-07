CREATE TABLE `template_versions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`empresaId` int NOT NULL,
	`versionNumber` int NOT NULL,
	`logoUrl` text,
	`logoKey` text,
	`corPrimaria` varchar(7) NOT NULL,
	`corSecundaria` varchar(7) NOT NULL,
	`incluirPestel` tinyint NOT NULL DEFAULT 1,
	`incluirSwot` tinyint NOT NULL DEFAULT 1,
	`incluirOkr` tinyint NOT NULL DEFAULT 1,
	`incluirBsc` tinyint NOT NULL DEFAULT 1,
	`incluirGraficos` tinyint NOT NULL DEFAULT 1,
	`incluirRecomendacoes` tinyint NOT NULL DEFAULT 1,
	`rodapePersonalizado` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`createdBy` varchar(255),
	CONSTRAINT `template_versions_id` PRIMARY KEY(`id`)
);
