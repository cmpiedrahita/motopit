# Guía para montar el backlog Scrum de MotoPit

Esta guía es para quien arme el tablero del proyecto. Sirve para cualquier herramienta sencilla (Trello, Jira, Notion, ClickUp, Taiga…). Aquí está **todo el contenido listo para copiar**: épicas, historias de usuario con criterios y puntos, tareas, sprints y ceremonias.

> Los issues de GitHub (`#1` a `#14`) se siguen usando para enlazar los PR con `Cierra #N`. El tablero es la vista Scrum del equipo; en cada tarjeta pon el número del issue para poder cruzarlos.

También está el archivo [backlog.csv](backlog/backlog.csv) con las mismas épicas, historias y tareas por si la herramienta permite importar CSV (Jira, Notion, ClickUp y Taiga lo permiten; Trello solo con un Power-Up).

---

## 1. Cómo armar el tablero (30–40 minutos)

### Paso 1: crear el tablero y las columnas

Crea un tablero llamado **MotoPit · Scrum** con estas columnas, en este orden:

| Columna | Qué va ahí |
| --- | --- |
| **Product Backlog** | Historias que todavía no entran a un sprint (ordenadas por prioridad, la más importante arriba). |
| **Sprint Backlog** | Historias y tareas comprometidas en el sprint actual. |
| **En progreso** | Lo que alguien está trabajando ahora (máximo 2 tarjetas por persona). |
| **En revisión (PR)** | Hay un Pull Request abierto esperando la aprobación de otro integrante. |
| **Hecho** | Cumple la Definición de Terminado (ver sección 6). |

### Paso 2: crear las etiquetas

| Etiqueta | Color sugerido | Para qué |
| --- | --- | --- |
| `Épica: Registro y suscripción` | azul | EP-01 |
| `Épica: Visitas a domicilio` | naranja | EP-02 |
| `Épica: Confianza en el mecánico` | verde | EP-03 |
| `Épica: Mantenimiento preventivo` | morado | EP-04 |
| `Épica: Plataforma y DevOps` | gris | EP-05 |
| `Épica: Crecimiento (futuro)` | celeste | EP-06 |
| `Historia` / `Tarea técnica` | — | Tipo de tarjeta |
| `Prioridad alta` / `media` / `baja` | rojo / amarillo / verde claro | Prioridad del PO |

En Jira, las épicas se crean como tipo **Epic** y las historias se enlazan con *Parent*. En Trello y Notion se usan etiquetas (o una propiedad "Épica").

### Paso 3: crear los sprints

| Sprint | Fechas sugeridas | Objetivo |
| --- | --- | --- |
| Sprint 0 | 16 – 20 nov 2026 | Dejar lista la base técnica: repo, CI, despliegue, modelo de datos y backlog. |
| Sprint 1 | 23 – 27 nov 2026 | Un domiciliario puede registrarse, elegir plan y agendar; el mecánico acepta la visita. |
| Sprint 2 | 30 nov – 4 dic 2026 | Cerrar el ciclo del mantenimiento: cierre de visita, confianza en el mecánico y recordatorios. |
| Sprint 3 | 7 – 11 dic 2026 | Mejoras pedidas en la validación y refuerzo de calidad (aportes de Miguel y Yojhan). |

Ajusten las fechas al calendario real del curso. En Jira se crean desde *Backlog → Create sprint*; en Trello o Notion, como etiqueta o propiedad "Sprint".

### Paso 4: crear las tarjetas

1. Crea las **6 épicas** (sección 2).
2. Crea cada **historia** de la sección 3 con su descripción "Como… quiero… para…", los criterios de aceptación como **checklist**, los puntos, la prioridad, el responsable y el número de issue.
3. Dentro de cada historia agrega sus **tareas** (como checklist en Trello, subtareas en Jira o sub-items en Notion/ClickUp).
4. Mueve cada tarjeta a su columna según la columna **Estado** de las tablas.

### Paso 5: registrar las ceremonias

Crea una tarjeta (o página) por ceremonia y por sprint con la plantilla de la sección 5. Eso es lo que muestra en la sustentación que sí se hizo Scrum.

---

## 2. Épicas

| ID | Épica | Objetivo | Historias |
| --- | --- | --- | --- |
| EP-01 | Registro y suscripción | Que el domiciliario entre al servicio y sepa cuánto paga. | HU-01, HU-02 |
| EP-02 | Visitas a domicilio | Que el mecánico llegue a donde está la moto sin perder el día de trabajo. | HU-03, HU-04, HU-05, HU-06, HU-15, HU-17 |
| EP-03 | Confianza en el mecánico | Que el domiciliario sepa quién atiende su moto (entrevistas E1 y E2). | HU-13, HU-16 |
| EP-04 | Mantenimiento preventivo | Que la moto no falle por olvidar el aceite (reemplaza la libreta de E2). | HU-07, HU-08, HU-09 |
| EP-05 | Plataforma y DevOps | Repo, CI, despliegue continuo, monitoreo y calidad. | T-01 a T-08 |
| EP-06 | Crecimiento (futuro) | Ideas validadas pero fuera del MVP. | HU-10, HU-11, HU-12, HU-14 |

---

## 3. Historias de usuario

Puntos en escala Fibonacci (1, 2, 3, 5, 8). Responsable = quien la tomó en el Sprint Planning.

### Sprint 0 · Base técnica (Hecho)

| ID | Tarea técnica | Épica | Pts | Responsable | Estado |
| --- | --- | --- | --- | --- | --- |
| T-01 | Crear repo, esqueleto Next.js + TypeScript y estructura de carpetas | EP-05 | 2 | Carlos | Hecho |
| T-02 | Modelo de datos con Drizzle (domiciliarios, motos, planes, suscripciones, mecánicos, visitas) y primera migración | EP-05 | 3 | Carlos | Hecho |
| T-03 | CI en GitHub Actions: lint, tipos, pruebas y build en cada PR | EP-05 | 2 | Carlos | Hecho |
| T-04 | Health check `GET /api/health` y logger en JSON | EP-05 | 1 | Carlos | Hecho |
| T-05 | Plantillas de issue y PR, protección de la rama `main` | EP-05 | 1 | Carlos | Hecho |
| T-06 | Despliegue en Vercel + base de datos en Neon | EP-05 | 2 | Carlos | Hecho |
| T-07 | Product Backlog inicial a partir de las entrevistas E1 y E2 | EP-05 | 2 | Miguel (PO) | Hecho |

### Sprint 1 · 21 puntos (Hecho)

**HU-01 · Registro del domiciliario con su moto** · issue #1 · EP-01 · 5 pts · Prioridad alta · Carlos

> **Como** domiciliario **quiero** registrarme con mi moto **para** poder pedir mantenimiento.

Criterios de aceptación:
- [x] Al llenar nombre, celular, placa, marca y km, el domiciliario queda registrado con su moto.
- [x] Una placa o un celular ya registrados muestran un error.
- [x] Un km negativo o vacío muestra un error.
- [x] La placa se valida con formato de moto colombiana (ABC12D).

Tareas:
- [x] Reglas `validarRegistro()` y `erroresDuplicados()` en `src/lib/registro.ts` + pruebas
- [x] API `POST /api/domiciliarios` (201 / 400 / 409)
- [x] Pantalla `/registro` con vista previa de la placa y errores por campo
- [x] Ingreso con celular (`/ingresar`) para volver a entrar desde otro dispositivo
- [x] PR revisado y desplegado

**HU-02 · Elegir plan mensual** · issue #2 · EP-01 · 3 pts · Prioridad alta · Miguel

> **Como** domiciliario **quiero** elegir un plan mensual **para** saber cuánto pago y qué incluye.

Criterios de aceptación:
- [x] Se ven 2 planes con precio y la lista de lo que incluye y lo que NO incluye (mano de obra, aceite, repuestos).
- [x] Al elegir uno queda activo en el perfil.
- [x] Solo hay un plan activo a la vez: elegir otro desactiva el anterior.

Origen: entrevista E2 (no quiere pagar cuota y además cobros aparte).

Tareas:
- [x] Regla `planearCambioDePlan()` en `src/lib/planes.ts` + pruebas
- [x] API `GET /api/planes` y `POST /api/suscripciones` (transacción)
- [x] Pantalla `/planes` con tarjetas de plan, "incluye" y "no incluye"
- [x] Seed con Plan Básico ($45.000) y Plan Full ($75.000)
- [x] PR revisado y desplegado

**HU-03 · Agendar visita donde está la moto** · issue #3 · EP-02 · 5 pts · Prioridad alta · Yojhan

> **Como** domiciliario **quiero** agendar una visita donde está mi moto **para** no perder el día.

Criterios de aceptación:
- [x] Con un plan activo, al indicar dirección, fecha, franja y servicio se crea la visita en estado PENDIENTE.
- [x] Sin plan activo no deja agendar y explica por qué.
- [x] No permite fechas pasadas.

Tareas:
- [x] Regla `validarAgenda()` en `src/lib/agenda.ts` (fecha en hora de Colombia) + pruebas
- [x] API `POST /api/visitas` (201 / 400 / 409 sin plan)
- [x] Pantalla `/agendar` con franjas y servicios como tarjetas seleccionables
- [x] PR revisado y desplegado

**HU-04 · Mecánico ve y acepta visitas pendientes** · issue #4 · EP-02 · 5 pts · Prioridad alta · Carlos

> **Como** mecánico **quiero** ver y aceptar visitas pendientes **para** organizar mi día.

Criterios de aceptación:
- [x] El mecánico ve la lista de visitas PENDIENTE.
- [x] Al aceptar, la visita pasa a ASIGNADA con su nombre.
- [x] Una visita ya asignada no aparece para otro mecánico ni se puede aceptar dos veces.

Tareas:
- [x] Reglas `aceptarVisita()` y `clasificarParaMecanico()` en `src/lib/visitas.ts` + pruebas
- [x] API `GET /api/mecanicos/:id/visitas` y `PATCH /api/visitas/:id/aceptar` (update condicional contra carreras)
- [x] Pantalla `/mecanico` con selección de perfil y pestañas Pendientes / Mis visitas
- [x] PR revisado y desplegado

**HU-05 · Ver el estado de mis visitas** · issue #5 · EP-02 · 3 pts · Prioridad media · Miguel

> **Como** domiciliario **quiero** ver el estado de mi visita **para** saber cuándo llega el mecánico.

Criterios de aceptación:
- [x] El domiciliario ve sus visitas con estado (Pendiente, Asignada, Completada).
- [x] Si está asignada, ve el nombre del mecánico.

Tareas:
- [x] Consulta `listarVisitas()` en `src/db/consultas.ts` (visita + moto + mecánico)
- [x] API `GET /api/visitas?domiciliarioId=`
- [x] Pantalla `/visitas` (próximas y anteriores) y tarjeta "Próxima visita" en el inicio
- [x] PR revisado y desplegado

### Sprint 2 · 17 puntos (Hecho)

**HU-06 · Cerrar visita con trabajo y km** · issue #6 · EP-02 · 5 pts · Prioridad alta · Carlos

> **Como** mecánico **quiero** cerrar una visita registrando el trabajo y el km **para** dejar historial.

Criterios de aceptación:
- [x] Al cerrar se exigen trabajo realizado y km.
- [x] El km no puede ser menor al km actual de la moto.
- [x] La visita pasa a COMPLETADA y se actualiza el km de la moto.

Tareas:
- [x] Reglas `validarCierre()` y `motoTrasCierre()` + pruebas
- [x] API `PATCH /api/visitas/:id/cerrar` (solo el mecánico asignado, transacción visita + moto)
- [x] Formulario "Cerrar visita" en `/mecanico` → Mis visitas
- [x] PR revisado y desplegado

**HU-13 · Perfil verificado del mecánico y calificación** · issue #7 · EP-03 · 5 pts · Prioridad alta · Miguel

> **Como** domiciliario **quiero** ver el perfil verificado del mecánico **para** confiar en quien atiende mi moto.

Criterios de aceptación:
- [x] Con la visita ASIGNADA se ven nombre, años de experiencia, sello de verificado y calificación promedio.
- [x] Al completar la visita, el domiciliario califica de 1 a 5.

Origen: entrevistas E1 y E2 (la confianza en el mecánico es condición para usar el servicio).

Tareas:
- [x] Reglas `validarCalificacion()`, `puedeCalificar()` y `resumenCalificaciones()` + pruebas
- [x] API `POST /api/visitas/:id/calificacion` y `GET /api/mecanicos`
- [x] Componente `PerfilMecanico` y selector de estrellas en `/visitas`
- [x] PR revisado y desplegado

**HU-07 · Recordatorio de cambio de aceite por km** · issue #8 · EP-04 · 3 pts · Prioridad alta · Yojhan

> **Como** domiciliario **quiero** un recordatorio cuando me toca cambio de aceite **para** no olvidarlo.

Criterios de aceptación:
- [x] Si faltan 300 km o menos para el próximo cambio (cada 2.000 km), aparece un aviso en el inicio.
- [x] El aviso tiene un botón para agendar la visita.

Tareas:
- [x] Regla `recordatorioAceite()` en `src/lib/mantenimiento.ts` + pruebas
- [x] Perfil `GET /api/domiciliarios/:id` con el recordatorio calculado
- [x] Aviso y barra de progreso en el inicio; botón a `/agendar?servicio=CAMBIO_ACEITE`
- [x] PR revisado y desplegado

**HU-08 · Actualizar kilometraje** · issue #9 · EP-04 · 2 pts · Prioridad media · Yojhan

> **Como** domiciliario **quiero** actualizar mi kilometraje rápido **para** que los recordatorios sean correctos.

Criterios de aceptación:
- [x] Desde el inicio se actualiza el km en un paso.
- [x] No acepta valores menores al actual.

Tareas:
- [x] Regla `validarNuevoKm()` + pruebas
- [x] API `PATCH /api/motos/:id`
- [x] Botón "Actualizar" en la tarjeta de la moto del inicio
- [x] PR revisado y desplegado

**HU-09 · Historial de mantenimientos** · issue #10 · EP-04 · 2 pts · Prioridad media · Carlos

> **Como** domiciliario **quiero** ver el historial de mantenimientos de mi moto.

Criterios de aceptación:
- [x] Lista de visitas completadas con fecha, trabajo y km, de la más reciente a la más antigua.

Origen: entrevista E2 (lleva una libreta a mano con los cambios de aceite).

Tareas:
- [x] Regla `historialDeMantenimiento()` + prueba
- [x] Pantalla `/historial` con resumen y línea de tiempo
- [x] PR revisado y desplegado

### Sprint 3 · Mejoras y calidad (Sprint Backlog)

Estas son las historias de [GUIA-APORTES.md](GUIA-APORTES.md). Primero hay que crear sus issues en GitHub (ver esa guía).

| ID | Historia / tarea | Épica | Pts | Prioridad | Responsable | Estado |
| --- | --- | --- | --- | --- | --- | --- |
| HU-15 | Cancelar una visita que todavía no se ha hecho | EP-02 | 3 | Alta | Miguel | Sprint Backlog |
| HU-16 | Escribirle al mecánico asignado por WhatsApp | EP-03 | 2 | Media | Miguel | Sprint Backlog |
| HU-17 | No permitir dos visitas activas para la misma moto el mismo día | EP-02 | 3 | Alta | Yojhan | Sprint Backlog |
| T-08 | Pruebas de las ayudas de la API y umbral de cobertura en el CI | EP-05 | 2 | Media | Yojhan | Sprint Backlog |
| T-09 | Animaciones: escenas de calle, llegada del mecánico, carretera de pasos y celebraciones | EP-05 | 3 | Media | Carlos | Hecho |

Criterios de aceptación de cada una: ver [GUIA-APORTES.md](GUIA-APORTES.md).

### Product Backlog (sin sprint)

| ID | Historia | Épica | Pts estimados | Prioridad | Issue | Nota |
| --- | --- | --- | --- | --- | --- | --- |
| HU-14 | Pedir una visita suelta sin suscripción | EP-06 | 5 | Media | #11 | Depende de las preguntas 8 y 9 de la validación (E1 prefiere pagar por uso). |
| HU-10 | Inscribir flota de empresa de mensajería | EP-06 | 8 | Baja | #12 | Por definir con el PO. |
| HU-11 | Pago del plan en línea | EP-06 | 8 | Baja | #13 | Requiere pasarela de pagos. |
| HU-12 | Ver al mecánico en un mapa | EP-06 | 5 | Baja | #14 | Requiere geolocalización. |

---

## 4. Métricas para mostrar

| Sprint | Comprometido | Terminado | Velocidad |
| --- | --- | --- | --- |
| Sprint 0 | 13 pts | 13 pts | 13 |
| Sprint 1 | 21 pts | 21 pts | 21 |
| Sprint 2 | 17 pts | 17 pts | 17 |
| Sprint 3 | 13 pts | — | — |

**Burndown:** en Jira sale solo (*Reports → Burndown chart*). En Trello o Notion, hagan una tabla con los puntos que faltan cada día del sprint y una gráfica de línea en Excel o Google Sheets; pongan la imagen en la tarjeta de la Sprint Review.

---

## 5. Ceremonias (una tarjeta o página por sprint)

**Sprint Planning**
```
Fecha:
Objetivo del sprint:
Historias comprometidas (ID · puntos · responsable):
Capacidad del equipo:
```

**Daily (resumen de la semana)**
```
Día · ¿Qué hice? · ¿Qué haré? · ¿Algo me bloquea?
```

**Sprint Review**
```
Fecha:
Qué se mostró (historias terminadas):
Comentarios del Product Owner:
Historias que vuelven al backlog:
Enlace al deploy en Vercel:
```

**Retrospectiva**
```
¿Qué salió bien?
¿Qué hay que mejorar?
Acciones para el próximo sprint (con responsable):
```

Ideas reales para la retro del Sprint 1 y 2 (ajústenlas a lo que vivieron):
- Bien: el patrón "reglas puras + pruebas + API + pantalla" hizo que cada historia se probara fácil; el CI atrapó errores antes del merge.
- Mejorar: las historias del Sprint 1 dependían unas de otras (sin HU-02 no se podía probar HU-03); el próximo sprint conviene planear el orden.
- Acción: revisar los PR el mismo día para no bloquear al compañero.

---

## 6. Definiciones

**Definición de Listo (para que una historia entre a un sprint)**
- Tiene "Como… quiero… para…" y criterios de aceptación verificables.
- Está estimada en puntos y el PO le dio prioridad.
- Tiene issue en GitHub.

**Definición de Terminado**
- Cumple todos los criterios de aceptación.
- Tiene al menos una prueba automatizada por criterio y pasan.
- CI en verde, PR revisado y aprobado por otro integrante.
- Integrada en `main`, desplegada en Vercel y demostrable en la Sprint Review.
