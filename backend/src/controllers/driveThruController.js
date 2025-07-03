const { Hub, User, Order, DriveThruSlot, DriveThruConfiguration } = require('../models');
const logger = require('../utils/logger');
const { Op } = require('sequelize');
const moment = require('moment');

class DriveThruController {
  
  // Enable drive-thru service for a hub
  static async enableDriveThru(req, res) {
    try {
      const { hub_id } = req.body;
      const {
        operating_hours,
        slot_duration = 15,
        concurrent_slots = 2,
        max_advance_booking_days = 7,
        buffer_time = 5,
        auto_confirm_orders = true,
        require_vehicle_info = false
      } = req.body;

      // Check if user owns the hub or is admin
      const hub = await Hub.findByPk(hub_id);
      if (!hub) {
        return res.status(404).json({
          success: false,
          message: 'Hub not found'
        });
      }

      if (req.user.role !== 'admin' && req.user.user_id !== hub.owner_id) {
        return res.status(403).json({
          success: false,
          message: 'Access denied. You can only configure your own hubs.'
        });
      }

      // Create or update drive-thru configuration
      const [config, created] = await DriveThruConfiguration.findOrCreate({
        where: { hub_id },
        defaults: {
          hub_id,
          is_enabled: true,
          operating_hours: operating_hours || {
            monday: { open: '09:00', close: '18:00', enabled: true },
            tuesday: { open: '09:00', close: '18:00', enabled: true },
            wednesday: { open: '09:00', close: '18:00', enabled: true },
            thursday: { open: '09:00', close: '18:00', enabled: true },
            friday: { open: '09:00', close: '18:00', enabled: true },
            saturday: { open: '10:00', close: '16:00', enabled: true },
            sunday: { open: '10:00', close: '16:00', enabled: false }
          },
          slot_duration,
          concurrent_slots,
          max_advance_booking_days,
          buffer_time,
          auto_confirm_orders,
          require_vehicle_info
        }
      });

      if (!created) {
        // Update existing configuration
        await config.update({
          is_enabled: true,
          operating_hours: operating_hours || config.operating_hours,
          slot_duration,
          concurrent_slots,
          max_advance_booking_days,
          buffer_time,
          auto_confirm_orders,
          require_vehicle_info
        });
      }

      logger.info(`Drive-thru enabled for hub ${hub_id} by ${req.user.email}`);

      res.status(201).json({
        success: true,
        message: 'Drive-thru service enabled successfully',
        data: { config }
      });

    } catch (error) {
      logger.error('Enable drive-thru error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to enable drive-thru service',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  // Update drive-thru operating hours
  static async updateOperatingHours(req, res) {
    try {
      const { hub_id } = req.params;
      const { operating_hours } = req.body;

      // Check if user owns the hub or is admin
      const hub = await Hub.findByPk(hub_id);
      if (!hub) {
        return res.status(404).json({
          success: false,
          message: 'Hub not found'
        });
      }

      if (req.user.role !== 'admin' && req.user.user_id !== hub.owner_id) {
        return res.status(403).json({
          success: false,
          message: 'Access denied. You can only configure your own hubs.'
        });
      }

      const config = await DriveThruConfiguration.findOne({ where: { hub_id } });
      if (!config) {
        return res.status(404).json({
          success: false,
          message: 'Drive-thru not configured for this hub'
        });
      }

      await config.update({ operating_hours });

      logger.info(`Drive-thru hours updated for hub ${hub_id} by ${req.user.email}`);

      res.json({
        success: true,
        message: 'Operating hours updated successfully',
        data: { config }
      });

    } catch (error) {
      logger.error('Update operating hours error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update operating hours',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  // Get available time slots for drive-thru pickup
  static async getAvailableSlots(req, res) {
    try {
      const { hub_id } = req.params;
      const { date, days = 7 } = req.query;

      const hub = await Hub.findByPk(hub_id);
      if (!hub) {
        return res.status(404).json({
          success: false,
          message: 'Hub not found'
        });
      }

      const config = await DriveThruConfiguration.findOne({ 
        where: { hub_id, is_enabled: true } 
      });
      
      if (!config) {
        return res.status(404).json({
          success: false,
          message: 'Drive-thru service not available for this hub'
        });
      }

      const startDate = date ? moment(date) : moment();
      const endDate = moment(startDate).add(Math.min(days, config.max_advance_booking_days), 'days');
      
      const availableSlots = [];
      let currentDate = moment(startDate);

      while (currentDate.isSameOrBefore(endDate)) {
        const dayName = currentDate.format('dddd').toLowerCase();
        const dayConfig = config.operating_hours[dayName];

        if (dayConfig && dayConfig.enabled) {
          const daySlots = await this.generateDaySlotsAvailability(
            hub_id, 
            currentDate.format('YYYY-MM-DD'), 
            dayConfig,
            config
          );
          
          if (daySlots.length > 0) {
            availableSlots.push({
              date: currentDate.format('YYYY-MM-DD'),
              day: currentDate.format('dddd'),
              slots: daySlots
            });
          }
        }

        currentDate.add(1, 'day');
      }

      res.json({
        success: true,
        message: 'Available slots retrieved successfully',
        data: {
          hub: {
            hub_id: hub.hub_id,
            name: hub.name,
            address: hub.address
          },
          available_slots: availableSlots,
          configuration: {
            slot_duration: config.slot_duration,
            concurrent_slots: config.concurrent_slots,
            require_vehicle_info: config.require_vehicle_info
          }
        }
      });

    } catch (error) {
      logger.error('Get available slots error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve available slots',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  // Helper method to generate day slots availability
  static async generateDaySlotsAvailability(hub_id, date, dayConfig, config) {
    const slots = [];
    const openTime = moment(`${date} ${dayConfig.open}`);
    const closeTime = moment(`${date} ${dayConfig.close}`);
    const slotDuration = config.slot_duration;
    const bufferTime = config.buffer_time;
    const totalSlotTime = slotDuration + bufferTime;

    // Get existing bookings for this date
    const existingSlots = await DriveThruSlot.findAll({
      where: {
        hub_id,
        slot_date: date,
        status: {
          [Op.not]: ['cancelled', 'no_show']
        }
      }
    });

    let currentSlot = moment(openTime);
    
    while (currentSlot.clone().add(slotDuration, 'minutes').isSameOrBefore(closeTime)) {
      const slotTime = currentSlot.format('HH:mm');
      
      // Count concurrent bookings at this time
      const concurrentBookings = existingSlots.filter(slot => 
        slot.slot_time === slotTime
      ).length;

      const available = concurrentBookings < config.concurrent_slots;
      
      // Don't show past time slots for today
      const now = moment();
      const slotDateTime = moment(`${date} ${slotTime}`);
      const isPastSlot = slotDateTime.isBefore(now);

      if (!isPastSlot) {
        slots.push({
          time: slotTime,
          available,
          concurrent_bookings: concurrentBookings,
          max_concurrent: config.concurrent_slots
        });
      }

      currentSlot.add(totalSlotTime, 'minutes');
    }

    return slots;
  }

  // Book a drive-thru pickup slot
  static async bookDriveThruSlot(req, res) {
    try {
      const {
        hub_id,
        order_id,
        slot_date,
        slot_time,
        vehicle_info,
        special_instructions
      } = req.body;

      // Validate hub and drive-thru availability
      const hub = await Hub.findByPk(hub_id);
      if (!hub) {
        return res.status(404).json({
          success: false,
          message: 'Hub not found'
        });
      }

      const config = await DriveThruConfiguration.findOne({ 
        where: { hub_id, is_enabled: true } 
      });
      
      if (!config) {
        return res.status(400).json({
          success: false,
          message: 'Drive-thru service not available for this hub'
        });
      }

      // Validate order belongs to customer
      const order = await Order.findOne({
        where: {
          order_id,
          customer_id: req.user.user_id,
          status: {
            [Op.in]: ['confirmed', 'ready_for_pickup']
          }
        }
      });

      if (!order) {
        return res.status(404).json({
          success: false,
          message: 'Order not found or not eligible for drive-thru pickup'
        });
      }

      // Check if order already has a drive-thru slot
      const existingSlot = await DriveThruSlot.findOne({ where: { order_id } });
      if (existingSlot) {
        return res.status(400).json({
          success: false,
          message: 'Order already has a drive-thru booking'
        });
      }

      // Validate slot availability
      const slotDateTime = moment(`${slot_date} ${slot_time}`);
      if (slotDateTime.isBefore(moment())) {
        return res.status(400).json({
          success: false,
          message: 'Cannot book past time slots'
        });
      }

      // Check concurrent slot availability
      const concurrentBookings = await DriveThruSlot.count({
        where: {
          hub_id,
          slot_date,
          slot_time,
          status: {
            [Op.not]: ['cancelled', 'no_show']
          }
        }
      });

      if (concurrentBookings >= config.concurrent_slots) {
        return res.status(400).json({
          success: false,
          message: 'Time slot is fully booked'
        });
      }

      // Validate vehicle info if required
      if (config.require_vehicle_info && (!vehicle_info || !vehicle_info.make || !vehicle_info.model)) {
        return res.status(400).json({
          success: false,
          message: 'Vehicle information is required for drive-thru booking'
        });
      }

      // Create drive-thru slot booking
      const driveThruSlot = await DriveThruSlot.create({
        hub_id,
        customer_id: req.user.user_id,
        order_id,
        slot_date,
        slot_time,
        estimated_duration: config.slot_duration,
        vehicle_info,
        special_instructions,
        queue_position: concurrentBookings + 1
      });

      logger.info(`Drive-thru slot booked: ${driveThruSlot.slot_id} by ${req.user.email}`);

      // Emit real-time WebSocket event for slot booking
      if (req.app && req.app.get('socketManager')) {
        const socketManager = req.app.get('socketManager');
        if (socketManager.io) {
          // Notify hub owner of new booking
          socketManager.io.to(`hubowner:${hub.owner_id}`).emit('drive_thru_slot_booked', {
            type: 'drive_thru_slot_booked',
            slot_id: driveThruSlot.slot_id,
            hub_id,
            customer_name: `${req.user.first_name} ${req.user.last_name}`,
            slot_date: driveThruSlot.slot_date,
            slot_time: driveThruSlot.slot_time,
            queue_position: driveThruSlot.queue_position,
            timestamp: new Date().toISOString()
          });

          // Emit queue update to anyone watching this hub
          socketManager.io.emit('drive_thru_queue_updated', {
            type: 'drive_thru_queue_updated',
            hub_id,
            action: 'slot_booked',
            timestamp: new Date().toISOString()
          });
        }
      }

      res.status(201).json({
        success: true,
        message: 'Drive-thru pickup slot booked successfully',
        data: {
          booking: {
            slot_id: driveThruSlot.slot_id,
            hub_name: hub.name,
            slot_date: driveThruSlot.slot_date,
            slot_time: driveThruSlot.slot_time,
            estimated_duration: driveThruSlot.estimated_duration,
            queue_position: driveThruSlot.queue_position,
            status: driveThruSlot.status
          }
        }
      });

    } catch (error) {
      logger.error('Book drive-thru slot error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to book drive-thru slot',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  // Notify customer that order is ready for pickup
  static async notifyCustomerReady(req, res) {
    try {
      const { slot_id } = req.params;

      const driveThruSlot = await DriveThruSlot.findOne({
        where: { slot_id },
        include: [
          {
            model: Hub,
            as: 'hub'
          },
          {
            model: User,
            as: 'customer'
          },
          {
            model: Order,
            as: 'order'
          }
        ]
      });

      if (!driveThruSlot) {
        return res.status(404).json({
          success: false,
          message: 'Drive-thru booking not found'
        });
      }

      // Check if user owns the hub or is admin
      if (req.user.role !== 'admin' && req.user.user_id !== driveThruSlot.hub.owner_id) {
        return res.status(403).json({
          success: false,
          message: 'Access denied. You can only manage your own hub bookings.'
        });
      }

      if (driveThruSlot.status !== 'scheduled') {
        return res.status(400).json({
          success: false,
          message: 'Booking is not in scheduled status'
        });
      }

      // Update slot status
      await driveThruSlot.update({
        status: 'customer_notified'
      });

      // Update order status if needed
      if (driveThruSlot.order.status !== 'ready_for_pickup') {
        await driveThruSlot.order.update({
          status: 'ready_for_pickup'
        });
      }

      // Emit WebSocket event to notify customer
      SocketManager.emitToUser(driveThruSlot.customer_id, 'driveThruOrderReady', {
        slot_id: driveThruSlot.slot_id,
        hub_name: driveThruSlot.hub.name,
        slot_time: driveThruSlot.slot_time,
        order_id: driveThruSlot.order_id
      });

      logger.info(`Customer notified for drive-thru slot: ${slot_id} by ${req.user.email}`);

      // Emit real-time WebSocket event for customer notification
      if (req.app && req.app.get('socketManager')) {
        const socketManager = req.app.get('socketManager');
        if (socketManager.io) {
          // Notify customer directly
          socketManager.io.to(`customer:${driveThruSlot.user_id}`).emit('drive_thru_customer_notified', {
            type: 'drive_thru_customer_notified',
            slot_id: driveThruSlot.slot_id,
            hub_name: driveThruSlot.hub.name,
            slot_time: driveThruSlot.slot_time,
            order_id: driveThruSlot.order_id,
            message: 'Your order is ready for pickup!',
            timestamp: new Date().toISOString()
          });

          // Update queue status for real-time viewers
          socketManager.io.emit('drive_thru_queue_updated', {
            type: 'drive_thru_queue_updated',
            hub_id: driveThruSlot.hub_id,
            action: 'customer_notified',
            slot_id: driveThruSlot.slot_id,
            timestamp: new Date().toISOString()
          });
        }
      }

      res.json({
        success: true,
        message: 'Customer notified successfully',
        data: {
          slot_id: driveThruSlot.slot_id,
          status: driveThruSlot.status,
          customer_email: driveThruSlot.customer.email
        }
      });

    } catch (error) {
      logger.error('Notify customer ready error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to notify customer',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  // Confirm pickup completion
  static async confirmPickupCompletion(req, res) {
    try {
      const { slot_id } = req.params;
      const { customer_rating, hub_rating, feedback } = req.body;

      const driveThruSlot = await DriveThruSlot.findOne({
        where: { slot_id },
        include: [
          {
            model: Hub,
            as: 'hub'
          },
          {
            model: Order,
            as: 'order'
          }
        ]
      });

      if (!driveThruSlot) {
        return res.status(404).json({
          success: false,
          message: 'Drive-thru booking not found'
        });
      }

      // Check if user owns the hub or is admin
      if (req.user.role !== 'admin' && req.user.user_id !== driveThruSlot.hub.owner_id) {
        return res.status(403).json({
          success: false,
          message: 'Access denied. You can only manage your own hub bookings.'
        });
      }

      if (!['customer_notified', 'customer_arrived', 'in_progress'].includes(driveThruSlot.status)) {
        return res.status(400).json({
          success: false,
          message: 'Booking is not ready for completion'
        });
      }

      // Update slot status
      await driveThruSlot.update({
        status: 'completed',
        actual_end_time: new Date(),
        hub_rating,
        feedback
      });

      // Update order status
      await driveThruSlot.order.update({
        status: 'picked_up'
      });

      // Emit WebSocket event to update pickup status
      SocketManager.emitToUser(driveThruSlot.customer_id, 'driveThruPickupStatusUpdated', {
        slot_id: driveThruSlot.slot_id,
        status: 'completed'
      });

      logger.info(`Drive-thru pickup completed: ${slot_id} by ${req.user.email}`);

      // Emit real-time WebSocket event for pickup completion
      if (req.app && req.app.get('socketManager')) {
        const socketManager = req.app.get('socketManager');
        if (socketManager.io) {
          // Notify customer of completion
          socketManager.io.to(`customer:${driveThruSlot.user_id}`).emit('drive_thru_pickup_completed', {
            type: 'drive_thru_pickup_completed',
            slot_id: driveThruSlot.slot_id,
            hub_name: driveThruSlot.hub.name,
            order_id: driveThruSlot.order_id,
            completed_at: driveThruSlot.actual_end_time,
            message: 'Pickup completed successfully!',
            timestamp: new Date().toISOString()
          });

          // Update queue status
          socketManager.io.emit('drive_thru_queue_updated', {
            type: 'drive_thru_queue_updated',
            hub_id: driveThruSlot.hub_id,
            action: 'pickup_completed',
            slot_id: driveThruSlot.slot_id,
            timestamp: new Date().toISOString()
          });

          // Notify hub owner
          socketManager.io.to(`hubowner:${driveThruSlot.hub.owner_id}`).emit('drive_thru_pickup_completed', {
            type: 'drive_thru_pickup_completed',
            slot_id: driveThruSlot.slot_id,
            customer_name: `${driveThruSlot.customer.first_name} ${driveThruSlot.customer.last_name}`,
            order_id: driveThruSlot.order_id,
            timestamp: new Date().toISOString()
          });
        }
      }

      res.json({
        success: true,
        message: 'Pickup completed successfully',
        data: {
          slot_id: driveThruSlot.slot_id,
          status: driveThruSlot.status,
          completed_at: driveThruSlot.actual_end_time
        }
      });

    } catch (error) {
      logger.error('Confirm pickup completion error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to confirm pickup completion',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  // Get real-time pickup queue status
  static async getPickupQueueStatus(req, res) {
    try {
      const { hub_id } = req.params;
      const { date } = req.query;

      const hub = await Hub.findByPk(hub_id);
      if (!hub) {
        return res.status(404).json({
          success: false,
          message: 'Hub not found'
        });
      }

      const queryDate = date || moment().format('YYYY-MM-DD');

      const queueSlots = await DriveThruSlot.findAll({
        where: {
          hub_id,
          slot_date: queryDate,
          status: {
            [Op.in]: ['scheduled', 'customer_notified', 'customer_arrived', 'in_progress']
          }
        },
        include: [
          {
            model: User,
            as: 'customer',
            attributes: ['first_name', 'last_name']
          },
          {
            model: Order,
            as: 'order',
            attributes: ['order_id', 'status', 'total_amount']
          }
        ],
        order: [['slot_time', 'ASC'], ['queue_position', 'ASC']]
      });

      const queueStatus = queueSlots.map(slot => ({
        slot_id: slot.slot_id,
        slot_time: slot.slot_time,
        queue_position: slot.queue_position,
        status: slot.status,
        customer_name: `${slot.customer.first_name} ${slot.customer.last_name}`,
        order_total: slot.order.total_amount,
        estimated_duration: slot.estimated_duration,
        special_instructions: slot.special_instructions
      }));

      res.json({
        success: true,
        message: 'Queue status retrieved successfully',
        data: {
          hub: {
            hub_id: hub.hub_id,
            name: hub.name
          },
          date: queryDate,
          queue: queueStatus,
          stats: {
            total_bookings: queueSlots.length,
            waiting: queueSlots.filter(s => s.status === 'scheduled').length,
            notified: queueSlots.filter(s => s.status === 'customer_notified').length,
            arrived: queueSlots.filter(s => s.status === 'customer_arrived').length,
            in_progress: queueSlots.filter(s => s.status === 'in_progress').length
          }
        }
      });

    } catch (error) {
      logger.error('Get pickup queue status error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve queue status',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  // Cancel drive-thru pickup appointment
  static async cancelPickupAppointment(req, res) {
    try {
      const { slot_id } = req.params;
      const { reason } = req.body;

      const driveThruSlot = await DriveThruSlot.findOne({
        where: { slot_id },
        include: [
          {
            model: Order,
            as: 'order'
          }
        ]
      });

      if (!driveThruSlot) {
        return res.status(404).json({
          success: false,
          message: 'Drive-thru booking not found'
        });
      }

      // Check if user owns the booking
      if (req.user.user_id !== driveThruSlot.customer_id) {
        return res.status(403).json({
          success: false,
          message: 'Access denied. You can only cancel your own bookings.'
        });
      }

      if (['completed', 'cancelled', 'no_show'].includes(driveThruSlot.status)) {
        return res.status(400).json({
          success: false,
          message: 'Booking cannot be cancelled in current status'
        });
      }

      // Check if cancellation is allowed (e.g., at least 30 minutes before slot time)
      const slotDateTime = moment(`${driveThruSlot.slot_date} ${driveThruSlot.slot_time}`);
      const now = moment();
      const timeDiff = slotDateTime.diff(now, 'minutes');

      if (timeDiff < 30) {
        return res.status(400).json({
          success: false,
          message: 'Bookings can only be cancelled at least 30 minutes in advance'
        });
      }

      // Update slot status
      await driveThruSlot.update({
        status: 'cancelled',
        feedback: reason
      });

      logger.info(`Drive-thru booking cancelled: ${slot_id} by ${req.user.email}`);

      // Emit real-time WebSocket event for cancellation
      if (req.app && req.app.get('socketManager')) {
        const socketManager = req.app.get('socketManager');
        if (socketManager.io) {
          // Notify hub owner of cancellation
          socketManager.io.to(`hubowner:${driveThruSlot.hub.owner_id}`).emit('drive_thru_slot_cancelled', {
            type: 'drive_thru_slot_cancelled',
            slot_id: driveThruSlot.slot_id,
            hub_id: driveThruSlot.hub_id,
            customer_name: `${req.user.first_name} ${req.user.last_name}`,
            slot_date: driveThruSlot.slot_date,
            slot_time: driveThruSlot.slot_time,
            reason,
            timestamp: new Date().toISOString()
          });

          // Update queue status
          socketManager.io.emit('drive_thru_queue_updated', {
            type: 'drive_thru_queue_updated',
            hub_id: driveThruSlot.hub_id,
            action: 'slot_cancelled',
            slot_id: driveThruSlot.slot_id,
            timestamp: new Date().toISOString()
          });
        }
      }

      res.json({
        success: true,
        message: 'Drive-thru booking cancelled successfully',
        data: {
          slot_id: driveThruSlot.slot_id,
          status: driveThruSlot.status
        }
      });

    } catch (error) {
      logger.error('Cancel pickup appointment error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to cancel appointment',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  // Get drive-thru pickup history
  static async getPickupHistory(req, res) {
    try {
      const {
        page = 1,
        limit = 20,
        status,
        hub_id,
        start_date,
        end_date
      } = req.query;

      const offset = (page - 1) * limit;
      let whereClause = {};

      // Filter by customer for non-admin users
      if (req.user.role !== 'admin') {
        whereClause.customer_id = req.user.user_id;
      }

      if (status) {
        whereClause.status = status;
      }

      if (hub_id) {
        whereClause.hub_id = hub_id;
      }

      if (start_date && end_date) {
        whereClause.slot_date = {
          [Op.between]: [start_date, end_date]
        };
      }

      const { count, rows: history } = await DriveThruSlot.findAndCountAll({
        where: whereClause,
        include: [
          {
            model: Hub,
            as: 'hub',
            attributes: ['hub_id', 'name', 'address']
          },
          {
            model: User,
            as: 'customer',
            attributes: ['first_name', 'last_name', 'email']
          },
          {
            model: Order,
            as: 'order',
            attributes: ['order_id', 'total_amount']
          }
        ],
        order: [['slot_date', 'DESC'], ['slot_time', 'DESC']],
        limit: parseInt(limit),
        offset
      });

      res.json({
        success: true,
        message: 'Pickup history retrieved successfully',
        data: {
          history: history.map(slot => ({
            slot_id: slot.slot_id,
            hub: slot.hub,
            customer: req.user.role === 'admin' ? slot.customer : undefined,
            order_id: slot.order.order_id,
            order_total: slot.order.total_amount,
            slot_date: slot.slot_date,
            slot_time: slot.slot_time,
            status: slot.status,
            customer_rating: slot.customer_rating,
            hub_rating: slot.hub_rating,
            feedback: slot.feedback,
            created_at: slot.created_at
          })),
          pagination: {
            page: parseInt(page),
            limit: parseInt(limit),
            total: count,
            pages: Math.ceil(count / limit)
          }
        }
      });

    } catch (error) {
      logger.error('Get pickup history error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve pickup history',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  // Rate pickup experience
  static async ratePickupExperience(req, res) {
    try {
      const { slot_id } = req.params;
      const { customer_rating, feedback } = req.body;

      if (!customer_rating || customer_rating < 1 || customer_rating > 5) {
        return res.status(400).json({
          success: false,
          message: 'Rating must be between 1 and 5'
        });
      }

      const driveThruSlot = await DriveThruSlot.findOne({
        where: { slot_id }
      });

      if (!driveThruSlot) {
        return res.status(404).json({
          success: false,
          message: 'Drive-thru booking not found'
        });
      }

      // Check if user owns the booking
      if (req.user.user_id !== driveThruSlot.customer_id) {
        return res.status(403).json({
          success: false,
          message: 'Access denied. You can only rate your own pickups.'
        });
      }

      if (driveThruSlot.status !== 'completed') {
        return res.status(400).json({
          success: false,
          message: 'Can only rate completed pickups'
        });
      }

      if (driveThruSlot.customer_rating) {
        return res.status(400).json({
          success: false,
          message: 'You have already rated this pickup'
        });
      }

      // Update rating
      await driveThruSlot.update({
        customer_rating,
        feedback
      });

      logger.info(`Drive-thru pickup rated: ${slot_id} by ${req.user.email}`);

      res.json({
        success: true,
        message: 'Pickup experience rated successfully',
        data: {
          slot_id: driveThruSlot.slot_id,
          customer_rating: driveThruSlot.customer_rating,
          feedback: driveThruSlot.feedback
        }
      });

    } catch (error) {
      logger.error('Rate pickup experience error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to rate pickup experience',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }
}

module.exports = DriveThruController;
