const { body, validationResult } = require('express-validator');

// Validador para asignar tarea de limpieza
const validateAssignCleaningTask = [
  body('roomId').isMongoId().withMessage('roomId inválido'),
  body('userId').isMongoId().withMessage('userId inválido'),
  body('scheduledFor').isISO8601().withMessage('Fecha programada inválida'),
  body('notes').optional().isString(),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  }
];

module.exports = {
  validateAssignCleaningTask
};
