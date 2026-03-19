ALTER TABLE `contratos_clientes` ADD `porte` varchar(50);--> statement-breakpoint
ALTER TABLE `contratos_clientes` ADD `natureza_juridica` varchar(100);--> statement-breakpoint
ALTER TABLE `contratos_clientes` ADD `cnae_principal` varchar(10);--> statement-breakpoint
ALTER TABLE `contratos_clientes` ADD `cnae_descricao` varchar(255);--> statement-breakpoint
ALTER TABLE `contratos_clientes` ADD `situacao_cadastral` varchar(20);--> statement-breakpoint
ALTER TABLE `contratos_clientes` ADD `data_abertura` varchar(10);--> statement-breakpoint
ALTER TABLE `contratos_clientes` ADD `capital_social` varchar(30);--> statement-breakpoint
ALTER TABLE `contratos_clientes` ADD `socios` text;--> statement-breakpoint
ALTER TABLE `contratos_clientes` ADD `dados_receita` text;