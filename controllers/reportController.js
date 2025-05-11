import express from 'express';
import Reservation from '../models/Reservation.js';
import Room from '../models/Room.js';
import ExcelJS from 'exceljs';
import Guest from '../models/Guest.js';

// Informes generales
const router = express.Router();

export const getGeneralReports = async (req, res) => {
  try {
    const totalRooms = await Room.countDocuments();
    const availableRooms = await Room.countDocuments({ status: 'disponible' });
    const occupiedRooms = await Room.countDocuments({ status: 'ocupado' });
    res.json({ totalRooms, availableRooms, occupiedRooms });
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener informes generales', error });
  }
};

// Informes de reservas (solo total, ya que no hay campo status)
export const getReservationReports = async (req, res) => {
  try {
    const totalReservations = await Reservation.countDocuments();
    const activeReservations = await Reservation.countDocuments({ status: 'reservado' });
    const completedReservations = await Reservation.countDocuments({ status: 'completado' });
    res.json({ totalReservations, activeReservations, completedReservations });
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener informes de reservas', error });
  }
};

// Informes de habitaciones por tipo
export const getRoomReports = async (req, res) => {
  try {
    const roomStats = await Room.aggregate([
      { $group: { _id: '$type', count: { $sum: 1 } } },
    ]);
    res.json(roomStats);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener informes de habitaciones', error });
  }
};

export const exportReservationsExcel = async (req, res) => {
  try {
    const reservations = await Reservation.find();
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Reservas');
    worksheet.columns = [
      { header: 'Nombre', key: 'firstName', width: 20 },
      { header: 'Apellido', key: 'lastName', width: 20 },
      { header: 'Email', key: 'email', width: 25 },
      { header: 'Teléfono', key: 'phone', width: 18 },
      { header: 'Check-In', key: 'checkIn', width: 15 },
      { header: 'Check-Out', key: 'checkOut', width: 15 },
      { header: 'Habitación', key: 'roomNumber', width: 12 },
      { header: 'Estado', key: 'status', width: 14 },
      { header: 'Notas', key: 'notes', width: 30 },
    ];
    reservations.forEach(r => {
      worksheet.addRow({
        firstName: r.firstName,
        lastName: r.lastName,
        email: r.email,
        phone: r.phone,
        checkIn: r.checkIn ? r.checkIn.toISOString().slice(0,10) : '',
        checkOut: r.checkOut ? r.checkOut.toISOString().slice(0,10) : '',
        roomNumber: r.roomNumber,
        status: r.status,
        notes: r.notes || '',
      });
    });
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename="reporte_reservas.xlsx"');
    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    res.status(500).json({ message: 'Error al exportar reservas', error });
  }
};

export const exportRoomsExcel = async (req, res) => {
  try {
    const rooms = await Room.find();
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Habitaciones');
    worksheet.columns = [
      { header: 'Número', key: 'number', width: 10 },
      { header: 'Tipo', key: 'type', width: 18 },
      { header: 'Precio', key: 'price', width: 12 },
      { header: 'Piso', key: 'floor', width: 8 },
      { header: 'Estado', key: 'status', width: 18 },
      { header: 'Capacidad', key: 'capacity', width: 10 },
      { header: 'Comodidades', key: 'amenities', width: 30 },
    ];
    rooms.forEach(r => {
      worksheet.addRow({
        number: r.number,
        type: r.type,
        price: r.price,
        floor: r.floor,
        status: r.status,
        capacity: r.capacity || '',
        amenities: Array.isArray(r.amenities) ? r.amenities.join(', ') : '',
      });
    });
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename="reporte_habitaciones.xlsx"');
    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    res.status(500).json({ message: 'Error al exportar habitaciones', error });
  }
};

export const exportGuestsExcel = async (req, res) => {
  try {
    const guests = await Guest.find();
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Huéspedes');
    worksheet.columns = [
      { header: 'Nombre', key: 'firstName', width: 18 },
      { header: 'Apellido', key: 'lastName', width: 18 },
      { header: 'Email', key: 'email', width: 25 },
      { header: 'Teléfono', key: 'phone', width: 18 },
      { header: 'Notas', key: 'notes', width: 30 },
      { header: 'Preferencias', key: 'preferences', width: 30 },
    ];
    guests.forEach(g => {
      worksheet.addRow({
        firstName: g.firstName,
        lastName: g.lastName,
        email: g.email,
        phone: g.phone,
        notes: g.notes || '',
        preferences: g.preferences || '',
      });
    });
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename="reporte_huespedes.xlsx"');
    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    res.status(500).json({ message: 'Error al exportar huéspedes', error });
  }
};

router.get('/reservations', getReservationReports);
router.get('/general', getGeneralReports);
router.get('/rooms', getRoomReports);
router.get('/export-reservations', exportReservationsExcel);
router.get('/export-rooms', exportRoomsExcel);
router.get('/export-guests', exportGuestsExcel);

export default router;