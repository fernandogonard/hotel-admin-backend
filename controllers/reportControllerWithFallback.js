// controllers/reportControllerWithFallback.js
import Reservation from '../models/Reservation.js';
import Room from '../models/Room.js';

// Datos mock para reportes
const mockGeneralReport = {
  totalRooms: 20,
  occupiedRooms: 7,
  availableRooms: 10,
  maintenanceRooms: 3,
  occupancyRate: 35,
  totalReservations: 45,
  activeReservations: 7,
  revenueToday: 850,
  revenueMonth: 25500,
  averageStay: 2.5,
  checkInsToday: 3,
  checkOutsToday: 2,
  occupancyData: [
    { month: 'Enero', occupancy: 65 },
    { month: 'Febrero', occupancy: 70 },
    { month: 'Marzo', occupancy: 75 },
    { month: 'Abril', occupancy: 68 },
    { month: 'Mayo', occupancy: 80 },
    { month: 'Junio', occupancy: 85 }
  ],
  revenueData: [
    { month: 'Enero', revenue: 18500 },
    { month: 'Febrero', revenue: 22000 },
    { month: 'Marzo', revenue: 24500 },
    { month: 'Abril', revenue: 21000 },
    { month: 'Mayo', revenue: 28000 },
    { month: 'Junio', revenue: 25500 }
  ]
};

// Función helper para timeout
const withTimeout = (promise, timeoutMs = 3000) => {
  return Promise.race([
    promise,
    new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Database timeout')), timeoutMs)
    )
  ]);
};

export const getGeneralReport = async (req, res) => {
  console.log('🔍 [getGeneralReport] Iniciando función...');
  
  try {
    console.log('🔍 [getGeneralReport] Intentando generar reporte general...');
    
    // Intentar obtener datos reales con timeout
    const report = await withTimeout(generateRealReport(), 3000);
    console.log('✅ [getGeneralReport] Reporte general obtenido de la base de datos');
    res.status(200).json(report);
    
  } catch (error) {
    console.log('⚠️ [getGeneralReport] Base de datos no responde, usando reporte mock');
    console.log('⚠️ [getGeneralReport] Error:', error.message);
    console.log('📊 [getGeneralReport] Retornando datos de demostración para el dashboard');
    res.status(200).json(mockGeneralReport);
  }
};

export const getOccupancyReport = async (req, res) => {
  try {
    console.log('🔍 Intentando generar reporte de ocupación...');
    
    const report = await withTimeout(generateOccupancyReport(), 3000);
    console.log('✅ Reporte de ocupación obtenido de la base de datos');
    res.status(200).json(report);
    
  } catch (error) {
    console.log('⚠️ Base de datos no responde, usando reporte de ocupación mock');
    res.status(200).json({
      occupancyData: mockGeneralReport.occupancyData,
      averageOccupancy: 73.8,
      peakMonth: 'Junio',
      lowMonth: 'Enero'
    });
  }
};

export const getRevenueReport = async (req, res) => {
  try {
    console.log('🔍 Intentando generar reporte de ingresos...');
    
    const report = await withTimeout(generateRevenueReport(), 3000);
    console.log('✅ Reporte de ingresos obtenido de la base de datos');
    res.status(200).json(report);
    
  } catch (error) {
    console.log('⚠️ Base de datos no responde, usando reporte de ingresos mock');
    res.status(200).json({
      revenueData: mockGeneralReport.revenueData,
      totalRevenue: 139500,
      averageMonthly: 23250,
      peakMonth: 'Mayo',
      growth: '+12.5%'
    });
  }
};

// Funciones helper para generar reportes reales
const generateRealReport = async () => {
  const totalRooms = await Room.countDocuments();
  const occupiedRooms = await Room.countDocuments({ status: 'ocupado' });
  const availableRooms = await Room.countDocuments({ status: 'disponible' });
  const maintenanceRooms = await Room.countDocuments({ status: 'limpieza' });
  
  const totalReservations = await Reservation.countDocuments();
  const activeReservations = await Reservation.countDocuments({ 
    status: 'activa',
    checkIn: { $lte: new Date() },
    checkOut: { $gte: new Date() }
  });
  
  const today = new Date();
  const startOfDay = new Date(today.setHours(0, 0, 0, 0));
  const endOfDay = new Date(today.setHours(23, 59, 59, 999));
  
  const checkInsToday = await Reservation.countDocuments({
    checkIn: { $gte: startOfDay, $lte: endOfDay }
  });
  
  const checkOutsToday = await Reservation.countDocuments({
    checkOut: { $gte: startOfDay, $lte: endOfDay }
  });
  
  const occupancyRate = totalRooms > 0 ? Math.round((occupiedRooms / totalRooms) * 100) : 0;
  
  // Calcular datos de ocupación por mes (últimos 6 meses)
  const occupancyData = await calculateMonthlyOccupancy();
  
  return {
    totalRooms,
    occupiedRooms,
    availableRooms,
    maintenanceRooms,
    occupancyRate,
    totalReservations,
    activeReservations,
    revenueToday: 0, // Implementar cuando haya modelo de pagos
    revenueMonth: 0,
    averageStay: 2.5, // Calcular basado en reservas
    checkInsToday,
    checkOutsToday,
    occupancyData
  };
};

const generateOccupancyReport = async () => {
  const occupancyData = await calculateMonthlyOccupancy();
  const averageOccupancy = occupancyData.reduce((sum, month) => sum + month.occupancy, 0) / occupancyData.length;
  const peakMonth = occupancyData.reduce((prev, current) => (prev.occupancy > current.occupancy) ? prev : current);
  const lowMonth = occupancyData.reduce((prev, current) => (prev.occupancy < current.occupancy) ? prev : current);
  
  return {
    occupancyData,
    averageOccupancy: Math.round(averageOccupancy * 10) / 10,
    peakMonth: peakMonth.month,
    lowMonth: lowMonth.month
  };
};

const generateRevenueReport = async () => {
  // Implementar cuando haya modelo de pagos
  return mockGeneralReport.revenueData;
};

const calculateMonthlyOccupancy = async () => {
  // Implementar cálculo real basado en reservas
  // Por ahora retorna datos mock
  return mockGeneralReport.occupancyData;
};
