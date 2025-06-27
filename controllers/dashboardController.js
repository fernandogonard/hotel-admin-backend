// controllers/dashboardController.js
/**
 * Controlador del Dashboard - Métricas y estadísticas del hotel
 * Proporciona endpoints para obtener datos consolidados del sistema
 */
import {
  getGeneralStats,
  getOccupancyByRoomType,
  getRevenueStats,
  getRecentActivity,
  getOccupancyTrend,
  getDashboardMetrics
} from '../services/dashboardService.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import logger from '../utils/logger.js';

/**
 * @desc    Obtener métricas completas del dashboard
 * @route   GET /api/dashboard/metrics
 * @access  Private (Admin, Receptionist)
 */
export const getDashboard = asyncHandler(async (req, res) => {
  try {
    const metrics = await getDashboardMetrics();
    
    logger.info(`Dashboard metrics obtenidas por: ${req.user.email}`);
    
    res.status(200).json({
      success: true,
      message: 'Métricas del dashboard obtenidas exitosamente',
      data: metrics
    });
  } catch (error) {
    logger.error('Error obteniendo métricas del dashboard:', error);
    res.status(500).json({
      success: false,
      message: 'Error obteniendo métricas del dashboard',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

/**
 * @desc    Obtener estadísticas generales
 * @route   GET /api/dashboard/stats
 * @access  Private (Admin, Receptionist)
 */
export const getStats = asyncHandler(async (req, res) => {
  try {
    const stats = await getGeneralStats();
    
    res.status(200).json({
      success: true,
      message: 'Estadísticas generales obtenidas exitosamente',
      data: stats
    });
  } catch (error) {
    logger.error('Error obteniendo estadísticas generales:', error);
    res.status(500).json({
      success: false,
      message: 'Error obteniendo estadísticas generales',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

/**
 * @desc    Obtener estadísticas de ocupación por tipo de habitación
 * @route   GET /api/dashboard/occupancy
 * @access  Private (Admin, Receptionist)
 */
export const getOccupancy = asyncHandler(async (req, res) => {
  try {
    const occupancy = await getOccupancyByRoomType();
    
    res.status(200).json({
      success: true,
      message: 'Estadísticas de ocupación obtenidas exitosamente',
      data: occupancy
    });
  } catch (error) {
    logger.error('Error obteniendo estadísticas de ocupación:', error);
    res.status(500).json({
      success: false,
      message: 'Error obteniendo estadísticas de ocupación',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

/**
 * @desc    Obtener estadísticas de ingresos
 * @route   GET /api/dashboard/revenue
 * @access  Private (Admin)
 */
export const getRevenue = asyncHandler(async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    let start, end;
    if (startDate) start = new Date(startDate);
    if (endDate) end = new Date(endDate);
    
    const revenue = await getRevenueStats(start, end);
    
    logger.info(`Estadísticas de ingresos obtenidas por admin: ${req.user.email}`);
    
    res.status(200).json({
      success: true,
      message: 'Estadísticas de ingresos obtenidas exitosamente',
      data: revenue
    });
  } catch (error) {
    logger.error('Error obteniendo estadísticas de ingresos:', error);
    res.status(500).json({
      success: false,
      message: 'Error obteniendo estadísticas de ingresos',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

/**
 * @desc    Obtener actividad reciente
 * @route   GET /api/dashboard/activity
 * @access  Private (Admin, Receptionist)
 */
export const getActivity = asyncHandler(async (req, res) => {
  try {
    const { limit = 10 } = req.query;
    const activity = await getRecentActivity(Number(limit));
    
    res.status(200).json({
      success: true,
      message: 'Actividad reciente obtenida exitosamente',
      data: activity
    });
  } catch (error) {
    logger.error('Error obteniendo actividad reciente:', error);
    res.status(500).json({
      success: false,
      message: 'Error obteniendo actividad reciente',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

/**
 * @desc    Obtener tendencia de ocupación
 * @route   GET /api/dashboard/trend
 * @access  Private (Admin, Receptionist)
 */
export const getTrend = asyncHandler(async (req, res) => {
  try {
    const { days = 30 } = req.query;
    const trend = await getOccupancyTrend(Number(days));
    
    res.status(200).json({
      success: true,
      message: 'Tendencia de ocupación obtenida exitosamente',
      data: trend
    });
  } catch (error) {
    logger.error('Error obteniendo tendencia de ocupación:', error);
    res.status(500).json({
      success: false,
      message: 'Error obteniendo tendencia de ocupación',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

/**
 * @desc    Obtener resumen ejecutivo (métricas clave)
 * @route   GET /api/dashboard/summary
 * @access  Private (Admin, Receptionist)
 */
export const getSummary = asyncHandler(async (req, res) => {
  try {
    const [generalStats, recentActivity] = await Promise.all([
      getGeneralStats(),
      getRecentActivity(5)
    ]);
    
    // Calcular métricas adicionales
    const totalCapacity = generalStats.totalRooms;
    const availabilityRate = totalCapacity > 0 
      ? Math.round((generalStats.availableRooms / totalCapacity) * 100) 
      : 0;
    
    const summary = {
      occupancyRate: generalStats.occupancyRate,
      availabilityRate,
      totalRooms: totalCapacity,
      activeReservations: generalStats.activeReservations,
      recentActivity: recentActivity.slice(0, 3), // Solo las 3 más recientes
      status: {
        available: generalStats.availableRooms,
        occupied: generalStats.occupiedRooms,
        cleaning: generalStats.cleaningRooms,
        maintenance: generalStats.maintenanceRooms
      }
    };
    
    res.status(200).json({
      success: true,
      message: 'Resumen ejecutivo obtenido exitosamente',
      data: summary
    });
  } catch (error) {
    logger.error('Error obteniendo resumen ejecutivo:', error);
    res.status(500).json({
      success: false,
      message: 'Error obteniendo resumen ejecutivo',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});
