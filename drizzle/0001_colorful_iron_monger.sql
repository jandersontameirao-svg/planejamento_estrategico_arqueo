CREATE TABLE `pestel_plano_acao` (
	`id` int AUTO_INCREMENT NOT NULL,
	`empresaId` int NOT NULL,
	`fatorId` int NOT NULL,
	`categoria` enum('politico','economico','social','tecnologico','ambiental','legal') NOT NULL,
	`estrategia` enum('prevencao','protecao','mitigacao') NOT NULL,
	`descricaoEstrategia` text NOT NULL,
	`urgencia` int NOT NULL,
	`importancia` int NOT NULL,
	`responsavel` varchar(255),
	`dataInicio` date,
	`dataFim` date,
	`status` enum('planejado','em_progresso','concluido','cancelado') NOT NULL DEFAULT 'planejado',
	`percentualConclusao` int NOT NULL DEFAULT 0,
	`observacoes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `pestel_plano_acao_id` PRIMARY KEY(`id`)
);
