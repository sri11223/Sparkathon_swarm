const { Order, Hub, User, Product, Inventory } = require('../models');
const logger = require('../utils/logger');
const axios = require('axios');
const { Op } = require('sequelize');

class AIController {
  // Get optimized route for delivery
  static async getOptimizedRoute(req, res) {
    try {
      const { order_id, courier_location } = req.body;

      const order = await Order.findByPk(order_id, {
        include: [
          {
            model: Hub,
            as: 'sourceHub',
            attributes: ['id', 'name', 'address', 'latitude', 'longitude']
          }
        ]
      });

      if (!order) {
        return res.status(404).json({
          success: false,
          message: 'Order not found'
        });
      }

      // Mock AI service call - replace with actual AI service
      const routeData = {
        order_id,
        route: [
          {
            type: 'pickup',
            location: {
              name: order.sourceHub.name,
              address: order.sourceHub.address,
              latitude: order.sourceHub.latitude,
              longitude: order.sourceHub.longitude
            },
            estimated_time: 15, // minutes
            instructions: 'Collect package from hub reception'
          },
          {
            type: 'delivery',
            location: {
              address: order.delivery_address,
              latitude: order.delivery_latitude,
              longitude: order.delivery_longitude
            },
            estimated_time: 25, // minutes
            instructions: order.delivery_instructions || 'Deliver to customer'
          }
        ],
        total_distance: 12.5, // km
        total_time: 40, // minutes
        traffic_conditions: 'moderate',
        ai_confidence: 0.92
      };

      // In production, call actual AI service:
      /*
      const aiResponse = await axios.post(`${process.env.AI_SERVICE_URL}/route-optimization`, {
        pickup_location: {
          latitude: order.sourceHub.latitude,
          longitude: order.sourceHub.longitude
        },
        delivery_location: {
          latitude: order.delivery_latitude,
          longitude: order.delivery_longitude
        },
        courier_location,
        order_priority: order.priority || 'normal',
        delivery_time_window: order.preferred_delivery_time
      });
      
      const routeData = aiResponse.data;
      */

      logger.info(`Route optimization requested for order ${order_id} by ${req.user.email}`);

      res.json({
        success: true,
        message: 'Optimized route generated successfully',
        data: {
          route: routeData
        }
      });

    } catch (error) {
      logger.error('Get optimized route error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to generate optimized route',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  // Get inventory demand prediction
  static async getPredictedDemand(req, res) {
    try {
      const { hub_id, product_ids, time_horizon = 7 } = req.query;

      const hub = await Hub.findByPk(hub_id);
      if (!hub) {
        return res.status(404).json({
          success: false,
          message: 'Hub not found'
        });
      }

      // Check if user can access this hub's data
      if (req.user.user_type !== 'admin' && req.user.id !== hub.owner_id) {
        return res.status(403).json({
          success: false,
          message: 'Access denied'
        });
      }

      let productFilter = {};
      if (product_ids) {
        const ids = product_ids.split(',');
        productFilter.id = { [Op.in]: ids };
      }

      const products = await Product.findAll({
        where: productFilter,
        include: [
          {
            model: Inventory,
            as: 'inventoryEntries',
            where: { hub_id },
            required: true
          }
        ]
      });

      // Mock AI prediction - replace with actual AI service
      const predictions = products.map(product => ({
        product_id: product.id,
        product_name: product.name,
        current_stock: product.inventoryEntries[0]?.quantity || 0,
        predicted_demand: Math.floor(Math.random() * 50) + 10, // Mock prediction
        recommended_restock: Math.floor(Math.random() * 30) + 5,
        confidence_score: Math.random() * 0.3 + 0.7, // 0.7-1.0
        factors: [
          'Historical sales trend',
          'Seasonal patterns',
          'Regional demand',
          'Weather conditions'
        ]
      }));

      // In production, call actual AI service:
      /*
      const aiResponse = await axios.post(`${process.env.AI_SERVICE_URL}/demand-prediction`, {
        hub_id,
        product_ids: products.map(p => p.id),
        time_horizon,
        historical_data: await getHistoricalOrderData(hub_id, product_ids)
      });
      
      const predictions = aiResponse.data.predictions;
      */

      logger.info(`Demand prediction requested for hub ${hub_id} by ${req.user.email}`);

      res.json({
        success: true,
        message: 'Demand predictions generated successfully',
        data: {
          hub_id,
          time_horizon,
          predictions,
          generated_at: new Date().toISOString()
        }
      });

    } catch (error) {
      logger.error('Get predicted demand error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to generate demand predictions',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  // Get optimal courier assignment
  static async getOptimalCourierAssignment(req, res) {
    try {
      const { order_id } = req.body;

      const order = await Order.findByPk(order_id, {
        include: [
          {
            model: Hub,
            as: 'sourceHub',
            attributes: ['id', 'name', 'latitude', 'longitude']
          }
        ]
      });

      if (!order) {
        return res.status(404).json({
          success: false,
          message: 'Order not found'
        });
      }

      // Find available couriers near the hub
      const availableCouriers = await User.findAll({
        where: {
          user_type: 'courier',
          is_available: true,
          is_active: true
        },
        attributes: [
          'id', 'full_name', 'phone', 'vehicle_type', 'rating',
          'current_lat', 'current_lng', 'total_deliveries'
        ]
      });

      // Mock AI courier assignment - replace with actual AI service
      const courierScores = availableCouriers.map(courier => {
        const distance = calculateDistance(
          order.sourceHub.latitude,
          order.sourceHub.longitude,
          courier.current_lat,
          courier.current_lng
        );

        return {
          courier_id: courier.id,
          courier_name: courier.full_name,
          vehicle_type: courier.vehicle_type,
          rating: courier.rating,
          distance_km: distance,
          estimated_pickup_time: Math.ceil(distance * 3), // 3 min per km
          suitability_score: Math.random() * 0.4 + 0.6, // Mock score
          factors: {
            proximity: 1 - (distance / 20), // Closer is better
            rating: courier.rating / 5,
            availability: 1,
            vehicle_suitability: getVehicleSuitability(courier.vehicle_type, order.total_amount)
          }
        };
      }).sort((a, b) => b.suitability_score - a.suitability_score);

      // In production, call actual AI service:
      /*
      const aiResponse = await axios.post(`${process.env.AI_SERVICE_URL}/courier-assignment`, {
        order_id,
        pickup_location: {
          latitude: order.sourceHub.latitude,
          longitude: order.sourceHub.longitude
        },
        delivery_location: {
          latitude: order.delivery_latitude,
          longitude: order.delivery_longitude
        },
        available_couriers: availableCouriers,
        order_urgency: order.priority || 'normal',
        order_value: order.total_amount
      });
      
      const courierScores = aiResponse.data.recommendations;
      */

      logger.info(`Courier assignment requested for order ${order_id} by ${req.user.email}`);

      res.json({
        success: true,
        message: 'Optimal courier assignments generated successfully',
        data: {
          order_id,
          recommendations: courierScores.slice(0, 5), // Top 5 recommendations
          generated_at: new Date().toISOString()
        }
      });

    } catch (error) {
      logger.error('Get optimal courier assignment error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to generate courier assignments',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  // Get smart product recommendations
  static async getProductRecommendations(req, res) {
    try {
      const { customer_location, category, limit = 10 } = req.query;

      if (!customer_location) {
        return res.status(400).json({
          success: false,
          message: 'Customer location (latitude,longitude) is required'
        });
      }

      const [latitude, longitude] = customer_location.split(',').map(Number);

      // Mock AI recommendations - replace with actual AI service
      const recommendations = await Product.findAll({
        where: category ? { category, is_active: true } : { is_active: true },
        limit: parseInt(limit),
        include: [
          {
            model: Inventory,
            as: 'inventoryEntries',
            where: { quantity: { [Op.gt]: 0 } },
            include: [
              {
                model: Hub,
                as: 'hub',
                attributes: ['id', 'name', 'address', 'latitude', 'longitude']
              }
            ]
          }
        ]
      });

      const enrichedRecommendations = recommendations.map(product => ({
        product_id: product.id,
        name: product.name,
        category: product.category,
        base_price: product.base_price,
        recommendation_score: Math.random() * 0.4 + 0.6, // Mock score
        reasons: [
          'Popular in your area',
          'Frequently bought together',
          'Seasonal trend',
          'Price match'
        ],
        available_hubs: product.inventoryEntries.map(inv => ({
          hub_id: inv.hub.id,
          hub_name: inv.hub.name,
          price: inv.price,
          stock: inv.quantity,
          distance_km: calculateDistance(latitude, longitude, inv.hub.latitude, inv.hub.longitude)
        })).sort((a, b) => a.distance_km - b.distance_km)
      }));

      // In production, call actual AI service:
      /*
      const aiResponse = await axios.post(`${process.env.AI_SERVICE_URL}/product-recommendations`, {
        customer_location: { latitude, longitude },
        customer_history: await getCustomerPurchaseHistory(req.user.id),
        category,
        limit,
        available_inventory: recommendations
      });
      
      const enrichedRecommendations = aiResponse.data.recommendations;
      */

      logger.info(`Product recommendations requested by ${req.user.email}`);

      res.json({
        success: true,
        message: 'Product recommendations generated successfully',
        data: {
          recommendations: enrichedRecommendations,
          customer_location: { latitude, longitude },
          generated_at: new Date().toISOString()
        }
      });

    } catch (error) {
      logger.error('Get product recommendations error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to generate product recommendations',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  // Get price optimization suggestions
  static async getPriceOptimization(req, res) {
    try {
      const { hub_id, product_id } = req.query;

      const hub = await Hub.findByPk(hub_id);
      if (!hub) {
        return res.status(404).json({
          success: false,
          message: 'Hub not found'
        });
      }

      // Check permissions
      if (req.user.user_type !== 'admin' && req.user.id !== hub.owner_id) {
        return res.status(403).json({
          success: false,
          message: 'Access denied'
        });
      }

      let productWhere = { is_active: true };
      if (product_id) productWhere.id = product_id;

      const inventory = await Inventory.findAll({
        where: { hub_id },
        include: [
          {
            model: Product,
            as: 'product',
            where: productWhere
          }
        ]
      });

      // Mock AI price optimization - replace with actual AI service
      const priceOptimizations = inventory.map(item => ({
        product_id: item.product_id,
        product_name: item.product.name,
        current_price: item.price,
        suggested_price: item.price * (0.95 + Math.random() * 0.1), // ±5% variation
        expected_demand_change: (Math.random() - 0.5) * 0.3, // ±15% change
        expected_revenue_change: (Math.random() - 0.5) * 0.2, // ±10% change
        confidence_score: Math.random() * 0.3 + 0.7,
        market_factors: [
          'Competitor pricing',
          'Seasonal demand',
          'Inventory levels',
          'Customer price sensitivity'
        ]
      }));

      logger.info(`Price optimization requested for hub ${hub_id} by ${req.user.email}`);

      res.json({
        success: true,
        message: 'Price optimization suggestions generated successfully',
        data: {
          hub_id,
          optimizations: priceOptimizations,
          generated_at: new Date().toISOString()
        }
      });

    } catch (error) {
      logger.error('Get price optimization error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to generate price optimization',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }
}

// Helper functions
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Radius of the Earth in km
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  const d = R * c; // Distance in km
  return Math.round(d * 100) / 100;
}

function deg2rad(deg) {
  return deg * (Math.PI/180);
}

function getVehicleSuitability(vehicleType, orderValue) {
  const suitabilityMatrix = {
    'bike': orderValue < 100 ? 1 : 0.6,
    'car': orderValue < 500 ? 1 : 0.8,
    'van': orderValue < 1000 ? 1 : 0.9,
    'truck': 1
  };
  return suitabilityMatrix[vehicleType] || 0.5;
}

module.exports = AIController;
