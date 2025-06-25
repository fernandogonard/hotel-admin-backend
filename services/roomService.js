import Room from '../models/Room.js';

export const getAllRooms = async () => {
  console.log('🔍 RoomService: Ejecutando Room.find()...');
  const startTime = Date.now();
  
  try {
    const rooms = await Room.find().maxTimeMS(2000); // 2 segundos timeout
    const duration = Date.now() - startTime;
    console.log(`✅ RoomService: Encontradas ${rooms.length} habitaciones en ${duration}ms`);
    return rooms;
  } catch (error) {
    const duration = Date.now() - startTime;
    console.log(`❌ RoomService: Error después de ${duration}ms:`, error.message);
    throw error;
  }
};

export const getRoomById = async (id) => {
  console.log(`🔍 RoomService: Buscando habitación ${id}...`);
  try {
    const room = await Room.findById(id).maxTimeMS(2000);
    console.log(`${room ? '✅' : '❌'} RoomService: Habitación ${id} ${room ? 'encontrada' : 'no encontrada'}`);
    return room;
  } catch (error) {
    console.log(`❌ RoomService: Error buscando habitación ${id}:`, error.message);
    throw error;
  }
};

export const createRoom = async (data) => {
  const room = new Room(data);
  return await room.save();
};

export const updateRoom = async (id, data) => {
  return await Room.findByIdAndUpdate(id, data, { new: true });
};

export const deleteRoom = async (id) => {
  return await Room.findByIdAndDelete(id);
};