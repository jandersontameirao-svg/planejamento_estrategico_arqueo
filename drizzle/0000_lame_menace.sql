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
CREATE TABLE `acoes_grupo` (
	`id` int AUTO_INCREMENT NOT NULL,
	`empresaId` int NOT NULL,
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
--> statement-breakpoint
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
--> statement-breakpoint
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
--> statement-breakpoint
CREATE TABLE `areas_negocio` (
	`id` int AUTO_INCREMENT NOT NULL,
	`nome` varchar(255) NOT NULL,
	`descricao` text,
	`pais` varchar(100),
	`status` enum('ativa','inativa') NOT NULL DEFAULT 'ativa',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `areas_negocio_id` PRIMARY KEY(`id`)
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
CREATE TABLE `bsc_indicadores` (
	`id` int AUTO_INCREMENT NOT NULL,
	`empresaId` int NOT NULL,
	`perspectiva` enum('financeira','cliente','processos','aprendizado') NOT NULL,
	`nome` varchar(255) NOT NULL,
	`meta` decimal(15,2) NOT NULL,
	`valorAtual` decimal(15,2) DEFAULT '0',
	`unidade` varchar(50),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `bsc_indicadores_id` PRIMARY KEY(`id`)
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
--> statement-breakpoint
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
	`areaId` int,
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
CREATE TABLE `identidade_grupo` (
	`id` int AUTO_INCREMENT NOT NULL,
	`missao` text,
	`visao` text,
	`valores` text,
	`politica` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `identidade_grupo_id` PRIMARY KEY(`id`)
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
	`empresaId` int,
	`objetivoId` int,
	`nome` varchar(255) NOT NULL,
	`descricao` text,
	`area` varchar(100),
	`responsavelId` int,
	`responsavel` varchar(255),
	`unidadeMedida` varchar(50),
	`tipo` enum('financeiro','operacional','cliente','processo') DEFAULT 'financeiro',
	`frequencia` enum('mensal','trimestral','anual') DEFAULT 'mensal',
	`perspectivaBSC` enum('financeira','clientes','processos','aprendizado'),
	`ativo` boolean DEFAULT true,
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
CREATE TABLE `objetivo_grupo_kpis` (
	`id` int AUTO_INCREMENT NOT NULL,
	`objetivoId` int NOT NULL,
	`kpiId` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `objetivo_grupo_kpis_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `objetivos` (
	`id` int AUTO_INCREMENT NOT NULL,
	`empresaId` int NOT NULL,
	`ano` int NOT NULL,
	`nome` varchar(255) NOT NULL,
	`descricao` text,
	`perspectivaBSC` enum('financeira','clientes','processos','aprendizado'),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `objetivos_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `objetivos_grupo` (
	`id` int AUTO_INCREMENT NOT NULL,
	`empresaId` int,
	`titulo` varchar(255) NOT NULL,
	`descricao` text,
	`perspectivaBSC` enum('financeira','clientes','processos','aprendizado'),
	`prazo` date,
	`status` enum('planejado','em_andamento','concluido','cancelado') DEFAULT 'planejado',
	`impacto` enum('baixo','medio','alto') DEFAULT 'medio',
	`probabilidade` enum('baixa','media','alta') DEFAULT 'media',
	`metodologia` varchar(100) DEFAULT 'matriz_risco_padrao',
	`observacoes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `objetivos_grupo_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `pestel_fatores` (
	`id` int AUTO_INCREMENT NOT NULL,
	`empresaId` int NOT NULL,
	`categoria` enum('politico','economico','social','tecnologico','ambiental','legal') NOT NULL,
	`descricao` text NOT NULL,
	`impacto` int NOT NULL,
	`probabilidade` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `pestel_fatores_id` PRIMARY KEY(`id`)
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
CREATE TABLE `projeto_grupo_kpis` (
	`id` int AUTO_INCREMENT NOT NULL,
	`projetoId` int NOT NULL,
	`kpiId` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `projeto_grupo_kpis_id` PRIMARY KEY(`id`)
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
CREATE TABLE `projetos_grupo` (
	`id` int AUTO_INCREMENT NOT NULL,
	`empresaId` int,
	`nome` varchar(255) NOT NULL,
	`descricao` text,
	`objetivoId` int,
	`area` varchar(100),
	`responsavel` varchar(255),
	`dataInicio` date,
	`dataFim` date,
	`status` enum('planejado','em_andamento','concluido','cancelado') NOT NULL DEFAULT 'planejado',
	`impacto` enum('baixo','medio','alto') DEFAULT 'medio',
	`probabilidade` enum('baixa','media','alta') DEFAULT 'media',
	`metodologia` varchar(100) DEFAULT 'matriz_risco_padrao',
	`observacoes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `projetos_grupo_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `template_configs` (
	`id` int AUTO_INCREMENT NOT NULL,
	`empresaId` int NOT NULL,
	`logoUrl` text,
	`logoKey` text,
	`corPrimaria` varchar(7) NOT NULL DEFAULT '#8B1538',
	`corSecundaria` varchar(7) NOT NULL DEFAULT '#FF6B35',
	`incluirPestel` tinyint NOT NULL DEFAULT 1,
	`incluirSwot` tinyint NOT NULL DEFAULT 1,
	`incluirOkr` tinyint NOT NULL DEFAULT 1,
	`incluirBsc` tinyint NOT NULL DEFAULT 1,
	`incluirGraficos` tinyint NOT NULL DEFAULT 1,
	`incluirRecomendacoes` tinyint NOT NULL DEFAULT 1,
	`rodapePersonalizado` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `template_configs_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `template_versions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`empresaId` int NOT NULL,
	`versionNumber` int NOT NULL,
	`logoUrl` text,
	`logoKey` text,
	`corPrimaria` varchar(7) NOT NULL,
	`corSecundaria` varchar(7) NOT NULL,
	`incluirPestel` tinyint NOT NULL DEFAULT 1,
	`incluirSwot` tinyint NOT NULL DEFAULT 1,
	`incluirOkr` tinyint NOT NULL DEFAULT 1,
	`incluirBsc` tinyint NOT NULL DEFAULT 1,
	`incluirGraficos` tinyint NOT NULL DEFAULT 1,
	`incluirRecomendacoes` tinyint NOT NULL DEFAULT 1,
	`rodapePersonalizado` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`createdBy` varchar(255),
	CONSTRAINT `template_versions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `users` (
	`id` int AUTO_INCREMENT NOT NULL,
	`openId` varchar(64) NOT NULL,
	`name` text,
	`email` varchar(320),
	`loginMethod` varchar(64),
	`role` enum('user','admin','gestor') NOT NULL DEFAULT 'user',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	`lastSignedIn` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `users_id` PRIMARY KEY(`id`),
	CONSTRAINT `users_openId_unique` UNIQUE(`openId`)
);
--> statement-breakpoint
CREATE TABLE `usuario_empresas` (
	`id` int AUTO_INCREMENT NOT NULL,
	`usuarioId` int NOT NULL,
	`empresaId` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `usuario_empresas_id` PRIMARY KEY(`id`)
);
