CREATE TABLE `analise_okr` (
	`id` int AUTO_INCREMENT NOT NULL,
	`empresaId` int NOT NULL,
	`objetivo` varchar(255) NOT NULL,
	`descricao` text,
	`resultado_chave_1` text,
	`meta_resultado_1` varchar(255),
	`status_resultado_1` enum('nao_iniciado','em_progresso','concluido','cancelado') DEFAULT 'nao_iniciado',
	`resultado_chave_2` text,
	`meta_resultado_2` varchar(255),
	`status_resultado_2` enum('nao_iniciado','em_progresso','concluido','cancelado') DEFAULT 'nao_iniciado',
	`resultado_chave_3` text,
	`meta_resultado_3` varchar(255),
	`status_resultado_3` enum('nao_iniciado','em_progresso','concluido','cancelado') DEFAULT 'nao_iniciado',
	`periodo` varchar(100),
	`progresso` int DEFAULT 0,
	`observacoes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `analise_okr_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `analise_pestel` (
	`id` int AUTO_INCREMENT NOT NULL,
	`empresaId` int NOT NULL,
	`politico` text,
	`economico` text,
	`social` text,
	`tecnologico` text,
	`ambiental` text,
	`legal` text,
	`observacoes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `analise_pestel_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `analise_rbv_vrio` (
	`id` int AUTO_INCREMENT NOT NULL,
	`empresaId` int NOT NULL,
	`recurso` varchar(255) NOT NULL,
	`descricao` text,
	`valioso` boolean DEFAULT false,
	`raro` boolean DEFAULT false,
	`inimitavel` boolean DEFAULT false,
	`organizado` boolean DEFAULT false,
	`vantagem` enum('desvantagem','paridade','vantagem_temporaria','vantagem_sustentavel') DEFAULT 'paridade',
	`observacoes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `analise_rbv_vrio_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `analise_stakeholders` (
	`id` int AUTO_INCREMENT NOT NULL,
	`empresaId` int NOT NULL,
	`nome` varchar(255) NOT NULL,
	`descricao` text,
	`poder` enum('baixo','medio','alto') DEFAULT 'medio',
	`interesse` enum('baixo','medio','alto') DEFAULT 'medio',
	`estrategia` text,
	`observacoes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `analise_stakeholders_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `analise_swot_tows` (
	`id` int AUTO_INCREMENT NOT NULL,
	`empresaId` int NOT NULL,
	`tipo` enum('forca','fraqueza','oportunidade','ameaca') NOT NULL,
	`descricao` text NOT NULL,
	`impacto` enum('baixo','medio','alto') DEFAULT 'medio',
	`estrategia` text,
	`observacoes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `analise_swot_tows_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `cinco_forcas_porter` (
	`id` int AUTO_INCREMENT NOT NULL,
	`empresaId` int NOT NULL,
	`ameaca_novo_entrantes` text,
	`intensidade_novo_entrantes` enum('baixa','media','alta') DEFAULT 'media',
	`poder_fornecedores` text,
	`intensidade_fornecedores` enum('baixa','media','alta') DEFAULT 'media',
	`poder_clientes` text,
	`intensidade_clientes` enum('baixa','media','alta') DEFAULT 'media',
	`ameaca_substitutos` text,
	`intensidade_substitutos` enum('baixa','media','alta') DEFAULT 'media',
	`rivalidade_competidores` text,
	`intensidade_rivalidade` enum('baixa','media','alta') DEFAULT 'media',
	`observacoes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `cinco_forcas_porter_id` PRIMARY KEY(`id`)
);
