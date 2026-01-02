ALTER TABLE `objetivos_grupo` ADD `metodologia` varchar(100) DEFAULT 'matriz_risco_padrao';--> statement-breakpoint
ALTER TABLE `objetivos_grupo` ADD `observacoes` text;--> statement-breakpoint
ALTER TABLE `projetos_grupo` ADD `metodologia` varchar(100) DEFAULT 'matriz_risco_padrao';--> statement-breakpoint
ALTER TABLE `projetos_grupo` ADD `observacoes` text;