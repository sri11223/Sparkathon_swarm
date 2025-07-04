const socketManager = require('../services/socketManager');
const logger = require('../utils/logger');

class RealtimeController {
  // Join a real-time communication room
  static async joinRoom(req, res) {
    try {
      const { user_id } = req.user;
      const { room_id, room_type } = req.body;

      if (!room_id || !room_type) {
        return res.status(400).json({
          status: 'error',
          message: 'room_id and room_type are required'
        });
      }

      // Validate room types
      const validRoomTypes = [
        'order_tracking', 'community_hub', 'crisis_response', 
        'delivery_coordination', 'customer_support', 'hub_management'
      ];

      if (!validRoomTypes.includes(room_type)) {
        return res.status(400).json({
          status: 'error',
          message: 'Invalid room type'
        });
      }

      // Get user's socket connection
      const socketId = socketManager.getUserSocketId(user_id);
      if (!socketId) {
        return res.status(400).json({
          status: 'error',
          message: 'User not connected to real-time service'
        });
      }

      // Join the room
      const socket = socketManager.io.sockets.sockets.get(socketId);
      if (socket) {
        socket.join(`${room_type}:${room_id}`);
        
        // Notify other room members
        socket.to(`${room_type}:${room_id}`).emit('user_joined_room', {
          user_id,
          room_id,
          room_type,
          timestamp: new Date().toISOString()
        });

        logger.info(`User ${user_id} joined room ${room_type}:${room_id}`);
      }

      res.status(200).json({
        status: 'success',
        message: 'Successfully joined room',
        data: {
          room_id,
          room_type,
          user_id
        }
      });

    } catch (error) {
      logger.error('Join room error:', error);
      res.status(500).json({
        status: 'error',
        message: 'Failed to join room',
        error: error.message
      });
    }
  }

  // Leave a real-time communication room
  static async leaveRoom(req, res) {
    try {
      const { user_id } = req.user;
      const { room_id, room_type } = req.body;

      if (!room_id || !room_type) {
        return res.status(400).json({
          status: 'error',
          message: 'room_id and room_type are required'
        });
      }

      // Get user's socket connection
      const socketId = socketManager.getUserSocketId(user_id);
      if (!socketId) {
        return res.status(400).json({
          status: 'error',
          message: 'User not connected to real-time service'
        });
      }

      // Leave the room
      const socket = socketManager.io.sockets.sockets.get(socketId);
      if (socket) {
        socket.leave(`${room_type}:${room_id}`);
        
        // Notify other room members
        socket.to(`${room_type}:${room_id}`).emit('user_left_room', {
          user_id,
          room_id,
          room_type,
          timestamp: new Date().toISOString()
        });

        logger.info(`User ${user_id} left room ${room_type}:${room_id}`);
      }

      res.status(200).json({
        status: 'success',
        message: 'Successfully left room',
        data: {
          room_id,
          room_type,
          user_id
        }
      });

    } catch (error) {
      logger.error('Leave room error:', error);
      res.status(500).json({
        status: 'error',
        message: 'Failed to leave room',
        error: error.message
      });
    }
  }

  // Broadcast message to a room
  static async broadcastToRoom(req, res) {
    try {
      const { user_id } = req.user;
      const { room_id, room_type, message, message_type = 'text', priority = 'normal' } = req.body;

      if (!room_id || !room_type || !message) {
        return res.status(400).json({
          status: 'error',
          message: 'room_id, room_type, and message are required'
        });
      }

      // Validate message types
      const validMessageTypes = ['text', 'image', 'location', 'file', 'system', 'emergency'];
      if (!validMessageTypes.includes(message_type)) {
        return res.status(400).json({
          status: 'error',
          message: 'Invalid message type'
        });
      }

      const broadcastData = {
        sender_id: user_id,
        room_id,
        room_type,
        message,
        message_type,
        priority,
        timestamp: new Date().toISOString()
      };

      // Broadcast to room
      socketManager.io.to(`${room_type}:${room_id}`).emit('room_message', broadcastData);

      // Log the broadcast
      logger.info(`User ${user_id} broadcasted ${message_type} message to room ${room_type}:${room_id}`);

      res.status(200).json({
        status: 'success',
        message: 'Message broadcasted successfully',
        data: broadcastData
      });

    } catch (error) {
      logger.error('Broadcast message error:', error);
      res.status(500).json({
        status: 'error',
        message: 'Failed to broadcast message',
        error: error.message
      });
    }
  }

  // Get active rooms for user
  static async getActiveRooms(req, res) {
    try {
      const { user_id } = req.user;

      // Get user's socket connection
      const socketId = socketManager.getUserSocketId(user_id);
      if (!socketId) {
        return res.status(200).json({
          status: 'success',
          message: 'User not connected to real-time service',
          data: { active_rooms: [] }
        });
      }

      const socket = socketManager.io.sockets.sockets.get(socketId);
      const activeRooms = [];

      if (socket) {
        // Get all rooms the socket is in
        for (const room of socket.rooms) {
          if (room !== socketId) { // Exclude the socket's own room
            const [room_type, room_id] = room.split(':');
            if (room_id) {
              activeRooms.push({
                room_id,
                room_type,
                member_count: socketManager.io.sockets.adapter.rooms.get(room)?.size || 0
              });
            }
          }
        }
      }

      res.status(200).json({
        status: 'success',
        message: 'Active rooms retrieved successfully',
        data: { active_rooms: activeRooms }
      });

    } catch (error) {
      logger.error('Get active rooms error:', error);
      res.status(500).json({
        status: 'error',
        message: 'Failed to get active rooms',
        error: error.message
      });
    }
  }

  // Get room information
  static async getRoomInfo(req, res) {
    try {
      const { room_id, room_type } = req.params;

      if (!room_id || !room_type) {
        return res.status(400).json({
          status: 'error',
          message: 'room_id and room_type are required'
        });
      }

      const roomName = `${room_type}:${room_id}`;
      const room = socketManager.io.sockets.adapter.rooms.get(roomName);

      if (!room) {
        return res.status(404).json({
          status: 'error',
          message: 'Room not found or inactive'
        });
      }

      res.status(200).json({
        status: 'success',
        message: 'Room information retrieved successfully',
        data: {
          room_id,
          room_type,
          member_count: room.size,
          is_active: true,
          created_at: new Date().toISOString() // This would be stored in Redis in production
        }
      });

    } catch (error) {
      logger.error('Get room info error:', error);
      res.status(500).json({
        status: 'error',
        message: 'Failed to get room information',
        error: error.message
      });
    }
  }
}

module.exports = RealtimeController;
