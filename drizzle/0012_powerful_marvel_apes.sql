CREATE TABLE `analise_vrio` (
	`id` int AUTO_INCREMENT NOT NULL,
	`empresaId` int NOT NULL,
	`recurso_nome` varchar(255) NOT NULL,
	`valor` int NOT NULL,
	`raridade` int NOT NULL,
	`imitabilidade` int NOT NULL,
	`organizacao` int NOT NULL,
	`media` decimal(3,2) NOT NULL,
	`classificacao` enum('vantagem_sustentavel','vantagem_temporaria','paridade_competitiva','desvantagem') NOT NULL,
	`recomendacoes` text,
	`observacoes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `analise_vrio_id` PRIMARY KEY(`id`)
);
