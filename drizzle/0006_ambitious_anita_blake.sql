CREATE TABLE `acoes_grupo` (
	`id` int AUTO_INCREMENT NOT NULL,
	`descricao` text NOT NULL,
	`responsavel` varchar(255),
	`prazo` date,
	`custo` decimal(10,2),
	`status` enum('pendente','em_andamento','concluida','cancelada') DEFAULT 'pendente',
	`objetivoId` int,
	`projetoId` int,
	`observacoes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `acoes_grupo_id` PRIMARY KEY(`id`)
);
