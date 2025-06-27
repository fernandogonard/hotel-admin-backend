# Tareas para Checklist de Arquitectura MERN – PMS Hotelero

## 1. Estructura modular
- [x] Crear carpeta `layouts/` en frontend y migrar layouts comunes.

## 2. Modelos MongoDB
- [x] Crear modelo `CleaningTask` en backend (`models/CleaningTask.js`).
- [x] Crear modelo `ActivityLog` en backend (`models/ActivityLog.js`).

## 3. API RESTful
- [x] Implementar endpoint `/api/cleaning/assign` (controlador, ruta y lógica).
- [x] Añadir validación de roles y rutas protegidas en frontend (admin, recepcionista, huésped).

## 4. Seguridad
- [x] Revisar y reforzar medidas anti ataques comunes (CSRF, logs, etc.).

## 5. Testing
- [x] Unificar validaciones con Express Validator o Joi en todas las rutas.
- [x] Ampliar cobertura de tests (unitarios e integración) con Jest.

## 6. Frontend
- [x] Implementar rutas protegidas y validación de roles en React Router.
- [x] Evaluar uso de Redux si la app crece.  <!-- Estado: No es necesario por ahora, Context y hooks cubren el flujo actual. -->

## 7. Emails
- [x] Integrar Nodemailer para confirmaciones de reserva y notificaciones.
- [ ] Crear plantillas de email personalizadas. <!-- Puede mejorarse con plantillas HTML más avanzadas. -->

## 8. Documentación
- [x] Completar `README.md` con instrucciones de instalación, estructura, uso de scripts y variables de entorno.

---

**Examen completo del proyecto:**

- Arquitectura modular, escalable y profesional.
- Seguridad avanzada: JWT httpOnly, CSRF, Helmet, CORS, rate limiting, XSS, logs, Sentry.
- Validaciones centralizadas y robustas (Joi).
- Tests automáticos de endpoints críticos y flujos protegidos.
- Rutas protegidas y control de roles en frontend.
- Emails automáticos funcionales (Nodemailer, pendiente mejorar plantillas).
- Documentación exhaustiva y checklist profesional.
- Cumple requisitos de producción y auditoría.

**Estado:**
- El sistema está listo para producción, seguro, testeado y documentado.
- Solo resta mejorar el diseño de plantillas de email si se desea mayor personalización visual.

> ¡Proyecto auditado y validado! 🚀
