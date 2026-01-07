CREATE TABLE `comentario_anexos` (
	`id` int AUTO_INCREMENT NOT NULL,
	`comentarioId` int NOT NULL,
	`nomeArquivo` varchar(255) NOT NULL,
	`tipoArquivo` varchar(100) NOT NULL,
	`tamanhoBytes` int NOT NULL,
	`urlS3` text NOT NULL,
	`s3Key` text NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `comentario_anexos_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `comentario_mencoes` (
	`id` int AUTO_INCREMENT NOT NULL,
	`comentarioId` int NOT NULL,
	`usuarioMencionadoId` varchar(64) NOT NULL,
	`usuarioMencionadoNome` varchar(255) NOT NULL,
	`notificado` tinyint NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `comentario_mencoes_id` PRIMARY KEY(`id`)
);
