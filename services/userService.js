const User = require('../models/User');
const bcrypt = require('bcryptjs');

exports.createUser = async (data) => {
  const hashedPassword = await bcrypt.hash(data.password, 10);
  const user = new User({ ...data, password: hashedPassword });
  return await user.save();
};

exports.getUserById = async (id) => {
  return await User.findById(id).select('-password');
};

exports.getAllUsers = async () => {
  return await User.find().select('-password');
};
