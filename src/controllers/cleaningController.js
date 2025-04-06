const CleaningTask = require('../models/CleaningTask');

// Obtener todas las tareas de limpieza
exports.getAllTasks = async (req, res) => {
  try {
    const tasks = await CleaningTask.find()
      .populate('room')
      .populate('assignedTo', 'name email')
      .populate('verifiedBy', 'name email')
      .sort({ scheduledDate: 1 });
    
    res.json(tasks);
  } catch (error) {
    res.status(500).json({ message: "Error al obtener tareas de limpieza", error: error.message });
  }
};

// Crear nueva tarea de limpieza
exports.createTask = async (req, res) => {
  try {
    const task = new CleaningTask(req.body);
    await task.save();
    
    await task.populate('room');
    await task.populate('assignedTo', 'name email');
    
    res.status(201).json(task);
  } catch (error) {
    res.status(400).json({ message: "Error al crear tarea de limpieza", error: error.message });
  }
};

// Actualizar estado de tarea
exports.updateTaskStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, notes } = req.body;
    
    const task = await CleaningTask.findById(id);
    if (!task) {
      return res.status(404).json({ message: "Tarea no encontrada" });
    }
    
    task.status = status;
    if (notes) task.notes = notes;
    
    if (status === 'completada') {
      task.completedDate = new Date();
    }
    
    await task.save();
    await task.populate('room');
    await task.populate('assignedTo', 'name email');
    
    res.json(task);
  } catch (error) {
    res.status(400).json({ message: "Error al actualizar tarea", error: error.message });
  }
};

// Verificar tarea completada
exports.verifyTask = async (req, res) => {
  try {
    const { id } = req.params;
    const { verifiedBy } = req.body;
    
    const task = await CleaningTask.findById(id);
    if (!task) {
      return res.status(404).json({ message: "Tarea no encontrada" });
    }
    
    if (task.status !== 'completada') {
      return res.status(400).json({ message: "La tarea debe estar completada para ser verificada" });
    }
    
    task.status = 'verificada';
    task.verifiedBy = verifiedBy;
    
    await task.save();
    await task.populate('room');
    await task.populate('assignedTo', 'name email');
    await task.populate('verifiedBy', 'name email');
    
    res.json(task);
  } catch (error) {
    res.status(400).json({ message: "Error al verificar tarea", error: error.message });
  }
};

// Obtener tareas por habitación
exports.getTasksByRoom = async (req, res) => {
  try {
    const { roomId } = req.params;
    const tasks = await CleaningTask.find({ room: roomId })
      .populate('room')
      .populate('assignedTo', 'name email')
      .populate('verifiedBy', 'name email')
      .sort({ scheduledDate: -1 });
    
    res.json(tasks);
  } catch (error) {
    res.status(500).json({ message: "Error al obtener tareas", error: error.message });
  }
};

// Obtener tareas asignadas a un empleado
exports.getTasksByEmployee = async (req, res) => {
  try {
    const { employeeId } = req.params;
    const tasks = await CleaningTask.find({ 
      assignedTo: employeeId,
      status: { $in: ['pendiente', 'en_proceso'] }
    })
      .populate('room')
      .sort({ scheduledDate: 1 });
    
    res.json(tasks);
  } catch (error) {
    res.status(500).json({ message: "Error al obtener tareas", error: error.message });
  }
};
