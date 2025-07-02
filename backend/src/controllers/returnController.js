const { 
  Return, 
  Order, 
  Product, 
  User, 
  Hub 
} = require('../models');
const { validationResult } = require('express-validator');
const { Op } = require('sequelize');

/**
 * Create return request
 */
const createReturnRequest = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        success: false, 
        message: 'Validation failed', 
        errors: errors.array() 
      });
    }

    const {
      order_id,
      product_id,
      quantity,
      reason,
      description,
      photos
    } = req.body;

    const customer_id = req.user.id;

    // Verify the order belongs to the user
    const order = await Order.findOne({
      where: { 
        id: order_id, 
        customer_id 
      },
      include: [{
        model: Hub,
        as: 'hub'
      }]
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found or not authorized'
      });
    }

    // Check if order is delivered and within return window
    if (order.status !== 'delivered') {
      return res.status(400).json({
        success: false,
        message: 'Returns can only be requested for delivered orders'
      });
    }

    // Check return window (assuming 7 days)
    const deliveryDate = new Date(order.delivered_at);
    const returnDeadline = new Date(deliveryDate);
    returnDeadline.setDate(returnDeadline.getDate() + 7);

    if (new Date() > returnDeadline) {
      return res.status(400).json({
        success: false,
        message: 'Return window has expired (7 days from delivery)'
      });
    }

    // Check if return already exists for this product
    const existingReturn = await Return.findOne({
      where: {
        order_id,
        product_id,
        customer_id
      }
    });

    if (existingReturn) {
      return res.status(400).json({
        success: false,
        message: 'Return request already exists for this product'
      });
    }

    const returnRequest = await Return.create({
      order_id,
      product_id,
      customer_id,
      hub_id: order.hub_id,
      quantity,
      reason,
      description,
      photos: photos || [],
      status: 'requested',
      requested_at: new Date()
    });

    const returnWithDetails = await Return.findByPk(returnRequest.id, {
      include: [
        {
          model: Order,
          as: 'order',
          attributes: ['id', 'order_number', 'total_amount']
        },
        {
          model: Product,
          as: 'product',
          attributes: ['id', 'name', 'price', 'image_url']
        },
        {
          model: User,
          as: 'customer',
          attributes: ['id', 'username', 'email', 'first_name', 'last_name']
        },
        {
          model: Hub,
          as: 'hub',
          attributes: ['id', 'name', 'address']
        }
      ]
    });

    res.status(201).json({
      success: true,
      data: returnWithDetails,
      message: 'Return request created successfully'
    });
  } catch (error) {
    console.error('Create return request error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to create return request' 
    });
  }
};

/**
 * Get return requests (with filters)
 */
const getReturnRequests = async (req, res) => {
  try {
    const { 
      status, 
      customer_id, 
      hub_id, 
      limit = 10, 
      offset = 0 
    } = req.query;

    let whereClause = {};

    // Role-based filtering
    if (req.user.role === 'customer') {
      whereClause.customer_id = req.user.id;
    } else if (req.user.role === 'hub_owner') {
      // Hub owners can only see returns for their hubs
      const userHubs = await Hub.findAll({
        where: { owner_id: req.user.id },
        attributes: ['id']
      });
      const hubIds = userHubs.map(hub => hub.id);
      whereClause.hub_id = { [Op.in]: hubIds };
    }

    // Apply additional filters
    if (status) whereClause.status = status;
    if (customer_id && req.user.role === 'admin') whereClause.customer_id = customer_id;
    if (hub_id && (req.user.role === 'admin' || req.user.role === 'hub_owner')) {
      whereClause.hub_id = hub_id;
    }

    const returns = await Return.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: Order,
          as: 'order',
          attributes: ['id', 'order_number', 'total_amount']
        },
        {
          model: Product,
          as: 'product',
          attributes: ['id', 'name', 'price', 'image_url']
        },
        {
          model: User,
          as: 'customer',
          attributes: ['id', 'username', 'email', 'first_name', 'last_name']
        },
        {
          model: Hub,
          as: 'hub',
          attributes: ['id', 'name', 'address']
        }
      ],
      order: [['requested_at', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    res.json({
      success: true,
      data: {
        returns: returns.rows,
        total: returns.count,
        pagination: {
          limit: parseInt(limit),
          offset: parseInt(offset),
          total_pages: Math.ceil(returns.count / limit)
        }
      }
    });
  } catch (error) {
    console.error('Get return requests error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch return requests' 
    });
  }
};

/**
 * Get return request by ID
 */
const getReturnById = async (req, res) => {
  try {
    const { id } = req.params;

    const returnRequest = await Return.findByPk(id, {
      include: [
        {
          model: Order,
          as: 'order',
          attributes: ['id', 'order_number', 'total_amount', 'delivered_at']
        },
        {
          model: Product,
          as: 'product',
          attributes: ['id', 'name', 'price', 'image_url', 'description']
        },
        {
          model: User,
          as: 'customer',
          attributes: ['id', 'username', 'email', 'first_name', 'last_name', 'phone']
        },
        {
          model: Hub,
          as: 'hub',
          attributes: ['id', 'name', 'address', 'phone']
        }
      ]
    });

    if (!returnRequest) {
      return res.status(404).json({
        success: false,
        message: 'Return request not found'
      });
    }

    // Check authorization
    if (req.user.role === 'customer' && returnRequest.customer_id !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this return request'
      });
    }

    if (req.user.role === 'hub_owner') {
      const userHubs = await Hub.findAll({
        where: { owner_id: req.user.id },
        attributes: ['id']
      });
      const hubIds = userHubs.map(hub => hub.id);
      if (!hubIds.includes(returnRequest.hub_id)) {
        return res.status(403).json({
          success: false,
          message: 'Not authorized to view this return request'
        });
      }
    }

    res.json({
      success: true,
      data: returnRequest
    });
  } catch (error) {
    console.error('Get return by ID error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch return request' 
    });
  }
};

/**
 * Update return status
 */
const updateReturnStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, admin_notes, refund_amount } = req.body;

    // Only hub owners and admins can update return status
    if (!['admin', 'hub_owner'].includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update return status'
      });
    }

    const returnRequest = await Return.findByPk(id);
    if (!returnRequest) {
      return res.status(404).json({
        success: false,
        message: 'Return request not found'
      });
    }

    // Check if hub owner is authorized for this return
    if (req.user.role === 'hub_owner') {
      const userHubs = await Hub.findAll({
        where: { owner_id: req.user.id },
        attributes: ['id']
      });
      const hubIds = userHubs.map(hub => hub.id);
      if (!hubIds.includes(returnRequest.hub_id)) {
        return res.status(403).json({
          success: false,
          message: 'Not authorized to update this return request'
        });
      }
    }

    const updateData = {
      status,
      admin_notes
    };

    // Set timestamps based on status
    if (status === 'approved') {
      updateData.approved_at = new Date();
      if (refund_amount) {
        updateData.refund_amount = refund_amount;
      }
    } else if (status === 'rejected') {
      updateData.rejected_at = new Date();
    } else if (status === 'processing') {
      updateData.processing_started_at = new Date();
    } else if (status === 'completed') {
      updateData.completed_at = new Date();
    }

    await returnRequest.update(updateData);

    const updatedReturn = await Return.findByPk(id, {
      include: [
        {
          model: Order,
          as: 'order',
          attributes: ['id', 'order_number']
        },
        {
          model: Product,
          as: 'product',
          attributes: ['id', 'name']
        },
        {
          model: User,
          as: 'customer',
          attributes: ['id', 'username', 'email']
        }
      ]
    });

    res.json({
      success: true,
      data: updatedReturn,
      message: 'Return status updated successfully'
    });
  } catch (error) {
    console.error('Update return status error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to update return status' 
    });
  }
};

/**
 * Cancel return request
 */
const cancelReturn = async (req, res) => {
  try {
    const { id } = req.params;
    const { cancellation_reason } = req.body;

    const returnRequest = await Return.findByPk(id);
    if (!returnRequest) {
      return res.status(404).json({
        success: false,
        message: 'Return request not found'
      });
    }

    // Only customer who created the return can cancel it
    if (returnRequest.customer_id !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to cancel this return request'
      });
    }

    // Can only cancel if status is 'requested'
    if (returnRequest.status !== 'requested') {
      return res.status(400).json({
        success: false,
        message: 'Return request cannot be cancelled at this stage'
      });
    }

    await returnRequest.update({
      status: 'cancelled',
      admin_notes: cancellation_reason || 'Cancelled by customer',
      cancelled_at: new Date()
    });

    res.json({
      success: true,
      message: 'Return request cancelled successfully'
    });
  } catch (error) {
    console.error('Cancel return error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to cancel return request' 
    });
  }
};

/**
 * Get return statistics
 */
const getReturnStatistics = async (req, res) => {
  try {
    const { hub_id } = req.query;

    // Build where clause based on user role
    let whereClause = {};
    if (req.user.role === 'hub_owner') {
      const userHubs = await Hub.findAll({
        where: { owner_id: req.user.id },
        attributes: ['id']
      });
      const hubIds = userHubs.map(hub => hub.id);
      whereClause.hub_id = { [Op.in]: hubIds };
    } else if (hub_id && req.user.role === 'admin') {
      whereClause.hub_id = hub_id;
    }

    // Get return counts by status
    const statusCounts = await Return.findAll({
      where: whereClause,
      attributes: [
        'status',
        [sequelize.fn('COUNT', sequelize.col('id')), 'count']
      ],
      group: ['status']
    });

    // Get return counts by reason
    const reasonCounts = await Return.findAll({
      where: whereClause,
      attributes: [
        'reason',
        [sequelize.fn('COUNT', sequelize.col('id')), 'count']
      ],
      group: ['reason']
    });

    // Get total refund amount
    const totalRefunds = await Return.findOne({
      where: {
        ...whereClause,
        status: 'completed',
        refund_amount: { [Op.not]: null }
      },
      attributes: [
        [sequelize.fn('SUM', sequelize.col('refund_amount')), 'total_refunds'],
        [sequelize.fn('COUNT', sequelize.col('id')), 'completed_returns']
      ]
    });

    res.json({
      success: true,
      data: {
        status_breakdown: statusCounts,
        reason_breakdown: reasonCounts,
        total_refunds: totalRefunds?.dataValues.total_refunds || 0,
        completed_returns: totalRefunds?.dataValues.completed_returns || 0
      }
    });
  } catch (error) {
    console.error('Get return statistics error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch return statistics' 
    });
  }
};

module.exports = {
  createReturnRequest,
  getReturnRequests,
  getReturnById,
  updateReturnStatus,
  cancelReturn,
  getReturnStatistics
};
