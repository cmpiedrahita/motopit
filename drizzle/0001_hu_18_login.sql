ALTER TABLE "domiciliarios" ADD COLUMN "pin_hash" text;--> statement-breakpoint
ALTER TABLE "domiciliarios" ADD COLUMN "intentos_fallidos" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "domiciliarios" ADD COLUMN "bloqueado_hasta" timestamp;--> statement-breakpoint
ALTER TABLE "mecanicos" ADD COLUMN "pin_hash" text;--> statement-breakpoint
ALTER TABLE "mecanicos" ADD COLUMN "intentos_fallidos" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "mecanicos" ADD COLUMN "bloqueado_hasta" timestamp;