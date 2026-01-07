CREATE TABLE `analise_comentarios` (
	`id` int AUTO_INCREMENT NOT NULL,
	`empresaId` int NOT NULL,
	`tipoAnalise` enum('pestel','swot','okr','bsc') NOT NULL,
	`autorId` varchar(64) NOT NULL,
	`autorNome` varchar(255) NOT NULL,
	`conteudo` text NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `analise_comentarios_id` PRIMARY KEY(`id`)
);
