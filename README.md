# PMS Hotelero MERN – Documentación Completa

## Descripción General

Sistema de gestión hotelera (PMS) fullstack basado en MERN (MongoDB, Express, React, Node.js) con arquitectura profesional, seguridad avanzada, API RESTful, frontend moderno y sitio público. Incluye gestión de reservas, habitaciones, usuarios, reportes, limpieza, notificaciones por email y más.

---

## Estructura del Proyecto

```text
root/
├── hotel-admin-backend/   # Backend Node.js/Express
│   ├── controllers/       # Lógica de negocio y endpoints
│   ├── models/            # Modelos Mongoose (MongoDB)
│   ├── routes/            # Definición de rutas API REST
│   ├── services/          # Servicios (email, lógica, etc.)
│   ├── middleware/        # Middlewares de seguridad y validación
│   ├── config/            # Configuración y utilidades
│   ├── __tests__/         # Tests automáticos (Jest + Supertest)
│   ├── .env.example       # Variables de entorno requeridas
│   └── README.md          # (Este archivo)
├── hotel-admin-frontend/  # Frontend React (Vite)
│   ├── src/
│   │   ├── pages/         # Vistas principales
│   │   ├── components/    # Componentes reutilizables
│   │   ├── layouts/       # Layouts comunes
│   │   ├── hooks/         # Hooks personalizados (auth, etc.)
│   │   └── utils/         # Utilidades
│   ├── public/            # Recursos estáticos
│   └── README.md          # Documentación frontend
├── diva-web/              # Sitio público institucional
│   └── ...
└── AUDITORIA_CHECKLIST.md # Checklist profesional de auditoría
```

---

## Instalación y Puesta en Marcha

### 1. Clonar el repositorio

```bash
git clone <REPO_URL>
cd <REPO>
```

### 2. Variables de entorno

Copia `.env.example` a `.env` en `hotel-admin-backend/` y completa los valores:

```bash
cp hotel-admin-backend/.env.example hotel-admin-backend/.env
```

### 3. Instalar dependencias

```bash
cd hotel-admin-backend
npm install
cd ../hotel-admin-frontend
npm install
```

### 4. Levantar el backend

```bash
cd ../hotel-admin-backend
npm run dev
```

### 5. Levantar el frontend

```bash
cd ../hotel-admin-frontend
npm run dev
```

### 6. Acceso

- Frontend: [http://localhost:5173](http://localhost:5173)
- Backend API: [http://localhost:3001](http://localhost:3001)
- Documentación Swagger: [http://localhost:3001/api-docs](http://localhost:3001/api-docs)

---

## Scripts Útiles (Backend)

- `npm run dev`        # Levanta backend en modo desarrollo (nodemon)
- `npm start`          # Levanta backend en modo producción
- `npm test`           # Ejecuta tests automáticos (Jest + Supertest)
- `npm run lint`       # Linting de código

## Scripts Útiles (Frontend)

- `npm run dev`        # Levanta frontend en modo desarrollo (Vite)
- `npm run build`      # Compila frontend para producción
- `npm run lint`       # Linting de código

---

## Variables de Entorno Clave (Backend)

- `MONGO_URI`           # Cadena de conexión a MongoDB
- `JWT_SECRET`          # Secreto para JWT
- `EMAIL_FROM`          # Email remitente
- `SMTP_HOST`           # Host SMTP (Mailtrap, Gmail, etc.)
- `SMTP_PORT`           # Puerto SMTP
- `SMTP_USER`           # Usuario SMTP
- `SMTP_PASS`           # Contraseña SMTP
- `SENTRY_DSN`          # (Opcional) DSN para monitoreo de errores
- `NODE_ENV`            # development | production

---

## Seguridad y Buenas Prácticas

- Autenticación JWT con cookies httpOnly
- Protección CSRF (`csurf`)
- Helmet, CORS, rate limiting, XSS y sanitización
- Logs y monitoreo con Sentry
- Validaciones centralizadas (Joi)
- Tests automáticos para endpoints críticos
- `.gitignore` robusto

---

## Funcionalidades Principales

- Gestión de reservas (con validación de solapamientos)
- Gestión de habitaciones, usuarios y huéspedes
- Paneles diferenciados por rol (admin, recepcionista, huésped)
- Calendario de reservas y reportes
- Gestión de limpieza y tareas
- Emails automáticos de confirmación
- Documentación Swagger
- Health check `/api/health`

---

## Estructura de Roles

- **Admin:** Acceso total, gestión de usuarios, reportes, habitaciones
- **Recepcionista:** Gestión de reservas, huéspedes, calendario
- **Huésped:** Acceso a historial y reservas propias

---

## Testing

- Cobertura con Jest y Supertest
- Tests de integración y unitarios
- Mock de endpoints protegidos y validaciones

---

## Auditoría y Checklist

- Ver `AUDITORIA_CHECKLIST.md` y `CHECKLIST_TAREAS.md` para seguimiento profesional y compliance.

---

## Contacto y soporte

Para dudas, soporte o contribuciones, contactar a: [tu-email@hotel.com]

---

> **¡Listo para producción!**
