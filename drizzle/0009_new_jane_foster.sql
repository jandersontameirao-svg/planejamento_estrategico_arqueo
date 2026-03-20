CREATE TABLE `clients` (
	`id` int AUTO_INCREMENT NOT NULL,
	`code` varchar(20) NOT NULL,
	`name` varchar(255) NOT NULL,
	`fantasy_name` varchar(255),
	`tax_id` varchar(18) NOT NULL,
	`logradouro` varchar(255),
	`complemento` varchar(255),
	`bairro` varchar(100),
	`cep` varchar(10),
	`municipio` varchar(100),
	`uf` varchar(2),
	`telefone` varchar(20),
	`email` varchar(255),
	`contact` varchar(255),
	`atividade_economica` text,
	`natureza_juridica` varchar(255),
	`data_abertura` date,
	`situacao_cadastral` varchar(50),
	`logo_url` varchar(500),
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `clients_id` PRIMARY KEY(`id`),
	CONSTRAINT `clients_code_unique` UNIQUE(`code`),
	CONSTRAINT `clients_tax_id_unique` UNIQUE(`tax_id`)
);
--> statement-breakpoint
CREATE TABLE `company_clients` (
	`id` int AUTO_INCREMENT NOT NULL,
	`company_id` int NOT NULL,
	`client_id` int NOT NULL,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `company_clients_id` PRIMARY KEY(`id`)
);
