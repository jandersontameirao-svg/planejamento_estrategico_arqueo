CREATE TABLE `empresa_metodologias` (
	`id` int AUTO_INCREMENT NOT NULL,
	`empresa_id` int NOT NULL,
	`metodologia` varchar(50) NOT NULL,
	`ativa` boolean DEFAULT true,
	`created_at` bigint NOT NULL,
	`updated_at` bigint NOT NULL,
	CONSTRAINT `empresa_metodologias_id` PRIMARY KEY(`id`)
);
