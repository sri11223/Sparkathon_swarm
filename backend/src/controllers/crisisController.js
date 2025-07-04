const { CrisisEvent, EmergencyHub, Hub, User, Order } = require('../models');
const logger = require('../utils/logger');
const socketManager = require('../services/socketManager');

class CrisisController {
  // Activate crisis mode
  static async activateCrisisMode(req, res) {
    try {
      const {
        event_name,
        event_type,
        severity_level,
        affected_areas,
        description,
        emergency_supplies_needed,
        volunteer_requirements
      } = req.body;

      const created_by = req.user.user_id;

      const crisisEvent = await CrisisEvent.create({
        event_name,
        event_type,
        severity_level,
        affected_areas,
        description,
        emergency_supplies_needed: emergency_supplies_needed || [],
        volunteer_requirements: volunteer_requirements || {},
        status: 'active',
        created_by,
        activated_at: new Date()
      });

      // Broadcast crisis activation to all users
      socketManager.broadcastSystemNotification({
        type: 'crisis_mode_activated',
        event: crisisEvent,
        message: `Crisis mode activated: ${event_name}`,
        severity: severity_level
      });

      logger.warn(`Crisis mode activated: ${crisisEvent.crisis_event_id} - ${event_name} by user ${created_by}`);

      res.status(201).json({
        success: true,
        message: 'Crisis mode activated successfully',
        data: crisisEvent
      });
    } catch (error) {
      logger.error('Activate crisis mode error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to activate crisis mode',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  // Register emergency hub
  static async registerEmergencyHub(req, res) {
    try {
      const {
        hub_id,
        crisis_event_id,
        volunteer_coordinator_id,
        capacity_emergency,
        services_offered,
        emergency_contacts,
        operating_schedule
      } = req.body;

      // Verify crisis event exists and is active
      const crisisEvent = await CrisisEvent.findByPk(crisis_event_id);
      if (!crisisEvent || crisisEvent.status !== 'active') {
        return res.status(400).json({
          success: false,
          message: 'Invalid or inactive crisis event'
        });
      }

      // Verify hub exists
      const hub = await Hub.findByPk(hub_id);
      if (!hub) {
        return res.status(404).json({
          success: false,
          message: 'Hub not found'
        });
      }

      // Check if emergency hub already exists for this crisis
      const existingEmergencyHub = await EmergencyHub.findOne({
        where: { hub_id, crisis_event_id }
      });

      if (existingEmergencyHub) {
        return res.status(400).json({
          success: false,
          message: 'Emergency hub already registered for this crisis event'
        });
      }

      const emergencyHub = await EmergencyHub.create({
        hub_id,
        crisis_event_id,
        volunteer_coordinator_id,
        capacity_emergency: capacity_emergency || 0,
        services_offered: services_offered || [],
        emergency_contacts: emergency_contacts || {},
        operating_schedule: operating_schedule || {},
        emergency_status: 'preparing',
        activation_date: new Date()
      });

      // Broadcast emergency hub registration
      socketManager.broadcastSystemNotification({
        type: 'emergency_hub_registered',
        emergency_hub: emergencyHub,
        hub: hub,
        message: `Emergency hub registered: ${hub.name}`
      });

      logger.info(`Emergency hub registered: ${emergencyHub.emergency_hub_id} for crisis ${crisis_event_id}`);

      res.status(201).json({
        success: true,
        message: 'Emergency hub registered successfully',
        data: emergencyHub
      });
    } catch (error) {
      logger.error('Register emergency hub error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to register emergency hub',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  // Get available emergency hubs
  static async getAvailableEmergencyHubs(req, res) {
    try {
      const { crisis_event_id, latitude, longitude, radius = 10 } = req.query;

      let whereClause = {
        emergency_status: ['active', 'fully_operational']
      };

      if (crisis_event_id) {
        whereClause.crisis_event_id = crisis_event_id;
      }

      const emergencyHubs = await EmergencyHub.findAll({
        where: whereClause,
        include: [
          {
            model: Hub,
            as: 'hub',
            attributes: ['hub_id', 'name', 'address', 'latitude', 'longitude', 'capacity_m3']
          },
          {
            model: CrisisEvent,
            as: 'crisisEvent',
            attributes: ['event_name', 'event_type', 'severity_level', 'status']
          },
          {
            model: User,
            as: 'coordinator',
            attributes: ['user_id', 'first_name', 'last_name', 'phone_number']
          }
        ],
        order: [['activation_priority', 'DESC'], ['created_at', 'ASC']]
      });

      // Filter by location if coordinates provided
      let filteredHubs = emergencyHubs;
      if (latitude && longitude) {
        filteredHubs = emergencyHubs.filter(hub => {
          if (!hub.hub.latitude || !hub.hub.longitude) return true;
          
          const distance = calculateDistance(
            parseFloat(latitude),
            parseFloat(longitude),
            parseFloat(hub.hub.latitude),
            parseFloat(hub.hub.longitude)
          );
          
          return distance <= parseFloat(radius);
        });
      }

      res.json({
        success: true,
        message: 'Available emergency hubs retrieved successfully',
        data: {
          emergency_hubs: filteredHubs,
          total_count: filteredHubs.length
        }
      });
    } catch (error) {
      logger.error('Get available emergency hubs error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve available emergency hubs',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  // Coordinate volunteers
  static async coordinateVolunteers(req, res) {
    try {
      const { crisis_event_id, volunteer_assignments, emergency_tasks } = req.body;

      const crisisEvent = await CrisisEvent.findByPk(crisis_event_id);
      if (!crisisEvent) {
        return res.status(404).json({
          success: false,
          message: 'Crisis event not found'
        });
      }

      // Update crisis event with volunteer coordination info
      await crisisEvent.update({
        volunteer_requirements: {
          ...crisisEvent.volunteer_requirements,
          assignments: volunteer_assignments || [],
          tasks: emergency_tasks || []
        }
      });

      // Broadcast volunteer coordination to relevant users
      if (volunteer_assignments && volunteer_assignments.length > 0) {
        volunteer_assignments.forEach(assignment => {
          socketManager.io.to(`customer:${assignment.volunteer_id}`)
                          .to(`hubowner:${assignment.volunteer_id}`)
                          .to(`courier:${assignment.volunteer_id}`)
                          .emit('volunteer_assignment', {
            crisis_event: crisisEvent,
            assignment: assignment,
            timestamp: new Date().toISOString()
          });
        });
      }

      logger.info(`Volunteers coordinated for crisis: ${crisis_event_id}`);

      res.json({
        success: true,
        message: 'Volunteers coordinated successfully',
        data: {
          crisis_event: crisisEvent,
          assignments_sent: volunteer_assignments?.length || 0
        }
      });
    } catch (error) {
      logger.error('Coordinate volunteers error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to coordinate volunteers',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  // Emergency communication broadcast
  static async emergencyCommunicationBroadcast(req, res) {
    try {
      const { crisis_event_id, message, target_audience, priority_level, communication_type } = req.body;

      const crisisEvent = await CrisisEvent.findByPk(crisis_event_id);
      if (!crisisEvent) {
        return res.status(404).json({
          success: false,
          message: 'Crisis event not found'
        });
      }

      // Broadcast emergency communication
      const emergencyMessage = {
        type: 'emergency_communication',
        crisis_event: crisisEvent,
        message,
        priority_level: priority_level || 'high',
        communication_type: communication_type || 'general',
        timestamp: new Date().toISOString()
      };

      // Broadcast to specific audiences or all users
      if (target_audience === 'all') {
        socketManager.broadcastSystemNotification(emergencyMessage);
      } else if (target_audience === 'hub_owners') {
        socketManager.io.to('hubowners').emit('emergency_notification', emergencyMessage);
      } else if (target_audience === 'couriers') {
        socketManager.io.to('couriers').emit('emergency_notification', emergencyMessage);
      } else if (target_audience === 'affected_areas') {
        // Broadcast to users in affected areas (implementation would depend on location tracking)
        socketManager.broadcastSystemNotification(emergencyMessage);
      }

      logger.warn(`Emergency communication broadcast for crisis: ${crisis_event_id} to ${target_audience}`);

      res.json({
        success: true,
        message: 'Emergency communication broadcasted successfully',
        data: {
          crisis_event: crisisEvent,
          message_sent: true,
          target_audience
        }
      });
    } catch (error) {
      logger.error('Emergency communication broadcast error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to broadcast emergency communication',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  // Get crisis status
  static async getCrisisStatus(req, res) {
    try {
      const activeCrises = await CrisisEvent.findAll({
        where: {
          status: ['monitoring', 'active', 'response_initiated']
        },
        include: [
          {
            model: EmergencyHub,
            as: 'emergencyHubs',
            include: [{
              model: Hub,
              as: 'hub',
              attributes: ['name', 'address', 'latitude', 'longitude']
            }]
          }
        ],
        order: [['priority_level', 'DESC'], ['created_at', 'DESC']]
      });

      // Calculate overall crisis metrics
      const totalEmergencyHubs = activeCrises.reduce((count, crisis) => count + crisis.emergencyHubs.length, 0);
      const highestSeverity = activeCrises.length > 0 ? 
        Math.max(...activeCrises.map(c => {
          const severityMap = { low: 1, medium: 2, high: 3, critical: 4, catastrophic: 5 };
          return severityMap[c.severity_level] || 1;
        })) : 0;        const severityMap = { low: 1, medium: 2, high: 3, critical: 4, catastrophic: 5 };
        const reverseSeverityMap = { 1: 'low', 2: 'medium', 3: 'high', 4: 'critical', 5: 'catastrophic' };

        res.json({
          success: true,
          message: 'Crisis status retrieved successfully',
          data: {
            active_crises: activeCrises,
            summary: {
              total_active_crises: activeCrises.length,
              total_emergency_hubs: totalEmergencyHubs,
              highest_severity_level: reverseSeverityMap[highestSeverity] || 'none'
            }
          }
        });
    } catch (error) {
      logger.error('Get crisis status error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve crisis status',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  // Deactivate crisis mode
  static async deactivateCrisisMode(req, res) {
    try {
      const { crisis_event_id } = req.params;
      const { resolution_details, final_metrics } = req.body;

      const crisisEvent = await CrisisEvent.findByPk(crisis_event_id);
      if (!crisisEvent) {
        return res.status(404).json({
          success: false,
          message: 'Crisis event not found'
        });
      }

      // Update crisis event status
      await crisisEvent.update({
        status: 'resolved',
        resolved_at: new Date(),
        resolution_details,
        response_metrics: final_metrics || {}
      });

      // Deactivate all emergency hubs for this crisis
      await EmergencyHub.update(
        { emergency_status: 'deactivated', deactivation_date: new Date() },
        { where: { crisis_event_id } }
      );

      // Broadcast crisis deactivation
      socketManager.broadcastSystemNotification({
        type: 'crisis_mode_deactivated',
        crisis_event: crisisEvent,
        message: `Crisis resolved: ${crisisEvent.event_name}`
      });

      logger.info(`Crisis mode deactivated: ${crisis_event_id}`);

      res.json({
        success: true,
        message: 'Crisis mode deactivated successfully',
        data: crisisEvent
      });
    } catch (error) {
      logger.error('Deactivate crisis mode error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to deactivate crisis mode',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }
}

// Helper function to calculate distance between two coordinates
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Radius of Earth in kilometers
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

module.exports = CrisisController;
