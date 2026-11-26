// HU-16: el domiciliario le escribe por WhatsApp al mecánico que aceptó su visita.
// Funciones puras: arman el enlace y el mensaje, y dicen cuándo se puede contactar.

/** Enlace de WhatsApp con el número colombiano (+57) y el mensaje ya escrito. */
export function enlaceWhatsApp(celular: string, mensaje: string): string {
  return `https://wa.me/57${celular}?text=${encodeURIComponent(mensaje)}`;
}

export function mensajeParaMecanico(placa: string, fecha: string): string {
  return `Hola, soy el dueño de la moto ${placa}. Te escribo por la visita de MotoPit del ${fecha}.`;
}

/** Solo con la visita ASIGNADA hay un mecánico en camino a quien escribirle. */
export function puedeContactarMecanico(estado: string): boolean {
  return estado === "ASIGNADA";
}
