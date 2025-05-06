// middleware/validators.js
import Joi from 'joi';

export const validateReservation = (req, res, next) => {
  const schema = Joi.object({
    firstName: Joi.string().required(),
    lastName: Joi.string().required(),
    email: Joi.string().email().required(),
    phone: Joi.string().allow(''),
    checkIn: Joi.date().required(),
    checkOut: Joi.date().greater(Joi.ref('checkIn')).required(),
    roomNumber: Joi.number().required(),
    guests: Joi.number().min(1).required(),
    notes: Joi.string().allow(''),
  });

  const { error } = schema.validate(req.body);
  if (error) return res.status(400).json({ error: error.details[0].message });
  next();
};