const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  class EmergencyContact extends Model {
    static associate(models) {
      // An emergency contact belongs to one user
      EmergencyContact.belongsTo(models.User, {
        foreignKey: 'user_id',
        as: 'user'
      });
    }
  }

  EmergencyContact.init({
    contact_id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      allowNull: false
    },
    user_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'users',
        key: 'user_id'
      }
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    phone_number: {
      type: DataTypes.STRING(20),
      allowNull: false
    },
    relationship: {
      type: DataTypes.STRING(50),
      validate: {
        isIn: [['spouse', 'parent', 'child', 'sibling', 'friend', 'other']]
      }
    },
    is_primary: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    }
  }, {
    sequelize,
    modelName: 'EmergencyContact',
    tableName: 'emergency_contacts',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  });

  return EmergencyContact;
};
