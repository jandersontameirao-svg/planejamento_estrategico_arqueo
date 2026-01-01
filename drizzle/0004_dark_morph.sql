ALTER TABLE `kpis` ADD `perspectivaBSC` enum('financeira','clientes','processos','aprendizado');--> statement-breakpoint
ALTER TABLE `objetivos` ADD `perspectivaBSC` enum('financeira','clientes','processos','aprendizado');--> statement-breakpoint
ALTER TABLE `objetivos_grupo` ADD `perspectivaBSC` enum('financeira','clientes','processos','aprendizado');