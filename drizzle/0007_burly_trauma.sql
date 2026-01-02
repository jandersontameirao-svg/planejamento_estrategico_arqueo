ALTER TABLE `objetivos_grupo` ADD `impacto` enum('baixo','medio','alto') DEFAULT 'medio';--> statement-breakpoint
ALTER TABLE `objetivos_grupo` ADD `probabilidade` enum('baixa','media','alta') DEFAULT 'media';--> statement-breakpoint
ALTER TABLE `projetos_grupo` ADD `impacto` enum('baixo','medio','alto') DEFAULT 'medio';--> statement-breakpoint
ALTER TABLE `projetos_grupo` ADD `probabilidade` enum('baixa','media','alta') DEFAULT 'media';