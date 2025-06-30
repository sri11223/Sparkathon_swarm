def validate_request_data(data, required_fields):
    """
    Validate that request data contains all required fields
    """
    if not data:
        return {'error': 'No data provided', 'success': False}
    
    missing_fields = [field for field in required_fields if field not in data]
    if missing_fields:
        return {
            'error': f'Missing required fields: {", ".join(missing_fields)}',
            'success': False
        }
    
    return None

def generate_response(success=True, data=None, message="", error=None):
    """
    Generate standardized API response
    """
    response = {
        'success': success,
        'message': message,
        'timestamp': __import__('datetime').datetime.utcnow().isoformat()
    }
    
    if data is not None:
        response['data'] = data
    
    if error:
        response['error'] = error
    
    return response

def calculate_distance(point1, point2):
    """
    Calculate Euclidean distance between two points
    """
    import math
    return math.sqrt((point1[0] - point2[0])**2 + (point1[1] - point2[1])**2)

def format_coordinates(lat, lng):
    """
    Format coordinates for consistent usage
    """
    return {
        'latitude': round(float(lat), 6),
        'longitude': round(float(lng), 6)
    }

def calculate_estimated_time(distance_km, avg_speed_kmh=50):
    """
    Calculate estimated travel time
    """
    if distance_km <= 0:
        return 0
    
    time_hours = distance_km / avg_speed_kmh
    return round(time_hours * 60, 2)  # Return in minutes

def generate_unique_id():
    """
    Generate unique ID for tracking purposes
    """
    import uuid
    return str(uuid.uuid4())

class ValidationError(Exception):
    """Custom validation error class"""
    pass

class OptimizationError(Exception):
    """Custom optimization error class"""
    pass
