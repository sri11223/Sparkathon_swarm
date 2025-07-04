const express = require('express');
const router = express.Router();
const CrisisController = require('../controllers/crisisController');
const { authenticate, authorize } = require('../middleware/auth');
const { validateUUID } = require('../middleware/validation');
const { body, query, param } = require('express-validator');

// Validation middleware
const validateCrisisActivation = [
  body('event_name').isLength({ min: 5, max: 200 }).withMessage('Event name must be between 5 and 200 characters'),
  body('event_type').isIn(['natural_disaster', 'pandemic', 'supply_shortage', 'infrastructure_failure', 'emergency_response']).withMessage('Invalid event type'),
  body('severity_level').isIn(['low', 'medium', 'high', 'critical', 'catastrophic']).withMessage('Invalid severity level'),
  body('affected_areas').isArray().withMessage('Affected areas must be an array'),
  body('description').optional().isLength({ max: 1000 }).withMessage('Description cannot exceed 1000 characters'),
  body('emergency_supplies_needed').optional().isArray().withMessage('Emergency supplies must be an array'),
  body('volunteer_requirements').optional().isObject().withMessage('Volunteer requirements must be an object')
];

const validateEmergencyHubRegistration = [
  body('hub_id').isUUID().withMessage('Valid hub ID required'),
  body('crisis_event_id').isUUID().withMessage('Valid crisis event ID required'),
  body('volunteer_coordinator_id').optional().isUUID().withMessage('Valid coordinator ID required'),
  body('capacity_emergency').optional().isDecimal().withMessage('Valid emergency capacity required'),
  body('services_offered').optional().isArray().withMessage('Services offered must be an array'),
  body('emergency_contacts').optional().isObject().withMessage('Emergency contacts must be an object'),
  body('operating_schedule').optional().isObject().withMessage('Operating schedule must be an object')
];

const validateVolunteerCoordination = [
  body('crisis_event_id').isUUID().withMessage('Valid crisis event ID required'),
  body('volunteer_assignments').optional().isArray().withMessage('Volunteer assignments must be an array'),
  body('emergency_tasks').optional().isArray().withMessage('Emergency tasks must be an array')
];

const validateEmergencyCommunication = [
  body('crisis_event_id').isUUID().withMessage('Valid crisis event ID required'),
  body('message').isLength({ min: 10, max: 500 }).withMessage('Message must be between 10 and 500 characters'),
  body('target_audience').isIn(['all', 'hub_owners', 'couriers', 'customers', 'affected_areas']).withMessage('Invalid target audience'),
  body('priority_level').optional().isIn(['low', 'medium', 'high', 'critical']).withMessage('Invalid priority level'),
  body('communication_type').optional().isIn(['general', 'evacuation', 'supply_update', 'safety_alert']).withMessage('Invalid communication type')
];

// @desc    Activate crisis mode
// @route   POST /api/crisis/activate
// @access  Private (Admin)
router.post('/activate', authenticate, authorize('admin'), validateCrisisActivation, CrisisController.activateCrisisMode);

// @desc    Register emergency hub
// @route   POST /api/crisis/emergency-hub/register
// @access  Private (Hub Owner, Admin)
router.post('/emergency-hub/register', authenticate, authorize('hub_owner', 'admin'), validateEmergencyHubRegistration, CrisisController.registerEmergencyHub);

// @desc    Get available emergency hubs
// @route   GET /api/crisis/emergency-hubs/available
// @access  Public
router.get('/emergency-hubs/available', [
  query('crisis_event_id').optional().isUUID().withMessage('Valid crisis event ID required'),
  query('latitude').optional().isDecimal().withMessage('Valid latitude required'),
  query('longitude').optional().isDecimal().withMessage('Valid longitude required'),
  query('radius').optional().isDecimal({ decimal_digits: '0,2' }).withMessage('Valid radius required')
], CrisisController.getAvailableEmergencyHubs);

// @desc    Coordinate volunteers
// @route   POST /api/crisis/volunteers/coordinate
// @access  Private (Admin)
router.post('/volunteers/coordinate', authenticate, authorize('admin'), validateVolunteerCoordination, CrisisController.coordinateVolunteers);

// @desc    Emergency communication broadcast
// @route   POST /api/crisis/communication/broadcast
// @access  Private (Admin)
router.post('/communication/broadcast', authenticate, authorize('admin'), validateEmergencyCommunication, CrisisController.emergencyCommunicationBroadcast);

// @desc    Get crisis status
// @route   GET /api/crisis/status
// @access  Public
router.get('/status', CrisisController.getCrisisStatus);

// @desc    Deactivate crisis mode
// @route   POST /api/crisis/:crisis_event_id/deactivate
// @access  Private (Admin)
router.post('/:crisis_event_id/deactivate', authenticate, authorize('admin'), validateUUID('crisis_event_id'), [
  body('resolution_details').optional().isLength({ max: 1000 }).withMessage('Resolution details cannot exceed 1000 characters'),
  body('final_metrics').optional().isObject().withMessage('Final metrics must be an object')
], CrisisController.deactivateCrisisMode);

module.exports = router;
