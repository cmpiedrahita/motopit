#!/usr/bin/env bash
# Crea etiquetas, milestones (sprints) e issues del Product Backlog en GitHub.
# Requisitos: GitHub CLI autenticado (gh auth login) y estar dentro del repo clonado.
# Uso: bash scripts/crear-issues.sh
set -euo pipefail

REPO=$(gh repo view --json nameWithOwner -q .nameWithOwner)
echo "Creando backlog en $REPO"

# Etiquetas
for l in "historia:1d76db" "tecnica:5319e7" "prioridad-alta:d93f0b" "prioridad-media:fbca04" "prioridad-baja:c2e0c6" "bloqueado:b60205"; do
  gh label create "${l%%:*}" --color "${l##*:}" --force >/dev/null
done

# Milestones = sprints
for m in "Sprint 1" "Sprint 2"; do
  gh api "repos/$REPO/milestones" -f title="$m" >/dev/null 2>&1 || true
done

# crear <titulo> <prioridad> <milestone|""> <asignado|""> <cuerpo>
crear() {
  local args=(--title "$1" --label historia --label "prioridad-$2" --body "$5")
  [ -n "$3" ] && args+=(--milestone "$3")
  [ -n "$4" ] && args+=(--assignee "$4")
  gh issue create "${args[@]}" >/dev/null
  echo "  ✓ $1"
}

crear "HU-01: Registro del domiciliario con su moto" alta "Sprint 1" "cmpiedrahita" \
"**Como** domiciliario **quiero** registrarme con mi moto **para** poder pedir mantenimiento.

### Criterios de aceptación
- [ ] Al llenar nombre, celular, placa, marca y km, el domiciliario queda registrado con su moto.
- [ ] Una placa o un celular ya registrados muestran un error.
- [ ] Un km negativo o vacío muestra un error.
- [ ] La placa se valida con formato de moto colombiana (ABC12D)."

crear "HU-02: Elegir plan mensual" alta "Sprint 1" "miguelvanegas-c" \
"**Como** domiciliario **quiero** elegir un plan mensual **para** saber cuánto pago y qué incluye.

### Criterios de aceptación
- [ ] Se ven 2 planes con precio y la lista de lo que incluye y lo que NO incluye (mano de obra, aceite, repuestos).
- [ ] Al elegir uno queda activo en el perfil.
- [ ] Solo hay un plan activo a la vez: elegir otro desactiva el anterior.

### Origen
Entrevista E2: no quiere pagar cuota y además cobros aparte."

crear "HU-03: Agendar visita donde está la moto" alta "Sprint 1" "Yojhan-Toro" \
"**Como** domiciliario **quiero** agendar una visita donde está mi moto **para** no perder el día.

### Criterios de aceptación
- [ ] Con un plan activo, al indicar dirección, fecha, franja y servicio se crea la visita en estado PENDIENTE.
- [ ] Sin plan activo no deja agendar y explica por qué.
- [ ] No permite fechas pasadas."

crear "HU-04: Mecánico ve y acepta visitas pendientes" alta "Sprint 1" "cmpiedrahita" \
"**Como** mecánico **quiero** ver y aceptar visitas pendientes **para** organizar mi día.

### Criterios de aceptación
- [ ] El mecánico ve la lista de visitas PENDIENTE.
- [ ] Al aceptar, la visita pasa a ASIGNADA con su nombre.
- [ ] Una visita ya asignada no aparece para otro mecánico ni se puede aceptar dos veces."

crear "HU-05: Ver el estado de mis visitas" media "Sprint 1" "miguelvanegas-c" \
"**Como** domiciliario **quiero** ver el estado de mi visita **para** saber cuándo llega el mecánico.

### Criterios de aceptación
- [ ] El domiciliario ve sus visitas con estado (Pendiente, Asignada, Completada).
- [ ] Si está asignada, ve el nombre del mecánico."

crear "HU-06: Cerrar visita con trabajo y km" alta "Sprint 2" "" \
"**Como** mecánico **quiero** cerrar una visita registrando el trabajo y el km **para** dejar historial.

### Criterios de aceptación
- [ ] Al cerrar se exigen trabajo realizado y km.
- [ ] El km no puede ser menor al km actual de la moto.
- [ ] La visita pasa a COMPLETADA y se actualiza el km de la moto."

crear "HU-13: Perfil verificado del mecánico y calificación" alta "Sprint 2" "" \
"**Como** domiciliario **quiero** ver el perfil verificado del mecánico **para** confiar en quien atiende mi moto.

### Criterios de aceptación
- [ ] Con la visita ASIGNADA se ven nombre, años de experiencia, sello de verificado y calificación promedio.
- [ ] Al completar la visita, el domiciliario califica de 1 a 5.

### Origen
Entrevistas E1 y E2: la confianza en el mecánico es condición para usar el servicio."

crear "HU-07: Recordatorio de cambio de aceite por km" alta "Sprint 2" "" \
"**Como** domiciliario **quiero** un recordatorio cuando me toca cambio de aceite **para** no olvidarlo.

### Criterios de aceptación
- [ ] Si faltan 300 km o menos para el próximo cambio (cada 2.000 km), aparece un aviso en el inicio.
- [ ] El aviso tiene un botón para agendar la visita."

crear "HU-08: Actualizar kilometraje" media "Sprint 2" "" \
"**Como** domiciliario **quiero** actualizar mi kilometraje rápido **para** que los recordatorios sean correctos.

### Criterios de aceptación
- [ ] Desde el inicio se actualiza el km en un paso.
- [ ] No acepta valores menores al actual."

crear "HU-09: Historial de mantenimientos" media "Sprint 2" "" \
"**Como** domiciliario **quiero** ver el historial de mantenimientos de mi moto.

### Criterios de aceptación
- [ ] Lista de visitas completadas con fecha, trabajo y km, de la más reciente a la más antigua.

### Origen
Entrevista E2: lleva una libreta a mano con los cambios de aceite."

crear "HU-14: Visita suelta sin suscripción" media "" "" \
"**Como** domiciliario **quiero** pedir una visita suelta sin suscripción.

Por definir con las preguntas 8 y 9 de la validación. Origen: entrevista E1 (prefiere pagar por uso)."

crear "HU-10: Inscribir flota de empresa de mensajería" baja "" "" "Por definir."
crear "HU-11: Pago del plan en línea" baja "" "" "Por definir."
crear "HU-12: Ver al mecánico en un mapa" baja "" "" "Por definir."

echo "Listo. Ahora crea el tablero: gh project create --owner @me --title 'MotoPit' y agrega los issues."
