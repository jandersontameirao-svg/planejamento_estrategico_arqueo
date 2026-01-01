ALTER TABLE `kpis` ADD `responsavel` varchar(255);--> statement-breakpoint
ALTER TABLE `kpis` ADD `tipo` enum('financeiro','operacional','cliente','processo') DEFAULT 'financeiro';--> statement-breakpoint
ALTER TABLE `kpis` ADD `frequencia` enum('mensal','trimestral','anual') DEFAULT 'mensal';--> statement-breakpoint
ALTER TABLE `kpis` ADD `ativo` boolean DEFAULT true;