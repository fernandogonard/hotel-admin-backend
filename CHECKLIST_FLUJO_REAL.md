# Checklist de Validación de Flujo Real (Hotel Management)

## 1. Creación de Reserva (Web Pública y Admin)

- [ ] No se permite crear una reserva con fechas en el pasado.
- [ ] No se permite crear una reserva donde check-out ≤ check-in.
- [ ] No se permite reservar una habitación ya ocupada o reservada en ese rango de fechas (sin solapamientos).
- [ ] Al crear una reserva, se actualiza el estado de la habitación a “reservada”.
- [ ] Se envía email de confirmación al huésped (si está configurado).
- [ ] La reserva aparece en la colección `reservations` y la habitación en `rooms` refleja el nuevo estado.
- [ ] El frontend muestra feedback claro de éxito o error.

## 2. Check-in de Reserva

- [ ] Solo se puede hacer check-in de reservas en estado “reservado”.
- [ ] Al hacer check-in, el estado de la reserva pasa a “ocupado” y la habitación a “ocupada”.
- [ ] El cambio se refleja en la base de datos y en el dashboard.

## 3. Check-out de Reserva

- [ ] Solo se puede hacer check-out de reservas en estado “ocupado”.
- [ ] Al hacer check-out, la reserva pasa a “completado” y la habitación a “limpieza”.
- [ ] El cambio se refleja en la base de datos y en el dashboard.

## 4. Cancelación de Reserva

- [ ] Solo se puede cancelar reservas activas (no completadas ni ya canceladas).
- [ ] Al cancelar, la reserva pasa a “cancelado” y la habitación vuelve a “disponible” (si no hay otras reservas activas).
- [ ] El cambio se refleja en la base de datos y en el dashboard.

## 5. Validaciones Generales

- [ ] No se permite crear reservas con datos incompletos o inválidos (nombre, email, fechas, habitación, etc.).
- [ ] El sistema valida roles y permisos en cada acción (admin, recepcionista, público).
- [ ] Los endpoints protegidos requieren autenticación y roles correctos.
- [ ] Los logs de actividad se registran correctamente (opcional).

## 6. Integridad de Datos

- [ ] No hay reservas duplicadas para la misma habitación y fechas.
- [ ] Los estados de habitaciones y reservas son consistentes tras cada operación.
- [ ] Los datos mostrados en el dashboard coinciden con la base de datos.

## 7. Experiencia de Usuario

- [ ] El usuario recibe mensajes claros de error o éxito en cada acción.
- [ ] El frontend refleja los cambios en tiempo real tras cada operación.
