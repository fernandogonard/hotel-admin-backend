import mongoose from 'mongoose';

const guestSchema = new mongoose.Schema({
  firstName: { type: String, required: true },
  lastName:  { type: String, required: true },
  email:     { type: String, required: true, unique: true },
  phone:     { type: String },
  notes:     { type: String },
  preferences: { type: String },
}, { timestamps: true });

const Guest = mongoose.model('Guest', guestSchema);
export default Guest;
