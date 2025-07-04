const { Product, Inventory, Hub, OrderItem } = require('../models');
const logger = require('../utils/logger');
const { Op } = require('sequelize');

class ProductController {
  // Create new product (Admin only)
  static async createProduct(req, res) {
    try {
      const {
        name,
        description,
        category,
        base_price,
        weight,
        dimensions,
        barcode,
        image_url,
        tags
      } = req.body;

      const product = await Product.create({
        name,
        description,
        category,
        base_price,
        weight,
        dimensions,
        barcode,
        image_url,
        tags,
        is_active: true
      });

      logger.info(`New product created: ${product.name} by ${req.user.email}`);

      res.status(201).json({
        success: true,
        message: 'Product created successfully',
        data: {
          product: product.toJSON()
        }
      });

    } catch (error) {
      logger.error('Create product error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to create product',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  // Get all products with pagination and filtering
  static async getAllProducts(req, res) {
    try {
      const {
        page = 1,
        limit = 20,
        search,
        category,
        is_active = true,
        min_price,
        max_price,
        tags,
        sort = 'name',
        order = 'asc'
      } = req.query;

      let whereClause = {};

      if (is_active !== undefined) {
        whereClause.is_active = is_active === 'true';
      }

      if (category) {
        whereClause.category = category;
      }

      if (search) {
        whereClause[Op.or] = [
          { name: { [Op.iLike]: `%${search}%` } },
          { description: { [Op.iLike]: `%${search}%` } },
          { category: { [Op.iLike]: `%${search}%` } }
        ];
      }

      if (min_price || max_price) {
        whereClause.base_price = {};
        if (min_price) whereClause.base_price[Op.gte] = parseFloat(min_price);
        if (max_price) whereClause.base_price[Op.lte] = parseFloat(max_price);
      }

      if (tags) {
        const tagArray = tags.split(',').map(tag => tag.trim());
        whereClause.tags = {
          [Op.overlap]: tagArray
        };
      }

      const products = await Product.findAndCountAll({
        where: whereClause,
        order: [[sort, order.toUpperCase()]],
        limit: parseInt(limit),
        offset: (parseInt(page) - 1) * parseInt(limit)
      });

      res.json({
        success: true,
        message: 'Products retrieved successfully',
        data: {
          products: products.rows,
          pagination: {
            page: parseInt(page),
            limit: parseInt(limit),
            total: products.count,
            pages: Math.ceil(products.count / limit)
          }
        }
      });

    } catch (error) {
      logger.error('Get all products error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve products',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  // Get product by ID
  static async getProductById(req, res) {
    try {
      const { id } = req.params;

      const product = await Product.findByPk(id, {
        include: [
          {
            model: Inventory,
            as: 'inventoryEntries',
            include: [
              {
                model: Hub,
                as: 'hub',
                attributes: ['hub_id', 'name', 'address', 'location']
              }
            ]
          }
        ]
      });

      if (!product) {
        return res.status(404).json({
          success: false,
          message: 'Product not found'
        });
      }

      res.json({
        success: true,
        message: 'Product retrieved successfully',
        data: {
          product: product.toJSON()
        }
      });

    } catch (error) {
      logger.error('Get product by ID error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve product',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  // Update product (Admin only)
  static async updateProduct(req, res) {
    try {
      const { id } = req.params;
      const {
        name,
        description,
        category,
        base_price,
        weight,
        dimensions,
        barcode,
        image_url,
        tags,
        is_active
      } = req.body;

      const product = await Product.findByPk(id);
      if (!product) {
        return res.status(404).json({
          success: false,
          message: 'Product not found'
        });
      }

      const updateData = {};
      if (name !== undefined) updateData.name = name;
      if (description !== undefined) updateData.description = description;
      if (category !== undefined) updateData.category = category;
      if (base_price !== undefined) updateData.base_price = base_price;
      if (weight !== undefined) updateData.weight = weight;
      if (dimensions !== undefined) updateData.dimensions = dimensions;
      if (barcode !== undefined) updateData.barcode = barcode;
      if (image_url !== undefined) updateData.image_url = image_url;
      if (tags !== undefined) updateData.tags = tags;
      if (is_active !== undefined) updateData.is_active = is_active;

      await product.update(updateData);

      logger.info(`Product updated: ${product.name} by ${req.user.email}`);

      res.json({
        success: true,
        message: 'Product updated successfully',
        data: {
          product: product.toJSON()
        }
      });

    } catch (error) {
      logger.error('Update product error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update product',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  // Delete product (Admin only)
  static async deleteProduct(req, res) {
    try {
      const { id } = req.params;

      const product = await Product.findByPk(id);
      if (!product) {
        return res.status(404).json({
          success: false,
          message: 'Product not found'
        });
      }

      // Check if product has active inventory or order items
      const hasInventory = await Inventory.count({ where: { product_id: id } });
      const hasOrderItems = await OrderItem.count({ where: { product_id: id } });

      if (hasInventory > 0 || hasOrderItems > 0) {
        return res.status(400).json({
          success: false,
          message: 'Cannot delete product with existing inventory or order history. Consider deactivating instead.'
        });
      }

      await product.destroy();

      logger.info(`Product deleted: ${product.name} by ${req.user.email}`);

      res.json({
        success: true,
        message: 'Product deleted successfully'
      });

    } catch (error) {
      logger.error('Delete product error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to delete product',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  // Get product categories
  static async getCategories(req, res) {
    try {
      const categories = await Product.findAll({
        attributes: ['category'],
        where: { is_active: true },
        group: ['category'],
        order: [['category', 'ASC']]
      });

      const categoryList = categories.map(cat => cat.category).filter(Boolean);

      res.json({
        success: true,
        message: 'Categories retrieved successfully',
        data: {
          categories: categoryList
        }
      });

    } catch (error) {
      logger.error('Get categories error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve categories',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  // Search products with availability at specific location
  static async searchProductsNearLocation(req, res) {
    try {
      const {
        latitude,
        longitude,
        radius = 10,
        search,
        category,
        page = 1,
        limit = 20
      } = req.query;

      if (!latitude || !longitude) {
        return res.status(400).json({
          success: false,
          message: 'Latitude and longitude are required'
        });
      }

      // Convert radius from km to degrees (approximate)
      const radiusInDegrees = radius / 111;

      let productWhere = { is_active: true };
      if (category) productWhere.category = category;
      if (search) {
        productWhere[Op.or] = [
          { name: { [Op.iLike]: `%${search}%` } },
          { description: { [Op.iLike]: `%${search}%` } }
        ];
      }

      const products = await Product.findAndCountAll({
        where: productWhere,
        include: [
          {
            model: Inventory,
            as: 'inventoryEntries',
            where: { quantity: { [Op.gt]: 0 } },
            required: true,
            include: [
              {
                model: Hub,
                as: 'hub',
                where: {
                  is_active: true,
                  latitude: {
                    [Op.between]: [
                      parseFloat(latitude) - radiusInDegrees,
                      parseFloat(latitude) + radiusInDegrees
                    ]
                  },
                  longitude: {
                    [Op.between]: [
                      parseFloat(longitude) - radiusInDegrees,
                      parseFloat(longitude) + radiusInDegrees
                    ]
                  }
                },
                attributes: ['id', 'name', 'address', 'latitude', 'longitude']
              }
            ]
          }
        ],
        order: [['name', 'ASC']],
        limit: parseInt(limit),
        offset: (parseInt(page) - 1) * parseInt(limit),
        distinct: true
      });

      res.json({
        success: true,
        message: 'Products near location retrieved successfully',
        data: {
          products: products.rows,
          location: { latitude, longitude, radius },
          pagination: {
            page: parseInt(page),
            limit: parseInt(limit),
            total: products.count,
            pages: Math.ceil(products.count / limit)
          }
        }
      });

    } catch (error) {
      logger.error('Search products near location error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to search products',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  // Get popular products (based on order frequency)
  static async getPopularProducts(req, res) {
    try {
      const { limit = 10, category } = req.query;

      let whereClause = { is_active: true };
      if (category) whereClause.category = category;

      const products = await Product.findAll({
        where: whereClause,
        include: [
          {
            model: OrderItem,
            as: 'orderItems',
            attributes: []
          }
        ],
        attributes: [
          'id',
          'name',
          'description',
          'category',
          'base_price',
          'image_url',
          [
            Product.sequelize.fn('COUNT', Product.sequelize.col('orderItems.id')),
            'order_count'
          ]
        ],
        group: ['Product.id'],
        order: [[Product.sequelize.literal('order_count'), 'DESC']],
        limit: parseInt(limit)
      });

      res.json({
        success: true,
        message: 'Popular products retrieved successfully',
        data: {
          products
        }
      });

    } catch (error) {
      logger.error('Get popular products error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve popular products',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }
}

module.exports = ProductController;
