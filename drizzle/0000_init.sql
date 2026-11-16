CREATE TYPE "public"."estado_visita" AS ENUM('PENDIENTE', 'ASIGNADA', 'COMPLETADA', 'CANCELADA');--> statement-breakpoint
CREATE TYPE "public"."franja" AS ENUM('MANANA', 'TARDE', 'NOCHE');--> statement-breakpoint
CREATE TYPE "public"."servicio" AS ENUM('CAMBIO_ACEITE', 'FRENOS', 'CADENA', 'REVISION_GENERAL');--> statement-breakpoint
CREATE TABLE "domiciliarios" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"nombre" text NOT NULL,
	"celular" text NOT NULL,
	"creado_en" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "domiciliarios_celular_unique" UNIQUE("celular")
);
--> statement-breakpoint
CREATE TABLE "mecanicos" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"nombre" text NOT NULL,
	"celular" text NOT NULL,
	"anios_experiencia" integer NOT NULL,
	"verificado" boolean DEFAULT false NOT NULL,
	CONSTRAINT "mecanicos_celular_unique" UNIQUE("celular")
);
--> statement-breakpoint
CREATE TABLE "motos" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"placa" text NOT NULL,
	"marca" text NOT NULL,
	"km_actual" integer NOT NULL,
	"km_ultimo_aceite" integer DEFAULT 0 NOT NULL,
	"domiciliario_id" uuid NOT NULL,
	CONSTRAINT "motos_placa_unique" UNIQUE("placa"),
	CONSTRAINT "motos_domiciliario_id_unique" UNIQUE("domiciliario_id")
);
--> statement-breakpoint
CREATE TABLE "planes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"codigo" text NOT NULL,
	"nombre" text NOT NULL,
	"precio_mensual" integer NOT NULL,
	"incluye" text[] NOT NULL,
	"no_incluye" text[] NOT NULL,
	CONSTRAINT "planes_codigo_unique" UNIQUE("codigo")
);
--> statement-breakpoint
CREATE TABLE "suscripciones" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"activa" boolean DEFAULT true NOT NULL,
	"desde" timestamp DEFAULT now() NOT NULL,
	"domiciliario_id" uuid NOT NULL,
	"plan_id" uuid NOT NULL
);
--> statement-breakpoint
CREATE TABLE "visitas" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"direccion" text NOT NULL,
	"fecha" timestamp NOT NULL,
	"franja" "franja" NOT NULL,
	"servicio" "servicio" NOT NULL,
	"estado" "estado_visita" DEFAULT 'PENDIENTE' NOT NULL,
	"trabajo_realizado" text,
	"km_cierre" integer,
	"calificacion" integer,
	"creada_en" timestamp DEFAULT now() NOT NULL,
	"moto_id" uuid NOT NULL,
	"mecanico_id" uuid
);
--> statement-breakpoint
ALTER TABLE "motos" ADD CONSTRAINT "motos_domiciliario_id_domiciliarios_id_fk" FOREIGN KEY ("domiciliario_id") REFERENCES "public"."domiciliarios"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "suscripciones" ADD CONSTRAINT "suscripciones_domiciliario_id_domiciliarios_id_fk" FOREIGN KEY ("domiciliario_id") REFERENCES "public"."domiciliarios"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "suscripciones" ADD CONSTRAINT "suscripciones_plan_id_planes_id_fk" FOREIGN KEY ("plan_id") REFERENCES "public"."planes"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "visitas" ADD CONSTRAINT "visitas_moto_id_motos_id_fk" FOREIGN KEY ("moto_id") REFERENCES "public"."motos"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "visitas" ADD CONSTRAINT "visitas_mecanico_id_mecanicos_id_fk" FOREIGN KEY ("mecanico_id") REFERENCES "public"."mecanicos"("id") ON DELETE no action ON UPDATE no action;