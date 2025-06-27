// controllers/userController.js - Gestión de usuarios unificada
import User from '../models/User.js';
import bcrypt from 'bcrypt';
import { asyncHandler } from '../utils/asyncHandler.js';
import logger from '../utils/logger.js';

// Obtener todos los usuarios (solo admin)
export const getAllUsers = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 50;
  const skip = (page - 1) * limit;

  const users = await User.find({})
    .select('-password')
    .skip(skip)
    .limit(limit)
    .sort({ createdAt: -1 });

  const total = await User.countDocuments();

  res.status(200).json({
    success: true,
    data: users,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit)
    }
  });
});

// Obtener usuario por ID
export const getUserById = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id).select('-password');
  
  if (!user) {
    return res.status(404).json({
      success: false,
      message: 'Usuario no encontrado'
    });
  }

  res.status(200).json({
    success: true,
    data: user
  });
});

// Crear nuevo usuario (solo admin)
export const createUser = asyncHandler(async (req, res) => {
  const { email, password, name, role } = req.body;

  // Verificar si el usuario ya existe
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return res.status(400).json({
      success: false,
      message: 'El usuario ya existe'
    });
  }

  // Crear usuario (el password se hashea automáticamente en el modelo)
  const user = new User({
    email,
    password,
    name,
    role: role || 'receptionist'
  });

  await user.save();

  logger.info(`Usuario creado: ${email} con rol ${role || 'receptionist'} por admin: ${req.user.email}`);

  res.status(201).json({
    success: true,
    message: 'Usuario creado exitosamente',
    data: {
      id: user._id,
      email: user.email,
      name: user.name,
      role: user.role,
      createdAt: user.createdAt
    }
  });
});

// Actualizar usuario
export const updateUser = asyncHandler(async (req, res) => {
  const { name, email, role } = req.body;
  const userId = req.params.id;

  // No permitir que un usuario se cambie su propio rol (solo admin puede cambiar roles)
  if (req.user.id === userId && role && req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'No puedes cambiar tu propio rol'
    });
  }

  const updateData = { name, email };
  
  // Solo admin puede cambiar roles
  if (role && req.user.role === 'admin') {
    updateData.role = role;
  }

  const user = await User.findByIdAndUpdate(
    userId,
    updateData,
    { new: true, runValidators: true }
  ).select('-password');

  if (!user) {
    return res.status(404).json({
      success: false,
      message: 'Usuario no encontrado'
    });
  }

  logger.info(`Usuario actualizado: ${user.email} por: ${req.user.email}`);

  res.status(200).json({
    success: true,
    message: 'Usuario actualizado exitosamente',
    data: user
  });
});

// Eliminar usuario (solo admin)
export const deleteUser = asyncHandler(async (req, res) => {
  const userId = req.params.id;

  // No permitir que un admin se elimine a sí mismo
  if (req.user.id === userId) {
    return res.status(400).json({
      success: false,
      message: 'No puedes eliminar tu propia cuenta'
    });
  }

  const user = await User.findByIdAndDelete(userId);

  if (!user) {
    return res.status(404).json({
      success: false,
      message: 'Usuario no encontrado'
    });
  }

  logger.info(`Usuario eliminado: ${user.email} por admin: ${req.user.email}`);

  res.status(200).json({
    success: true,
    message: 'Usuario eliminado exitosamente'
  });
});

// Obtener perfil del usuario autenticado
export const getProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id).select('-password');
  
  if (!user) {
    return res.status(404).json({
      success: false,
      message: 'Usuario no encontrado'
    });
  }

  res.status(200).json({
    success: true,
    data: user
  });
});

// Actualizar perfil del usuario autenticado
export const updateProfile = asyncHandler(async (req, res) => {
  const { name, email } = req.body;
  const userId = req.user.id;

  // Verificar si el email ya existe en otro usuario
  if (email) {
    const existingUser = await User.findOne({ 
      email, 
      _id: { $ne: userId } 
    });
    
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'El email ya está en uso por otro usuario'
      });
    }
  }

  const user = await User.findByIdAndUpdate(
    userId,
    { name, email },
    { new: true, runValidators: true }
  ).select('-password');

  logger.info(`Perfil actualizado por usuario: ${user.email}`);

  res.status(200).json({
    success: true,
    message: 'Perfil actualizado exitosamente',
    data: user
  });
});

// Cambiar estado de usuario (activar/desactivar)
export const toggleUserStatus = asyncHandler(async (req, res) => {
  const userId = req.params.id;
  const { active } = req.body;

  const user = await User.findByIdAndUpdate(
    userId,
    { active: active !== false }, // Por defecto activo
    { new: true }
  ).select('-password');

  if (!user) {
    return res.status(404).json({
      success: false,
      message: 'Usuario no encontrado'
    });
  }

  logger.info(`Estado de usuario ${user.email} cambiado a: ${user.active ? 'activo' : 'inactivo'} por: ${req.user.email}`);

  res.status(200).json({
    success: true,
    message: `Usuario ${user.active ? 'activado' : 'desactivado'} exitosamente`,
    data: user
  });
});
