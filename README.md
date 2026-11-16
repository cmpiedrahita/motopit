# MotoPit

Mantenimiento de motos a domicilio por suscripción para domiciliarios y mensajeros. El mecánico va a donde está la moto, con un plan mensual fijo y recordatorios por kilometraje.

Proyecto final de Ingeniería de Software (Scrum · Lean · Océano azul · DevOps).

## Equipo

| Integrante | GitHub | Rol |
| --- | --- | --- |
| Carlos Piedrahita | [@cmpiedrahita](https://github.com/cmpiedrahita) | Scrum Master · Developer |
| Miguel Vanegas | [@miguelvanegas-c](https://github.com/miguelvanegas-c) | Product Owner · Developer |
| Yojhan Toro | [@Yojhan-Toro](https://github.com/Yojhan-Toro) | Developer · Calidad |

## Stack

- **Next.js 15 (TypeScript)**: frontend y API en un solo proyecto.
- **PostgreSQL + Drizzle ORM**: el modelo está en `src/db/schema.ts` y las migraciones versionadas en `drizzle/`.
- **Vitest**: pruebas automatizadas (`src/**/*.test.ts`).
- **GitHub Actions**: CI con lint, tipos, pruebas y build en cada push o PR.
- **Vercel + Neon**: entorno de demostración con despliegue automático desde `main`.

## Ejecutar en local

Requisitos: Node 20 o superior y Docker (o cualquier PostgreSQL).

```bash
git clone https://github.com/cmpiedrahita/motopit.git
cd motopit
npm install
cp .env.example .env          # ajusta DATABASE_URL si no usas Docker
docker compose up -d          # levanta PostgreSQL local
npm run db:migrate            # crea las tablas
npm run db:seed               # carga planes y mecánicos de prueba
npm run dev                   # http://localhost:3000
```

| Script | Qué hace |
| --- | --- |
| `npm run dev` | Servidor de desarrollo |
| `npm test` | Pruebas automatizadas |
| `npm run lint` / `npm run typecheck` | Calidad de código |
| `npm run build` | Build de producción |
| `npm run db:generate` | Crea una migración después de cambiar `schema.ts` |
| `npm run db:migrate` | Aplica las migraciones pendientes |
| `npm run db:seed` | Carga datos de demo |

## Flujo de trabajo

1. Cada historia es un issue (`HU-XX`) en el tablero de GitHub Projects, con responsable.
2. Se crea una rama desde `main`: `feature/HU-03-agendar-visita`.
3. Los commits empiezan con el ID de la historia: `HU-03: valida fecha pasada al agendar`.
4. Se abre un PR con la plantilla y `Cierra #<issue>`. El CI tiene que pasar.
5. **Otro integrante revisa y aprueba.** Nadie integra su propio PR.
6. Merge a `main` → Vercel despliega solo → se revisa `/api/health`.

`main` está protegida: requiere PR, 1 aprobación y el check `CI / validar` en verde.

## Despliegue (entorno de demo)

1. Crear una base de datos gratis en [Neon](https://neon.tech) y copiar su connection string.
2. En [Vercel](https://vercel.com), importar el repo y agregar la variable `DATABASE_URL` en *Settings → Environment Variables*.
3. Vercel ejecuta `npm run vercel-build`, que aplica las migraciones y construye la app en cada merge a `main`.
4. Cargar datos de demo una vez: `DATABASE_URL=<url de Neon> npm run db:seed`.

Los secretos van solo en Vercel (y en `.env` local, que está en `.gitignore`). Nunca se suben al repo.

## Operación básica

- **Salud:** `GET /api/health` responde `200 {"status":"ok","db":"up","version":"<commit>"}`, o `503` si la base de datos no responde.
- **Logs:** la app escribe logs en JSON (`src/lib/logger.ts`). Se ven en Vercel → *Logs*.
- **Volver a la última versión que funcionaba:**
  - Rápido: Vercel → *Deployments* → el último deploy sano → *Promote to Production*.
  - En el código: `git revert <commit del merge>` en un PR nuevo.

## Componentes reutilizados y uso de IA

- Proyecto base generado con `create-next-app` (licencia MIT). Librerías: Next.js, React, Drizzle ORM, postgres.js, Zod y Vitest (todas MIT o Apache-2.0).
- Se usó un asistente de IA (Claude) para generar el esqueleto inicial (estructura, CI, health check y plantillas) y como apoyo en la redacción. Cada integrante revisa y entiende el código que integra.
