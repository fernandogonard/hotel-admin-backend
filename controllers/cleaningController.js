const CleaningTask = require('../models/CleaningTask');
const User = require('../models/User');
const Room = require('../models/Room');

// Asignar tarea de limpieza a un usuario para una habitación
exports.assignCleaningTask = async (req, res) => {
  try {
    const { roomId, userId, scheduledFor, notes } = req.body;
    // Validar existencia de usuario y habitación
    const user = await User.findById(userId);
    if (!user || user.role !== 'cleaning') {
      return res.status(400).json({ message: 'Usuario de limpieza no válido' });
    }
    const room = await Room.findById(roomId);
    if (!room) {
      return res.status(400).json({ message: 'Habitación no encontrada' });
    }
    // Crear tarea
    const task = await CleaningTask.create({
      room: roomId,
      assignedTo: userId,
      scheduledFor,
      notes
    });
    res.status(201).json({ message: 'Tarea de limpieza asignada', task });
  } catch (error) {
    res.status(500).json({ message: 'Error al asignar tarea', error: error.message });
  }
};

// Listar tareas de limpieza (opcional: por usuario, por estado)
exports.getCleaningTasks = async (req, res) => {
  try {
    const { assignedTo, status } = req.query;
    const filter = {};
    if (assignedTo) filter.assignedTo = assignedTo;
    if (status) filter.status = status;
    const tasks = await CleaningTask.find(filter).populate('room assignedTo');
    res.json({ tasks });
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener tareas', error: error.message });
  }
};

// Actualizar estado de tarea (completar, en progreso, etc.)
exports.updateCleaningTaskStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, completedAt } = req.body;
    const task = await CleaningTask.findByIdAndUpdate(
      id,
      { status, completedAt: status === 'completada' ? new Date() : undefined },
      { new: true }
    );
    if (!task) return res.status(404).json({ message: 'Tarea no encontrada' });
    res.json({ message: 'Tarea actualizada', task });
  } catch (error) {
    res.status(500).json({ message: 'Error al actualizar tarea', error: error.message });
  }
};
