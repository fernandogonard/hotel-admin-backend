// utils/logger.js
import fs from 'fs';
import path from 'path';

const logsDir = path.join(process.cwd(), 'logs');

// Crear directorio de logs si no existe
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

class Logger {
  constructor() {
    this.logFile = path.join(logsDir, `app-${new Date().toISOString().split('T')[0]}.log`);
    this.errorFile = path.join(logsDir, `error-${new Date().toISOString().split('T')[0]}.log`);
    this.securityFile = path.join(logsDir, `security-${new Date().toISOString().split('T')[0]}.log`);
  }

  formatMessage(level, message, meta = {}) {
    return JSON.stringify({
      timestamp: new Date().toISOString(),
      level,
      message,
      ...meta
    }) + '\n';
  }

  writeToFile(filename, message) {
    try {
      fs.appendFileSync(filename, message);
    } catch (error) {
      console.error('Error escribiendo log:', error);
    }
  }

  info(message, meta = {}) {
    const formatted = this.formatMessage('INFO', message, meta);
    console.log(formatted.trim());
    this.writeToFile(this.logFile, formatted);
  }

  error(message, meta = {}) {
    const formatted = this.formatMessage('ERROR', message, meta);
    console.error(formatted.trim());
    this.writeToFile(this.errorFile, formatted);
  }

  warn(message, meta = {}) {
    const formatted = this.formatMessage('WARN', message, meta);
    console.warn(formatted.trim());
    this.writeToFile(this.logFile, formatted);
  }

  security(message, meta = {}) {
    const formatted = this.formatMessage('SECURITY', message, meta);
    console.log(`🔒 ${formatted.trim()}`);
    this.writeToFile(this.securityFile, formatted);
  }

  // Middleware para Express
  middleware() {
    return (req, res, next) => {
      const start = Date.now();
      
      res.on('finish', () => {
        const duration = Date.now() - start;
        const meta = {
          method: req.method,
          path: req.path,
          statusCode: res.statusCode,
          duration: `${duration}ms`,
          ip: req.ip || req.connection.remoteAddress,
          userAgent: req.get('User-Agent')
        };

        if (res.statusCode >= 400) {
          this.error(`${req.method} ${req.path} - ${res.statusCode}`, meta);
        } else {
          this.info(`${req.method} ${req.path} - ${res.statusCode}`, meta);
        }
      });

      next();
    };
  }
}

export default new Logger();
