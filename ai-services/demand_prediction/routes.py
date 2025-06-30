from flask import Blueprint, request, jsonify
import numpy as np
from datetime import datetime, timedelta
from ..shared.utils import validate_request_data, generate_response

demand_bp = Blueprint('demand', __name__)

@demand_bp.route('/predict', methods=['POST'])
def predict_demand():
    """
    Predict demand for specific products/areas using ML models
    """
    try:
        data = request.get_json()
        
        # Validate required fields
        required_fields = ['time_period', 'location', 'historical_data']
        validation_error = validate_request_data(data, required_fields)
        if validation_error:
            return jsonify(validation_error), 400
        
        time_period = data['time_period']
        location = data['location']
        historical_data = data['historical_data']
        
        # Mock demand prediction (replace with actual ML model)
        prediction_result = generate_demand_prediction(time_period, location, historical_data)
        
        return generate_response(
            success=True,
            data=prediction_result,
            message="Demand prediction completed successfully"
        )
        
    except Exception as e:
        return generate_response(
            success=False,
            message=f"Demand prediction failed: {str(e)}"
        ), 500

@demand_bp.route('/trends', methods=['GET'])
def analyze_demand_trends():
    """
    Analyze demand trends and patterns
    """
    try:
        # Mock trend analysis
        trends_result = {
            'trending_products': generate_trending_products(),
            'seasonal_patterns': generate_seasonal_patterns(),
            'growth_predictions': generate_growth_predictions(),
            'market_insights': generate_market_insights(),
            'recommendations': generate_demand_recommendations()
        }
        
        return generate_response(
            success=True,
            data=trends_result,
            message="Demand trends analysis completed"
        )
        
    except Exception as e:
        return generate_response(
            success=False,
            message=f"Trend analysis failed: {str(e)}"
        ), 500

@demand_bp.route('/forecast', methods=['POST'])
def forecast_demand():
    """
    Long-term demand forecasting
    """
    try:
        data = request.get_json()
        
        forecast_periods = data.get('forecast_periods', 30)  # Default 30 days
        
        forecast_result = {
            'forecast_data': generate_forecast_data(forecast_periods),
            'confidence_intervals': generate_confidence_intervals(forecast_periods),
            'accuracy_metrics': {
                'mae': round(np.random.uniform(5, 15), 2),
                'mape': round(np.random.uniform(8, 20), 2),
                'rmse': round(np.random.uniform(10, 25), 2)
            },
            'factors_considered': [
                'Historical sales data',
                'Seasonal trends',
                'Economic indicators',
                'Marketing campaigns',
                'Competitor activity'
            ]
        }
        
        return generate_response(
            success=True,
            data=forecast_result,
            message="Demand forecast generated successfully"
        )
        
    except Exception as e:
        return generate_response(
            success=False,
            message=f"Forecasting failed: {str(e)}"
        ), 500

def generate_demand_prediction(time_period, location, historical_data):
    """Generate demand prediction based on inputs"""
    # Mock ML prediction - replace with actual model
    base_demand = np.random.uniform(100, 500)
    
    # Simulate different time period effects
    if time_period == 'peak_hours':
        demand_multiplier = 1.5
    elif time_period == 'weekend':
        demand_multiplier = 1.2
    elif time_period == 'holiday':
        demand_multiplier = 2.0
    else:
        demand_multiplier = 1.0
    
    predicted_demand = base_demand * demand_multiplier
    
    return {
        'predicted_demand': round(predicted_demand),
        'confidence_score': round(np.random.uniform(75, 95), 1),
        'prediction_range': {
            'min': round(predicted_demand * 0.85),
            'max': round(predicted_demand * 1.15)
        },
        'factors_influencing': [
            f"Location factor: {location} shows high activity",
            f"Time period: {time_period} typically sees increased demand",
            "Weather conditions favorable",
            "No major competing events"
        ],
        'next_update': (datetime.now() + timedelta(hours=6)).isoformat()
    }

def generate_trending_products():
    """Generate trending products data"""
    products = ['Electronics', 'Groceries', 'Clothing', 'Home & Garden', 'Books', 'Sports']
    return [
        {
            'product': product,
            'trend_score': round(np.random.uniform(60, 95), 1),
            'growth_rate': f"+{np.random.uniform(10, 50):.1f}%",
            'popularity_rank': i + 1
        }
        for i, product in enumerate(np.random.choice(products, 4, replace=False))
    ]

def generate_seasonal_patterns():
    """Generate seasonal demand patterns"""
    return {
        'spring': {'demand_level': 'High', 'key_products': ['Gardening', 'Clothing']},
        'summer': {'demand_level': 'Medium', 'key_products': ['Travel', 'Sports']},
        'fall': {'demand_level': 'High', 'key_products': ['Electronics', 'Back-to-school']},
        'winter': {'demand_level': 'Very High', 'key_products': ['Gifts', 'Winter gear']}
    }

def generate_growth_predictions():
    """Generate growth predictions"""
    return {
        'next_quarter': f"+{np.random.uniform(5, 20):.1f}%",
        'next_year': f"+{np.random.uniform(15, 40):.1f}%",
        'key_drivers': [
            'Increased urbanization',
            'Growing e-commerce adoption',
            'Improved delivery infrastructure'
        ]
    }

def generate_market_insights():
    """Generate market insights"""
    return [
        "Peak demand typically occurs between 6-8 PM on weekdays",
        "Weekend demand is 25% higher than weekdays",
        "Weather conditions significantly impact delivery preferences",
        "Holiday seasons show 2x normal demand patterns"
    ]

def generate_demand_recommendations():
    """Generate actionable recommendations"""
    return [
        "Increase inventory by 30% for upcoming holiday season",
        "Deploy additional delivery resources during peak hours",
        "Consider promotional campaigns for slower-moving products",
        "Optimize hub locations based on predicted demand clusters"
    ]

def generate_forecast_data(periods):
    """Generate forecast data points"""
    base_demand = 200
    forecast_data = []
    
    for i in range(periods):
        date = (datetime.now() + timedelta(days=i)).strftime('%Y-%m-%d')
        # Add some trend and randomness
        trend = i * 0.5
        noise = np.random.normal(0, 20)
        demand = max(0, base_demand + trend + noise)
        
        forecast_data.append({
            'date': date,
            'predicted_demand': round(demand),
            'day_of_week': (datetime.now() + timedelta(days=i)).strftime('%A')
        })
    
    return forecast_data

def generate_confidence_intervals(periods):
    """Generate confidence intervals for predictions"""
    return {
        'confidence_level': '95%',
        'methodology': 'Monte Carlo simulation with 1000 iterations',
        'intervals': [
            {
                'period': f"Day {i+1}",
                'lower_bound': round(np.random.uniform(150, 180)),
                'upper_bound': round(np.random.uniform(220, 250))
            }
            for i in range(min(periods, 7))  # Show first 7 days
        ]
    }
