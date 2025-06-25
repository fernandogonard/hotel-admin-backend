```javascript
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const routes = require('./routes');
const errorHandler = require('./middlewares/errorHandler');
const sanitize = require('./middlewares/sanitize');
const swaggerUi = require('swagger-ui-express');
const YAML = require('yamljs');
const swaggerDocument = YAML.load('./swagger.yaml');

const app = express();

// Configuración de CORS para orígenes permitidos
const allowedOrigins = [
  'http://localhost:5173', // admin dev
  'http://localhost:3000', // web dev
  'https://TU_DOMINIO_NETLIFY_ADMIN', // admin prod
  'https://TU_DOMINIO_NETLIFY_WEB',   // web prod
];
app.use(cors({
  origin: allowedOrigins,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.options('*', cors({
  origin: allowedOrigins,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

app.use(helmet());
app.use(morgan('dev'));
app.use(express.json());
app.use(sanitize); // Sanitiza todos los inputs

// Rate limiting global (100 requests por 15 minutos por IP)
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100, // Limite de 100 requests por IP
  standardHeaders: true,
  legacyHeaders: false,
  message: 'Demasiadas solicitudes desde esta IP, intentá más tarde.'
});
app.use(limiter);

app.use('/api', routes);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
app.use(errorHandler);

// TODO: Agregar CSRF en siguientes pasos

module.exports = app;
```