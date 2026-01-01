CREATE TABLE `acoes` (
	`id` int AUTO_INCREMENT NOT NULL,
	`empresaId` int NOT NULL,
	`projetoId` int,
	`kpiId` int,
	`descricao` text NOT NULL,
	`responsavelId` int,
	`prazo` date,
	`status` enum('a_iniciar','em_andamento','concluida','atrasada','cancelada') NOT NULL DEFAULT 'a_iniciar',
	`custo` decimal(15,2),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `acoes_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `auditoria` (
	`id` int AUTO_INCREMENT NOT NULL,
	`usuarioId` int NOT NULL,
	`tabela` varchar(100) NOT NULL,
	`registroId` int NOT NULL,
	`acao` enum('criar','atualizar','deletar') NOT NULL,
	`valorAnterior` text,
	`valorNovo` text,
	`timestamp` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `auditoria_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `canais` (
	`id` int AUTO_INCREMENT NOT NULL,
	`empresaId` int NOT NULL,
	`nome` varchar(255) NOT NULL,
	`tipo` varchar(100),
	`ativo` boolean NOT NULL DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `canais_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `ciclos` (
	`id` int AUTO_INCREMENT NOT NULL,
	`empresaId` int,
	`tipo` enum('mensal','anual') NOT NULL,
	`ano` int NOT NULL,
	`mes` int,
	`fechado` boolean NOT NULL DEFAULT false,
	`dataFechamento` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `ciclos_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `desdobramento_metas` (
	`id` int AUTO_INCREMENT NOT NULL,
	`metaId` int NOT NULL,
	`produtoId` int,
	`canalId` int,
	`percentual` decimal(5,2),
	`valorMeta` decimal(15,2) NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `desdobramento_metas_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `empresas` (
	`id` int AUTO_INCREMENT NOT NULL,
	`nome` varchar(255) NOT NULL,
	`tipoAtuacao` enum('servicos','produtos','servicos_produtos') NOT NULL,
	`status` enum('ativa','inativa') NOT NULL DEFAULT 'ativa',
	`observacoes` text,
	`logoUrl` text,
	`logoKey` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `empresas_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `historico_faturamento` (
	`id` int AUTO_INCREMENT NOT NULL,
	`empresaId` int NOT NULL,
	`ano` int NOT NULL,
	`mes` int NOT NULL,
	`faturamento` decimal(15,2) NOT NULL,
	`numeroClientes` int,
	`ticketMedio` decimal(15,2),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `historico_faturamento_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `identidade_organizacional` (
	`id` int AUTO_INCREMENT NOT NULL,
	`empresaId` int NOT NULL,
	`missao` text,
	`visao` text,
	`valores` text,
	`politica` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `identidade_organizacional_id` PRIMARY KEY(`id`),
	CONSTRAINT `identidade_organizacional_empresaId_unique` UNIQUE(`empresaId`)
);
--> statement-breakpoint
CREATE TABLE `iniciativas` (
	`id` int AUTO_INCREMENT NOT NULL,
	`empresaId` int NOT NULL,
	`projetoId` int,
	`objetivoId` int,
	`nome` varchar(255) NOT NULL,
	`descricao` text,
	`area` varchar(100),
	`responsavelId` int,
	`dataInicio` date,
	`dataFim` date,
	`status` enum('planejado','em_andamento','concluido','cancelado') NOT NULL DEFAULT 'planejado',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `iniciativas_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `kpi_valores` (
	`id` int AUTO_INCREMENT NOT NULL,
	`kpiId` int NOT NULL,
	`ano` int NOT NULL,
	`mes` int NOT NULL,
	`meta` decimal(15,2),
	`realizado` decimal(15,2),
	`percentualAtingimento` decimal(5,2),
	`statusRag` enum('verde','amarelo','vermelho'),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `kpi_valores_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `kpis` (
	`id` int AUTO_INCREMENT NOT NULL,
	`empresaId` int NOT NULL,
	`objetivoId` int,
	`nome` varchar(255) NOT NULL,
	`descricao` text,
	`area` varchar(100),
	`responsavelId` int,
	`unidadeMedida` varchar(50),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `kpis_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `metas` (
	`id` int AUTO_INCREMENT NOT NULL,
	`objetivoId` int NOT NULL,
	`ano` int NOT NULL,
	`metaAnual` decimal(15,2) NOT NULL,
	`tipo` enum('faturamento','clientes','producao','outros') NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `metas_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `objetivos` (
	`id` int AUTO_INCREMENT NOT NULL,
	`empresaId` int NOT NULL,
	`ano` int NOT NULL,
	`nome` varchar(255) NOT NULL,
	`descricao` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `objetivos_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `produtos` (
	`id` int AUTO_INCREMENT NOT NULL,
	`empresaId` int NOT NULL,
	`nome` varchar(255) NOT NULL,
	`tipo` enum('produto','servico') NOT NULL,
	`ativo` boolean NOT NULL DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `produtos_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `projetos` (
	`id` int AUTO_INCREMENT NOT NULL,
	`empresaId` int NOT NULL,
	`objetivoId` int,
	`nome` varchar(255) NOT NULL,
	`descricao` text,
	`area` varchar(100),
	`responsavelId` int,
	`dataInicio` date,
	`dataFim` date,
	`status` enum('planejado','em_andamento','concluido','cancelado') NOT NULL DEFAULT 'planejado',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `projetos_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `usuario_empresas` (
	`id` int AUTO_INCREMENT NOT NULL,
	`usuarioId` int NOT NULL,
	`empresaId` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `usuario_empresas_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `users` MODIFY COLUMN `role` enum('user','admin','gestor') NOT NULL DEFAULT 'user';