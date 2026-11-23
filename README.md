# MotoPit

Mantenimiento de motos a domicilio por suscripción para domiciliarios y mensajeros. El mecánico va a donde está la moto, con un plan mensual fijo y recordatorios por kilometraje.

Proyecto final de Ingeniería de Software (Scrum · Lean · Océano azul · DevOps).

## Equipo

| Integrante | GitHub | Rol |
| --- | --- | --- |
| Carlos Piedrahita | [@cmpiedrahita](https://github.com/cmpiedrahita) | Scrum Master · Developer |
| Miguel Vanegas | [@miguelvanegas-c](https://github.com/miguelvanegas-c) | Product Owner · Developer |
| Yojhan Toro | [@Yojhan-Toro](https://github.com/Yojhan-Toro) | Developer · Calidad |

## Qué hace la app (MVP)

| Historia | Qué puede hacer el usuario | Pantalla |
| --- | --- | --- |
| HU-01 | El domiciliario se registra con su moto (placa colombiana ABC12D) | `/registro` |
| HU-02 | Ve los planes (qué incluye y qué NO) y elige uno; solo uno queda activo | `/planes` |
| HU-03 | Agenda una visita donde está la moto (dirección, fecha, franja, servicio) | `/agendar` |
| HU-04 | El mecánico ve las visitas pendientes y las acepta | `/mecanico` |
| HU-05 | El domiciliario ve el estado de sus visitas y quién lo atiende | `/visitas` |
| HU-06 | El mecánico cierra la visita con el trabajo hecho y el km | `/mecanico` → Mis visitas |
| HU-07 | Aviso de cambio de aceite cuando faltan 300 km o menos (cada 2.000 km) | `/` (inicio) |
| HU-08 | Actualiza el kilometraje en un paso | `/` (inicio) |
| HU-09 | Historial de mantenimientos de la moto | `/historial` |
| HU-13 | Perfil verificado del mecánico y calificación de 1 a 5 | `/visitas`, `/mecanico` |
| HU-18 | Ingreso con celular y PIN para domiciliarios y mecánicos; cada uno solo ve y toca lo suyo | `/ingresar`, `/mecanico` |

Las historias pendientes y las del Sprint 3 están en [docs/GUIA-BACKLOG.md](docs/GUIA-BACKLOG.md).

### Demo en 5 minutos (Sprint Review)

1. **Inicio** → *Registrar mi moto*. Prueba primero una placa mala (`ABC123`) y un km negativo para mostrar los errores. Crea tu PIN de 4 números.
2. Al registrarte te lleva a **Planes**: elige el Básico, luego cámbiate al Full (solo uno queda activo).
3. En el inicio, **Actualizar** km sumando unos 1.750 km → aparece el aviso de cambio de aceite (HU-07).
4. Toca *Agendar cambio de aceite* → llena la visita → queda **Pendiente**.
5. Arriba a la derecha, **Soy mecánico** → ingresa como *Jhon Fredy Ríos* (celular `3000000001`, PIN `1234`) → *Aceptar visita*. La sesión del domiciliario sigue abierta en el mismo navegador.
6. Vuelve como domiciliario a **Visitas**: ya se ve el perfil verificado del mecánico (HU-13).
7. Como mecánico, en *Mis visitas* → **Cerrar visita** con trabajo y km.
8. Como domiciliario: califica con estrellas en **Visitas** y revisa el **Historial**. El aviso de aceite desaparece.

## Stack

- **Next.js 15 (TypeScript)**: frontend y API en un solo proyecto.
- **PostgreSQL + Drizzle ORM**: el modelo está en `src/db/schema.ts` y las migraciones versionadas en `drizzle/`.
- **Zod**: validación de los datos de entrada.
- **Vitest**: pruebas automatizadas (`src/**/*.test.ts`), una por criterio de aceptación.
- **GitHub Actions**: CI con lint, tipos, pruebas y build en cada push o PR.
- **Vercel + Neon**: entorno de demostración con despliegue automático desde `main`.

## Estructura

```
src/
├── lib/            Reglas de negocio puras (sin base de datos) + sus pruebas
│   ├── registro.ts        HU-01  validarRegistro, placa colombiana
│   ├── planes.ts          HU-02  un solo plan activo
│   ├── agenda.ts          HU-03  plan activo, fecha no pasada
│   ├── visitas.ts         HU-04/06  ciclo de vida, aceptar, cerrar
│   ├── mantenimiento.ts   HU-07/08/09  recordatorio de aceite, km, historial
│   ├── calificaciones.ts  HU-13  promedio y calificación 1 a 5
│   ├── validacion.ts      Errores de Zod → { campo: mensaje }
│   ├── formato.ts         Pesos, km, fechas (hora de Colombia), etiquetas
│   ├── auth.ts            HU-18  PIN cifrado, token de sesión firmado, bloqueo por intentos
│   └── api.ts / cliente.ts / sesion-servidor.ts   Ayudas de servidor, de cliente y cookies de sesión
├── db/             Esquema, conexión, consultas compartidas y seed
├── app/api/        Rutas de la API (validan con src/lib y usan la base de datos)
├── app/<pantalla>/ Pantallas (mobile-first)
└── components/     Componentes visuales reutilizables
```

## API

Errores siempre con la forma `{ "errores": { "campo": "mensaje" } }`. Salvo `planes`, `mecanicos`, `health`, `sesion` y el registro, todas las rutas exigen sesión: responden **401** sin ella y **403** si el recurso es de otro usuario. El usuario siempre sale de la cookie de sesión, nunca del cuerpo de la petición.

| Método y ruta | Historia | Respuestas |
| --- | --- | --- |
| `POST /api/domiciliarios` | HU-01 | 201 · 400 · 409 placa/celular repetidos |
| `POST /api/sesion` | HU-18 | 200 · 400 · 401 celular o PIN incorrectos · 429 bloqueado |
| `GET /api/sesion` · `DELETE /api/sesion?rol=` | HU-18 | Quién tiene sesión · salir |
| `GET /api/domiciliarios/:id` | Inicio | 200 perfil + plan + recordatorio · 404 |
| `PATCH /api/motos/:id` | HU-08 | 200 · 400 km menor al actual · 404 |
| `GET /api/planes` | HU-02 | 200 |
| `POST /api/suscripciones` | HU-02 | 201 · 200 ya activo · 400 · 404 |
| `GET /api/visitas` | HU-05/09 | 200 |
| `POST /api/visitas` | HU-03 | 201 · 400 · 404 · 409 sin plan |
| `PATCH /api/visitas/:id/aceptar` | HU-04 | 200 · 404 · 409 ya aceptada |
| `PATCH /api/visitas/:id/cerrar` | HU-06 | 200 · 400 · 403 no es su visita · 409 |
| `POST /api/visitas/:id/calificacion` | HU-13 | 200 · 400 · 404 · 409 ya calificada |
| `GET /api/mecanicos` | HU-13 | 200 |
| `GET /api/mecanicos/:id/visitas` | HU-04/06 | 200 `{ pendientes, asignadas }` |
| `GET /api/health` | DevOps | 200 · 503 |

## Ejecutar en local

Requisitos: Node 20 o superior y Docker (o cualquier PostgreSQL, por ejemplo una base gratis en [Neon](https://neon.tech)).

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
| `npm run db:seed` | Carga datos de demo (se puede correr varias veces) |

## Flujo de trabajo

1. Cada historia es un issue (`HU-XX`) en GitHub y una tarjeta en el tablero Scrum (ver [docs/GUIA-BACKLOG.md](docs/GUIA-BACKLOG.md)).
2. Se crea una rama desde `main`: `feature/HU-03-agendar-visita`.
3. Los commits empiezan con el ID de la historia: `HU-03: valida fecha pasada al agendar`.
4. Se abre un PR con la plantilla y `Cierra #<issue>`. El CI tiene que pasar.
5. **Otro integrante revisa y aprueba.** Nadie integra su propio PR.
6. Merge a `main` → Vercel despliega solo → se revisa `/api/health`.

`main` está protegida: requiere PR, 1 aprobación y el check `CI / validar` en verde.

Para empezar a aportar código, ver [docs/GUIA-APORTES.md](docs/GUIA-APORTES.md).

## Despliegue (entorno de demo)

1. Crear una base de datos gratis en [Neon](https://neon.tech) y copiar su connection string.
2. En [Vercel](https://vercel.com), importar el repo y agregar las variables `DATABASE_URL` y `SESSION_SECRET` en *Settings → Environment Variables* (genera el secreto con `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`).
3. Vercel ejecuta `npm run vercel-build`, que aplica las migraciones y construye la app en cada merge a `main`.
4. Cargar datos de demo una vez: `DATABASE_URL=<url de Neon> npm run db:seed`.

Los secretos van solo en Vercel (y en `.env` local, que está en `.gitignore`). Nunca se suben al repo.

## Operación básica

- **Salud:** `GET /api/health` responde `200 {"status":"ok","db":"up","version":"<commit>"}`, o `503` si la base de datos no responde.
- **Logs:** la app escribe logs en JSON (`src/lib/logger.ts`): registro, plan elegido, visita agendada, aceptada, completada y calificada. Se ven en Vercel → *Logs*.
- **Volver a la última versión que funcionaba:**
  - Rápido: Vercel → *Deployments* → el último deploy sano → *Promote to Production*.
  - En el código: `git revert <commit del merge>` en un PR nuevo.

## Decisiones de diseño

- **Ingreso con celular y PIN (HU-18):** el PIN se guarda cifrado con `scrypt` y sal aleatoria. La sesión es un token firmado con HMAC en una cookie `httpOnly` (el JavaScript de la página no la puede leer) que dura 30 días. Hay una cookie por rol, así en la demo se puede tener abierto al domiciliario y al mecánico a la vez. Tras 5 PIN incorrectos la cuenta se bloquea 15 minutos, y el mensaje de error es el mismo si el celular no existe, para no revelar quién está registrado.
- **Mecánicos de demo:** `3000000001`, `3000000002` y `3000000003`, todos con PIN `1234` (lo pone el seed). Es solo para el entorno de demostración.
- **Recordatorio de aceite:** al registrarse, el km actual se toma como último cambio de aceite. Cerrar una visita de *Cambio de aceite* reinicia el contador.
- **Concurrencia:** aceptar, cerrar y calificar actualizan con condición (`WHERE estado = ...`), así dos mecánicos no pueden aceptar la misma visita al mismo tiempo.
- **Fechas:** se guardan a mediodía UTC y se muestran en hora de Colombia para que el día no cambie.

## Componentes reutilizados y uso de IA

- Proyecto base generado con `create-next-app` (licencia MIT). Librerías: Next.js, React, Drizzle ORM, postgres.js, Zod y Vitest (todas MIT o Apache-2.0). Fuente Plus Jakarta Sans (Google Fonts, OFL).
- Se usó un asistente de IA (Claude) para generar el esqueleto inicial (estructura, CI, health check y plantillas), para implementar las historias de los Sprints 1 y 2 y como apoyo en la redacción. Cada integrante revisa y entiende el código que integra.
