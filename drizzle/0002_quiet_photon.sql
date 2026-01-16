CREATE TABLE `empresa_area_vinculo` (
	`id` int AUTO_INCREMENT NOT NULL,
	`empresaId` int NOT NULL,
	`areaId` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `empresa_area_vinculo_id` PRIMARY KEY(`id`)
);
