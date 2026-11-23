# MotoPit — guía para Claude Code

Proyecto final de Ingeniería de Software (Scrum · Lean · Océano azul · DevOps). App web de mantenimiento de motos a domicilio por suscripción para domiciliarios. Equipo: @cmpiedrahita (Scrum Master), @miguelvanegas-c (Product Owner), @Yojhan-Toro (Developer · pruebas).

Todo el código, los textos de la UI, los commits y los PR van en **español**.

## Stack y comandos

- Next.js 15 (App Router, TypeScript) — frontend y API en el mismo proyecto.
- PostgreSQL + Drizzle ORM. Modelo en `src/db/schema.ts`, conexión con `getDb()` de `src/db/index.ts`.
- Zod para validar, Vitest para pruebas.
- CI: `.github/workflows/ci.yml` (lint, typecheck, test, build). Deploy: Vercel desde `main`.

```bash
npm run dev          # http://localhost:3000
npm run lint
npm run typecheck
npm test
npm run build
npm run db:generate  # después de cambiar schema.ts → crea migración en /drizzle (se sube al repo)
npm run db:migrate
npm run db:seed
```

## Estructura y patrón por historia

Cada historia de usuario sigue el mismo patrón (ver HU-01 como referencia):

1. **Reglas de negocio** en `src/lib/<tema>.ts`: funciones puras, sin base de datos, validación con Zod.
2. **Pruebas** en `src/lib/<tema>.test.ts`: una prueba por criterio de aceptación, con nombres que digan el criterio (`"rechaza un kilometraje negativo"`).
3. **API** en `src/app/api/<recurso>/route.ts`: valida con la función de `src/lib`, usa `getDb()` y `schema`, responde JSON con `{ errores: { campo: mensaje } }` y el código HTTP correcto (400 inválido, 404 no existe, 409 conflicto, 201 creado). Registra eventos con `logger` de `src/lib/logger.ts`.
4. **Pantalla** en `src/app/<ruta>/page.tsx`: mobile-first, clases de `globals.css` (`boton`, `sub`, `error`). Los formularios muestran el error de cada campo debajo del input.

Reglas existentes que hay que reutilizar, no duplicar:

- Cambios de estado de una visita: `cambiarEstado()` de `src/lib/visitas.ts`.
- Validación del registro: `validarRegistro()` de `src/lib/registro.ts`.
- Validación con Zod: `validar()`, `entero()` y `texto()` de `src/lib/validacion.ts` (devuelven `{ ok, datos }` o `{ ok, errores }`).
- Respuestas de la API: `responderErrores()`, `noEncontrado()`, `leerCuerpo()`, `esUuid()` y `errorInterno()` de `src/lib/api.ts`.
- Consultas compartidas: `listarVisitas()`, `obtenerPerfil()` y `listarMecanicos()` de `src/db/consultas.ts`.
- Fechas, pesos, km y etiquetas: `src/lib/formato.ts` (`hoyEnBogota()`, `fechaADate()`, `formatearFecha()`).
- En pantallas: `pedir()` de `src/lib/cliente.ts`, hooks `usePerfil()` / `useDatos()` de `src/components/hooks.ts`, `useSesion()` de `src/components/SesionProvider.tsx` y componentes de `src/components/ui.tsx`.

Sesión (HU-18): domiciliarios y mecánicos entran con celular y PIN. La sesión va en cookies `httpOnly` firmadas, una por rol. En las rutas de la API el usuario se obtiene SIEMPRE con `usuarioEnSesion("domiciliario" | "mecanico")` de `src/lib/sesion-servidor.ts`, nunca del cuerpo ni de la URL; sin sesión se responde `sinSesion()` (401) y si el recurso es de otro, `sinPermiso()` (403). En las pantallas, `useSesion()` de `src/components/SesionProvider.tsx` da `domiciliarioId` y `mecanicoId`.

## Flujo de trabajo (obligatorio)

- Nunca trabajes ni hagas push directo a `main` (está protegida).
- Una rama por historia: `feature/HU-XX-descripcion-corta`.
- Commits pequeños que empiezan con el ID: `HU-03: valida fecha pasada al agendar`.
- Antes de abrir el PR, corre `npm run lint && npm run typecheck && npm test && npm run build`; todo debe pasar.
- PR con `gh pr create`, usando la plantilla de `.github/pull_request_template.md`, con `Cierra #<número del issue>` (búscalo con `gh issue list`).
- No hagas merge: el PR lo revisa y aprueba otro integrante del equipo.
- Nunca subas `.env` ni secretos. Si una historia necesita una variable nueva, agrégala a `.env.example` sin valor real.

## Definición de Terminado

- Cumple todos los criterios de aceptación del issue.
- Tiene al menos una prueba automatizada por criterio de aceptación y pasan.
- CI en verde, PR revisado y aprobado por otro integrante.
- Integrada en `main`, desplegada en Vercel y demostrable en la Sprint Review.

## Al terminar una historia

Explícale al integrante, en pocas líneas, qué hace cada archivo nuevo y por qué se tomó cada decisión: en la sustentación le van a preguntar por su aporte y tiene que poder explicarlo sin ayuda.
