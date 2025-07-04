const { CommunityHub, CommunityEarnings, CommunityLeaderboard, Hub, User } = require('../models');
const logger = require('../utils/logger');

class CommunityController {
  // Register a new community hub
  static async registerCommunityHub(req, res) {
    try {
      const { hub_id, community_name, community_type, special_services, operating_hours } = req.body;
      const community_leader_id = req.user.user_id;

      // Check if hub exists and is owned by the user
      const hub = await Hub.findOne({
        where: { hub_id, owner_id: community_leader_id }
      });

      if (!hub) {
        return res.status(404).json({
          success: false,
          message: 'Hub not found or you do not have permission to register it as a community hub'
        });
      }

      // Check if community hub already exists
      const existingCommunity = await CommunityHub.findOne({ where: { hub_id } });
      if (existingCommunity) {
        return res.status(400).json({
          success: false,
          message: 'This hub is already registered as a community hub'
        });
      }

      const communityHub = await CommunityHub.create({
        hub_id,
        community_leader_id,
        community_name,
        community_type: community_type || 'residential',
        special_services: special_services || {},
        operating_hours: operating_hours || {},
        registration_status: 'pending'
      });

      logger.info(`Community hub registered: ${communityHub.community_hub_id} by user ${community_leader_id}`);

      res.status(201).json({
        success: true,
        message: 'Community hub registration submitted successfully',
        data: communityHub
      });
    } catch (error) {
      logger.error('Community hub registration error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to register community hub',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  // Get community hub performance metrics
  static async getCommunityHubPerformance(req, res) {
    try {
      const { hub_id } = req.params;
      const user_id = req.user.user_id;

      const communityHub = await CommunityHub.findOne({
        where: { hub_id },
        include: [
          {
            model: Hub,
            as: 'hub'
          },
          {
            model: User,
            as: 'communityLeader'
          }
        ]
      });

      if (!communityHub) {
        return res.status(404).json({
          success: false,
          message: 'Community hub not found'
        });
      }

      // Check permissions
      if (communityHub.community_leader_id !== user_id && req.user.role !== 'admin') {
        return res.status(403).json({
          success: false,
          message: 'Access denied'
        });
      }

      // Get earnings data
      const earnings = await CommunityEarnings.findAll({
        where: { community_hub_id: communityHub.community_hub_id },
        order: [['created_at', 'DESC']],
        limit: 30
      });

      // Calculate performance metrics
      const totalEarnings = earnings.reduce((sum, earning) => sum + parseFloat(earning.final_amount), 0);
      const avgRating = communityHub.community_rating;
      const ordersServed = communityHub.total_orders_served;
      const volunteerCount = communityHub.volunteer_count;

      const performanceData = {
        community_hub: communityHub,
        metrics: {
          total_earnings: totalEarnings,
          average_rating: avgRating,
          orders_served: ordersServed,
          volunteer_count: volunteerCount,
          recent_earnings: earnings.slice(0, 10)
        }
      };

      res.json({
        success: true,
        message: 'Community hub performance retrieved successfully',
        data: performanceData
      });
    } catch (error) {
      logger.error('Get community hub performance error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve community hub performance',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  // Get community leaderboard
  static async getCommunityLeaderboard(req, res) {
    try {
      const { type = 'overall', period = 'monthly' } = req.query;
      const { limit = 50, page = 1 } = req.query;
      const offset = (page - 1) * limit;

      // Calculate date range based on period
      const now = new Date();
      let startDate;
      
      switch (period) {
        case 'weekly':
          startDate = new Date(now.setDate(now.getDate() - 7));
          break;
        case 'monthly':
          startDate = new Date(now.setMonth(now.getMonth() - 1));
          break;
        default:
          startDate = new Date(0); // All time
      }

      const leaderboard = await CommunityLeaderboard.findAndCountAll({
        where: {
          leaderboard_type: type,
          period_start: { $gte: startDate },
          is_public: true
        },
        include: [
          {
            model: User,
            as: 'user',
            attributes: ['user_id', 'first_name', 'last_name', 'role']
          },
          {
            model: Hub,
            as: 'hub',
            attributes: ['hub_id', 'name', 'address']
          }
        ],
        order: [['current_rank', 'ASC']],
        limit: parseInt(limit),
        offset: parseInt(offset)
      });

      res.json({
        success: true,
        message: 'Community leaderboard retrieved successfully',
        data: {
          leaderboard: leaderboard.rows,
          pagination: {
            total: leaderboard.count,
            page: parseInt(page),
            limit: parseInt(limit),
            pages: Math.ceil(leaderboard.count / limit)
          }
        }
      });
    } catch (error) {
      logger.error('Get community leaderboard error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve community leaderboard',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  // Get user earnings summary
  static async getUserEarnings(req, res) {
    try {
      const user_id = req.user.user_id;
      const { period = 'monthly' } = req.query;

      // Calculate date range
      const now = new Date();
      let startDate;
      
      switch (period) {
        case 'weekly':
          startDate = new Date(now.setDate(now.getDate() - 7));
          break;
        case 'monthly':
          startDate = new Date(now.setMonth(now.getMonth() - 1));
          break;
        case 'yearly':
          startDate = new Date(now.setFullYear(now.getFullYear() - 1));
          break;
        default:
          startDate = new Date(0); // All time
      }

      const earnings = await CommunityEarnings.findAll({
        where: {
          user_id,
          created_at: { $gte: startDate }
        },
        order: [['created_at', 'DESC']]
      });

      // Calculate summary
      const totalEarnings = earnings.reduce((sum, earning) => sum + parseFloat(earning.final_amount), 0);
      const paidEarnings = earnings.filter(e => e.payment_status === 'paid')
        .reduce((sum, earning) => sum + parseFloat(earning.final_amount), 0);
      const pendingEarnings = earnings.filter(e => e.payment_status === 'pending')
        .reduce((sum, earning) => sum + parseFloat(earning.final_amount), 0);

      const earningsByType = earnings.reduce((acc, earning) => {
        acc[earning.earning_type] = (acc[earning.earning_type] || 0) + parseFloat(earning.final_amount);
        return acc;
      }, {});

      res.json({
        success: true,
        message: 'User earnings retrieved successfully',
        data: {
          summary: {
            total_earnings: totalEarnings,
            paid_earnings: paidEarnings,
            pending_earnings: pendingEarnings,
            earnings_by_type: earningsByType
          },
          recent_earnings: earnings.slice(0, 20)
        }
      });
    } catch (error) {
      logger.error('Get user earnings error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve user earnings',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  // Request payout
  static async requestPayout(req, res) {
    try {
      const user_id = req.user.user_id;
      const { amount, payment_method_details } = req.body;

      // Check if user has sufficient pending earnings
      const pendingEarnings = await CommunityEarnings.sum('final_amount', {
        where: {
          user_id,
          payment_status: 'pending'
        }
      });

      if (!pendingEarnings || pendingEarnings < amount) {
        return res.status(400).json({
          success: false,
          message: 'Insufficient pending earnings for payout request',
          data: { available_amount: pendingEarnings || 0 }
        });
      }

      // Create payout request
      const { Payout } = require('../models');
      const payout = await Payout.create({
        user_id,
        amount,
        payout_method_details,
        status: 'pending'
      });

      logger.info(`Payout requested: ${payout.payout_id} for user ${user_id}, amount: ${amount}`);

      res.status(201).json({
        success: true,
        message: 'Payout request submitted successfully',
        data: payout
      });
    } catch (error) {
      logger.error('Request payout error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to request payout',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }
}

module.exports = CommunityController;
