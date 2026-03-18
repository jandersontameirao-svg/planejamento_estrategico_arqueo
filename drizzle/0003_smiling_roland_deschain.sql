CREATE TABLE `orcamento_categorias` (
	`id` int AUTO_INCREMENT NOT NULL,
	`nome` varchar(255) NOT NULL,
	`descricao` text,
	`tipo` enum('receita','custo','despesa','investimento','outro') NOT NULL DEFAULT 'outro',
	`ativo` tinyint NOT NULL DEFAULT 1,
	`ordem` int NOT NULL DEFAULT 0,
	`escopoTipo` enum('global','empresa') NOT NULL DEFAULT 'global',
	`observacao` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `orcamento_categorias_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `orcamento_configuracoes` (
	`id` int AUTO_INCREMENT NOT NULL,
	`moedaConsolidacaoGlobal` varchar(10) NOT NULL DEFAULT 'BRL',
	`permitirEdicaoPosCongelamento` tinyint NOT NULL DEFAULT 0,
	`toleranciaAlertaPercentual` decimal(5,2) NOT NULL DEFAULT '10.00',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `orcamento_configuracoes_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `orcamento_executado_linhas` (
	`id` int AUTO_INCREMENT NOT NULL,
	`importacaoId` int NOT NULL,
	`empresaId` int NOT NULL,
	`categoriaId` int,
	`subcategoriaId` int,
	`dataLancamento` date,
	`competencia` varchar(7),
	`descricao` text,
	`valorOriginal` decimal(18,2) NOT NULL DEFAULT '0.00',
	`moedaOriginal` varchar(10) NOT NULL DEFAULT 'BRL',
	`taxaCambio` decimal(18,6) NOT NULL DEFAULT '1.000000',
	`dataTaxaCambio` date,
	`valorConvertidoBase` decimal(18,2) NOT NULL DEFAULT '0.00',
	`referenciaExterna` varchar(500),
	`documentoReferencia` varchar(500),
	`hashLinha` varchar(64),
	`ativo` tinyint NOT NULL DEFAULT 1,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `orcamento_executado_linhas_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `orcamento_importacoes` (
	`id` int AUTO_INCREMENT NOT NULL,
	`empresaId` int NOT NULL,
	`ano` int NOT NULL,
	`mesReferencia` int,
	`arquivoNome` varchar(500),
	`arquivoKey` text,
	`status` enum('processando','concluido','erro','revertido') NOT NULL DEFAULT 'processando',
	`totalLinhas` int NOT NULL DEFAULT 0,
	`totalImportado` int NOT NULL DEFAULT 0,
	`totalErros` int NOT NULL DEFAULT 0,
	`moedaLote` varchar(10) NOT NULL DEFAULT 'BRL',
	`taxaCambioPadrao` decimal(18,6) NOT NULL DEFAULT '1.000000',
	`importadoPor` int,
	`observacoes` text,
	`errosDetalhes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `orcamento_importacoes_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `orcamento_planejado_linhas` (
	`id` int AUTO_INCREMENT NOT NULL,
	`versaoId` int NOT NULL,
	`categoriaId` int NOT NULL,
	`subcategoriaId` int,
	`descricao` text,
	`janeiro` decimal(18,2) NOT NULL DEFAULT '0.00',
	`fevereiro` decimal(18,2) NOT NULL DEFAULT '0.00',
	`marco` decimal(18,2) NOT NULL DEFAULT '0.00',
	`abril` decimal(18,2) NOT NULL DEFAULT '0.00',
	`maio` decimal(18,2) NOT NULL DEFAULT '0.00',
	`junho` decimal(18,2) NOT NULL DEFAULT '0.00',
	`julho` decimal(18,2) NOT NULL DEFAULT '0.00',
	`agosto` decimal(18,2) NOT NULL DEFAULT '0.00',
	`setembro` decimal(18,2) NOT NULL DEFAULT '0.00',
	`outubro` decimal(18,2) NOT NULL DEFAULT '0.00',
	`novembro` decimal(18,2) NOT NULL DEFAULT '0.00',
	`dezembro` decimal(18,2) NOT NULL DEFAULT '0.00',
	`totalAnual` decimal(18,2) NOT NULL DEFAULT '0.00',
	`observacoes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `orcamento_planejado_linhas_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `orcamento_revisoes` (
	`id` int AUTO_INCREMENT NOT NULL,
	`versaoId` int NOT NULL,
	`acao` enum('criacao','edicao','envio_revisao','aprovacao','rejeicao','congelamento','duplicacao') NOT NULL,
	`motivo` text,
	`usuarioId` int,
	`payloadAnterior` text,
	`payloadNovo` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `orcamento_revisoes_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `orcamento_subcategorias` (
	`id` int AUTO_INCREMENT NOT NULL,
	`categoriaId` int NOT NULL,
	`nome` varchar(255) NOT NULL,
	`descricao` text,
	`ativo` tinyint NOT NULL DEFAULT 1,
	`ordem` int NOT NULL DEFAULT 0,
	`observacao` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `orcamento_subcategorias_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `orcamento_versoes` (
	`id` int AUTO_INCREMENT NOT NULL,
	`empresaId` int NOT NULL,
	`ano` int NOT NULL,
	`nomeVersao` varchar(255) NOT NULL,
	`numeroVersao` int NOT NULL DEFAULT 1,
	`status` enum('rascunho','em_revisao','aprovado','congelado') NOT NULL DEFAULT 'rascunho',
	`moedaBase` varchar(10) NOT NULL DEFAULT 'BRL',
	`observacoes` text,
	`criadoPor` int,
	`aprovadoPor` int,
	`dataAprovacao` timestamp,
	`versaoOrigemId` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `orcamento_versoes_id` PRIMARY KEY(`id`)
);
