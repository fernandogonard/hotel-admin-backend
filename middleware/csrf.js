// Configuración de CSRF para Express
import csurf from 'csurf';

// Middleware CSRF: solo para rutas que usan cookies httpOnly
export const csrfProtection = csurf({
  cookie: {
    httpOnly: true,
    sameSite: 'strict',
    secure: process.env.NODE_ENV === 'production',
    key: '_csrf',
  },
  ignoreMethods: ['GET', 'HEAD', 'OPTIONS'], // Solo protege métodos de escritura
});

// Middleware para exponer el token CSRF en una ruta segura
export function sendCsrfToken(req, res) {
  res.status(200).json({ csrfToken: req.csrfToken() });
}
