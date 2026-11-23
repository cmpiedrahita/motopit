# Guía de aportes · Sprint 3

Para **Miguel** y **Yojhan**. Cada uno tiene dos tareas reales del Sprint 3. Cada una sale en su propia rama, con 3 o 4 commits pequeños y un PR que revisa otro integrante. Al final, cada uno queda con commits suyos en `main` y con algo concreto que mostrar y explicar en la sustentación.

| Quién | Tarea | Puntos | Archivos que toca |
| --- | --- | --- | --- |
| Miguel | [HU-15 · Cancelar una visita](#hu-15--cancelar-una-visita-que-todavía-no-se-ha-hecho-miguel) | 3 | `src/lib/visitas.ts`, nueva ruta `cancelar`, `src/app/visitas/page.tsx` |
| Miguel | [HU-16 · WhatsApp al mecánico](#hu-16--escribirle-al-mecánico-asignado-por-whatsapp-miguel) | 2 | nuevo `src/lib/contacto.ts`, `src/db/consultas.ts`, `src/lib/tipos.ts`, `src/app/visitas/page.tsx` |
| Yojhan | [HU-17 · Sin visitas repetidas el mismo día](#hu-17--no-permitir-dos-visitas-activas-para-la-misma-moto-el-mismo-día-yojhan) | 3 | `src/lib/agenda.ts`, `src/app/api/visitas/route.ts` |
| Yojhan | [T-08 · Pruebas y cobertura en el CI](#t-08--pruebas-de-las-ayudas-de-la-api-y-umbral-de-cobertura-yojhan) | 2 | nuevos `src/lib/api.test.ts` y `src/lib/validacion.test.ts`, `vitest.config.ts`, `package.json`, `.github/workflows/ci.yml` |

**Orden recomendado:** Miguel hace HU-15 y, cuando se integre, HU-16 (las dos tocan `src/app/visitas/page.tsx`). Yojhan puede hacer HU-17 y T-08 en paralelo, porque no se cruzan con las de Miguel.

---

## 0. Preparación (una sola vez)

### 0.1 Que los commits salgan a tu nombre

GitHub solo cuenta un commit como tuyo si el **correo** del commit es uno de los correos de tu cuenta de GitHub. Antes de nada:

```bash
git config --global user.name "Tu Nombre"
git config --global user.email "el-correo-de-tu-cuenta-de-github@ejemplo.com"
```

Revisa tus correos en GitHub → *Settings → Emails*. Si allá tienes activado "Keep my email addresses private", usa el correo `…@users.noreply.github.com` que aparece en esa página.

### 0.2 Acceso al repo

Carlos tiene que agregarte como colaborador: GitHub → repo `motopit` → *Settings → Collaborators → Add people*. Acepta la invitación que te llega al correo.

### 0.3 Clonar y correr el proyecto

```bash
git clone https://github.com/cmpiedrahita/motopit.git
cd motopit
npm install
cp .env.example .env
```

Para la base de datos tienes dos opciones:

- **Con Docker:** `docker compose up -d` (el `.env` ya apunta a esa base).
- **Sin Docker:** crea una base gratis en [neon.tech](https://neon.tech), copia el *connection string* y pégalo en `.env` como `DATABASE_URL=...`. Usa una base **tuya**, no la de producción.

Luego:

```bash
npm run db:migrate
npm run db:seed
npm run dev        # abre http://localhost:3000
```

Haz el recorrido de la sección "Demo en 5 minutos" del [README](../README.md) para conocer la app antes de cambiarla.

### 0.4 Crear el issue de tu historia

En GitHub → *Issues → New issue → Historia de usuario*. Copia el título, el "Como… quiero… para…" y los criterios de aceptación de tu historia (están abajo). Asígnatelo, ponle las etiquetas `historia` y la prioridad. Anota el número (por ejemplo `#15`) porque lo usas en el PR.

Por terminal (si tienes `gh` instalado y con sesión iniciada), por ejemplo:

```bash
gh issue create --title "HU-15: Cancelar una visita que todavía no se ha hecho" --label historia --label prioridad-alta --assignee @me --body-file -
```

(pega el texto, luego Ctrl+D en Mac/Linux o Ctrl+Z y Enter en Windows).

Mueve también la tarjeta en el tablero Scrum a **En progreso**.

---

## 1. Flujo para cada tarea

```bash
git switch main
git pull                                   # trae lo último
git switch -c feature/HU-15-cancelar-visita
# … programas …
npm test                                   # prueba mientras avanzas
git add -A
git commit -m "HU-15: regla para cancelar una visita y sus pruebas"
# … sigues con el siguiente paso y haces otro commit …
npm run lint && npm run typecheck && npm test && npm run build   # TODO debe pasar
git push -u origin feature/HU-15-cancelar-visita
gh pr create --fill    # o desde la web de GitHub: "Compare & pull request"
```

En el PR, llena la plantilla y escribe `Cierra #15` (tu número de issue). Pídele la revisión a otro integrante. **Nadie hace merge de su propio PR.** Cuando lo aprueben y el CI esté en verde, quien revisó hace *Squash and merge* o *Merge*. Luego mueve la tarjeta a **Hecho**.

Reglas del repo (están en el `CLAUDE.md`):

- Un commit por paso, y cada mensaje empieza con el ID: `HU-15: …`.
- Todo en español: código, textos de la pantalla y commits.
- Las reglas de negocio van en `src/lib/` como funciones puras, con una prueba por criterio de aceptación.
- Reutiliza lo que ya existe: `cambiarEstado()` para cambiar estados, `validar()` / `entero()` / `texto()` de `src/lib/validacion.ts`, `responderErrores()` y `esUuid()` de `src/lib/api.ts`, y `pedir()` de `src/lib/cliente.ts` en las pantallas.

> **Si usas Claude Code u otra IA:** está bien, el `CLAUDE.md` ya le explica el proyecto. Pero ve paso por paso, lee cada cambio antes del commit y asegúrate de poder explicarlo. En la sustentación te van a preguntar por tu aporte.

---

## HU-15 · Cancelar una visita que todavía no se ha hecho (Miguel)

**Rama:** `feature/HU-15-cancelar-visita` · **Épica:** Visitas a domicilio · **3 puntos** · Prioridad alta

> **Como** domiciliario **quiero** cancelar una visita que ya no necesito **para** que el mecánico no vaya en vano.

### Criterios de aceptación

- [ ] Puede cancelar una visita PENDIENTE o ASIGNADA y queda en estado CANCELADA.
- [ ] Una visita COMPLETADA o ya CANCELADA no se puede cancelar y muestra un error.
- [ ] Solo el domiciliario dueño de la visita puede cancelarla.
- [ ] La visita cancelada pasa a "Anteriores" y deja de aparecerle al mecánico.

### Paso 1 · Regla y pruebas

En `src/lib/visitas.ts` agrega una función que use la máquina de estados que ya existe (no repitas la lógica):

```ts
// HU-15: cancelar una visita. Solo PENDIENTE o ASIGNADA (lo decide cambiarEstado).
export function cancelarVisita(estado: EstadoVisita): EstadoVisita {
  return cambiarEstado(estado, "CANCELADA");
}
```

En `src/lib/visitas.test.ts` agrega un `describe("HU-15: cancelar una visita", …)` con al menos:

- `"una visita pendiente se puede cancelar"`
- `"una visita asignada se puede cancelar"`
- `"una visita completada no se puede cancelar"` (usa `expect(() => …).toThrow()`)
- `"una visita cancelada no se puede volver a cancelar"`

Corre `npm test`. Commit: `HU-15: regla para cancelar una visita y sus pruebas`.

### Paso 2 · Endpoint

Crea `src/app/api/visitas/[id]/cancelar/route.ts` con un `PATCH` que reciba `{ domiciliarioId }`. Toma como modelo `src/app/api/visitas/[id]/calificacion/route.ts`, que ya resuelve casi lo mismo:

1. Si el `id` no es UUID → `noEncontrado("La visita no existe")`.
2. Busca la visita haciendo join con `motos` para saber de quién es. Si no existe **o** `motos.domiciliarioId` no es el del cuerpo → 404 (así no se revela que existe).
3. `try { cancelarVisita(visita.estado) } catch { return responderErrores({ general: "Esta visita ya no se puede cancelar" }, 409) }`.
4. Actualiza con condición para evitar carreras:
   `.where(and(eq(schema.visitas.id, id), inArray(schema.visitas.estado, ["PENDIENTE", "ASIGNADA"])))` con `.returning(...)`. Si no actualizó nada → 409.
5. `logger.info("visita cancelada", { visitaId: id })` y responde `200 { id, estado: "CANCELADA" }`.

Pruébalo con la app o con un cliente HTTP (Thunder Client, Postman o `curl`). Commit: `HU-15: endpoint para cancelar una visita`.

### Paso 3 · Botón en "Mis visitas"

En `src/app/visitas/page.tsx`, dentro de cada tarjeta de la lista **Próximas** (las activas), agrega un botón `className="boton secundario"` que diga "Cancelar visita". Al tocarlo:

1. Pide confirmación: `if (!window.confirm("¿Seguro que quieres cancelar esta visita?")) return;`
2. Llama `pedir(\`/api/visitas/${v.id}/cancelar\`, { metodo: "PATCH", cuerpo: { domiciliarioId } })`.
3. Si sale bien, `visitas.recargar()`; si no, muestra el error con `<ErrorGeneral mensaje=… />`.

La visita debe pasar sola a **Anteriores** con la etiqueta gris "Cancelada" (eso ya lo pinta `EstadoBadge`). Comprueba también, entrando como mecánico, que ya no aparece en Pendientes. Commit: `HU-15: botón para cancelar en Mis visitas`.

### Qué explicar en la sustentación

Por qué la regla reutiliza `cambiarEstado()` (un solo lugar decide qué transiciones valen), por qué se responde 404 y no 403 cuando la visita es de otro, y para qué sirve el `where` con el estado en el `update` (dos clics al tiempo no rompen nada).

---

## HU-16 · Escribirle al mecánico asignado por WhatsApp (Miguel)

**Rama:** `feature/HU-16-whatsapp-mecanico` (créala desde `main` **después** de integrar HU-15) · **Épica:** Confianza en el mecánico · **2 puntos** · Prioridad media

> **Como** domiciliario **quiero** escribirle al mecánico que aceptó mi visita **para** darle indicaciones de cómo llegar.

### Criterios de aceptación

- [ ] Con la visita ASIGNADA aparece un botón "Escribir por WhatsApp".
- [ ] El botón abre WhatsApp con el número del mecánico (indicativo +57) y un mensaje que incluye la placa y la fecha de la visita.
- [ ] En visitas pendientes, completadas o canceladas el botón no aparece.

### Paso 1 · Regla y pruebas

Crea `src/lib/contacto.ts`:

```ts
// HU-16: enlace de WhatsApp para hablar con el mecánico asignado.
export function enlaceWhatsApp(celular: string, mensaje: string): string {
  return `https://wa.me/57${celular}?text=${encodeURIComponent(mensaje)}`;
}

export function mensajeParaMecanico(placa: string, fecha: string): string {
  return `Hola, soy el dueño de la moto ${placa}. Te escribo por la visita de MotoPit del ${fecha}.`;
}

export function puedeContactarMecanico(estado: string): boolean {
  return estado === "ASIGNADA";
}
```

Crea `src/lib/contacto.test.ts` con una prueba por criterio, por ejemplo `"el enlace lleva el número con +57"`, `"el mensaje incluye la placa y la fecha"`, `"solo se puede contactar con la visita asignada"`. Commit: `HU-16: regla para armar el enlace de WhatsApp y sus pruebas`.

### Paso 2 · Exponer el celular del mecánico

Hoy la API de visitas no devuelve el celular del mecánico. En `src/db/consultas.ts`, dentro de `listarVisitas()`, agrega `celular: mecanicos.celular` al objeto `mecanico` del `select`. En `src/lib/tipos.ts` cambia el tipo de `VisitaDetalle.mecanico` a `(MecanicoPerfil & { celular: string }) | null`. Corre `npm run typecheck`. Commit: `HU-16: la API de visitas incluye el celular del mecánico`.

### Paso 3 · Botón

En `src/app/visitas/page.tsx`, en las tarjetas de **Próximas**, debajo de `<PerfilMecanico … />`, si `puedeContactarMecanico(v.estado) && v.mecanico`:

```tsx
<a
  className="boton secundario"
  style={{ marginTop: 12 }}
  href={enlaceWhatsApp(v.mecanico.celular, mensajeParaMecanico(v.moto.placa, formatearFecha(v.fecha)))}
  target="_blank"
  rel="noopener noreferrer"
>
  <Icono nombre="telefono" tamano={18} /> Escribir por WhatsApp
</a>
```

Commit: `HU-16: botón de WhatsApp en la visita asignada`.

### Qué explicar en la sustentación

Que viene de la épica de confianza (entrevistas E1 y E2), por qué la lógica del enlace está en `src/lib` y tiene pruebas, y por qué `rel="noopener noreferrer"` en enlaces que abren otra pestaña.

---

## HU-17 · No permitir dos visitas activas para la misma moto el mismo día (Yojhan)

**Rama:** `feature/HU-17-sin-visitas-repetidas` · **Épica:** Visitas a domicilio · **3 puntos** · Prioridad alta

> **Como** mecánico **quiero** que no se agenden dos visitas para la misma moto el mismo día **para** no ir dos veces al mismo lugar.

### Criterios de aceptación

- [ ] Si la moto ya tiene una visita PENDIENTE o ASIGNADA en esa fecha, no deja agendar otra y muestra "Ya tienes una visita agendada para ese día".
- [ ] Si la visita de ese día está CANCELADA o COMPLETADA, sí deja agendar.
- [ ] Para otro día sí deja agendar.

### Paso 1 · Regla y pruebas

En `src/lib/agenda.ts`:

```ts
export const MENSAJE_CHOQUE = "Ya tienes una visita agendada para ese día";

/** HU-17: true si ya hay una visita activa de la moto en esa fecha ("AAAA-MM-DD"). */
export function hayChoqueDeFecha(visitas: { estado: string; fecha: Date | string }[], fecha: string): boolean {
  return visitas.some(
    (v) => (v.estado === "PENDIENTE" || v.estado === "ASIGNADA") && hoyEnBogota(new Date(v.fecha)) === fecha,
  );
}
```

(`hoyEnBogota` ya existe en `src/lib/formato.ts`: convierte una fecha a "AAAA-MM-DD" en hora de Colombia; impórtala.)

En `src/lib/agenda.test.ts` agrega un `describe("HU-17: …")` con una prueba por criterio. Las fechas guardadas en la base de datos quedan a mediodía UTC, así que en las pruebas usa visitas como `{ estado: "PENDIENTE", fecha: "2026-11-25T12:00:00Z" }`. Commit: `HU-17: regla para detectar dos visitas el mismo día y sus pruebas`.

### Paso 2 · Usarla en la API

En `src/app/api/visitas/route.ts`, en el `POST`, **después** de que `validarAgenda` sale bien y **antes** del `insert`:

1. Consulta las visitas de la moto: `db.select({ estado: schema.visitas.estado, fecha: schema.visitas.fecha }).from(schema.visitas).where(eq(schema.visitas.motoId, moto.id))`.
2. Si `hayChoqueDeFecha(visitasDeLaMoto, fecha)` → `return responderErrores({ fecha: MENSAJE_CHOQUE }, 409)`.

Commit: `HU-17: la API rechaza una segunda visita el mismo día`.

### Paso 3 · Verificar en la pantalla

No hay que tocar la pantalla: `/agendar` ya muestra `errores.fecha` debajo del campo de fecha. Pruébalo: agenda una visita para mañana y luego intenta otra para mañana (debe salir el error), cancela o completa la primera y vuelve a intentar (debe dejar). Si quieres, agrega una línea en el README, en la tabla de la API, con el nuevo 409.

### Qué explicar en la sustentación

Por qué la comparación se hace en hora de Colombia (una visita guardada a las 12:00 UTC sigue siendo el mismo día aquí) y por qué el error se devuelve en el campo `fecha` (así la pantalla lo pone debajo del input sin cambiar nada).

---

## T-08 · Pruebas de las ayudas de la API y umbral de cobertura (Yojhan)

**Rama:** `feature/T-08-cobertura` · **Épica:** Plataforma y DevOps · **2 puntos** · Prioridad media

> **Como** equipo **queremos** que el CI falle si baja la cobertura de las reglas de negocio **para** no integrar código sin pruebas.

### Criterios de aceptación

- [ ] `src/lib/api.ts` y `src/lib/validacion.ts` tienen pruebas.
- [ ] `npm run test:coverage` muestra la cobertura de `src/lib` y falla si baja del umbral acordado (sugerido: 80 % de líneas y funciones).
- [ ] El CI corre las pruebas con cobertura.

### Paso 1 · Pruebas que faltan

Crea `src/lib/api.test.ts`:

- `esUuid`: acepta un UUID válido, rechaza `"abc"`, `undefined` y un número.
- `esDuplicado`: `true` con `{ code: "23505" }` y con `{ cause: { code: "23505" } }`; `false` con otro código o con `null`.
- `leerCuerpo`: con `new Request("http://localhost", { method: "POST", body: JSON.stringify({ a: 1 }) })` devuelve `{ a: 1 }`; con `body: "esto no es json"` devuelve `{}`.

Crea `src/lib/validacion.test.ts`:

- `aErrores` deja solo el **primer** mensaje de cada campo.
- `entero("Escribe el km")` con `""` da "Escribe el km", con `"abc"` da "Debe ser un número entero" y con `"15"` da `15`. (Pruébalo con `validar(z.object({ km: entero("Escribe el km") }), { km: "" })`.)

Commit: `T-08: pruebas de las ayudas de la API y de validación`.

### Paso 2 · Umbral de cobertura

En `vitest.config.ts`, dentro de `coverage`, agrega:

```ts
coverage: {
  reporter: ["text", "html"],
  include: ["src/lib/**"],
  // Archivos que solo corren en el navegador o solo tienen tipos.
  exclude: ["src/lib/**/*.test.ts", "src/lib/cliente.ts", "src/lib/sesion.ts", "src/lib/tipos.ts"],
  thresholds: { lines: 80, functions: 80 },
},
```

En `package.json`, en `scripts`, agrega `"test:coverage": "vitest run --coverage"`. Corre `npm run test:coverage` y anota el porcentaje. Si `logger.ts` baja el total, agrégale una prueba sencilla con `vi.spyOn(console, "log")`. Commit: `T-08: umbral de cobertura para src/lib`.

### Paso 3 · CI

En `.github/workflows/ci.yml`, en el paso "Pruebas automatizadas", cambia `run: npm test` por `run: npm run test:coverage`. Commit: `T-08: el CI corre las pruebas con cobertura`. En el PR, pega la tabla de cobertura que sale en el log del CI.

### Qué explicar en la sustentación

Qué mide la cobertura y qué **no** mide (que una línea se ejecute no garantiza que esté bien probada), por qué se excluyen los archivos del navegador y cómo el umbral protege la rama `main` junto con la regla de protección.

---

## Extra (opcional, cuenta como aporte de Scrum)

Al cierre del Sprint 3 creen `docs/sprints/sprint-3.md` con la Planning, la Review y la Retro usando las plantillas de [GUIA-BACKLOG.md](GUIA-BACKLOG.md#5-ceremonias-una-tarjeta-o-página-por-sprint). Miguel, como Product Owner, escribe la Review; Yojhan, la Retro. Commit: `docs: review y retro del Sprint 3`.
