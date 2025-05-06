// filepath: middlewares/validators.js
import Joi from 'joi';

export const validateReservation = (req, res, next) => {
  const schema = Joi.object({
    firstName: Joi.string().required(),
    lastName: Joi.string().required(),
    email: Joi.string().email().required(),
    phone: Joi.string().required(),
    checkIn: Joi.date().required(),
    checkOut: Joi.date().required(),
    roomNumber: Joi.string().required(),
    guests: Joi.number().min(1).required(),
  });

  const { error } = schema.validate(req.body);
  if (error) return res.status(400).json({ error: error.details[0].message });
  next();
};