from flask import Flask
import os
import logging

# Try to import optional dependencies
try:
    from flask_cors import CORS
    has_cors = True
except ImportError:
    has_cors = False

try:
    from dotenv import load_dotenv
    load_dotenv()
except ImportError:
    pass

# Import blueprints (simplified for now)
try:
    from warehouse_optimization.routes import warehouse_bp
    from truck_loading_optimization.routes import truck_bp
    from route_optimization.routes import route_bp
    from demand_prediction.routes import demand_bp
    blueprints_available = True
except ImportError:
    blueprints_available = False

def create_app():
    app = Flask(__name__)
    
    # Configuration
    app.config['DEBUG'] = os.getenv('FLASK_ENV', 'development') == 'development'
    app.config['SECRET_KEY'] = os.getenv('SECRET_KEY', 'dev-secret-key-change-in-production')
    
    # CORS setup (if available)
    if has_cors:
        CORS(app, origins=os.getenv('FRONTEND_URLS', 'http://localhost:3000,http://localhost:19006').split(','))
    
    # Logging setup
    logging.basicConfig(
        level=logging.INFO,
        format='%(asctime)s %(levelname)s: %(message)s [in %(pathname)s:%(lineno)d]'
    )
    
    # Register blueprints (if available)
    if blueprints_available:
        app.register_blueprint(warehouse_bp, url_prefix='/api/warehouse')
        app.register_blueprint(truck_bp, url_prefix='/api/truck')
        app.register_blueprint(route_bp, url_prefix='/api/route')
        app.register_blueprint(demand_bp, url_prefix='/api/demand')
    
    # Health check endpoint
    @app.route('/health')
    def health_check():
        return {
            'status': 'OK',
            'service': 'SwarmFill AI Services',
            'version': '1.0.0',
            'dependencies': {
                'flask_cors': has_cors,
                'blueprints': blueprints_available
            }
        }
    
    # Root endpoint
    @app.route('/')
    def root():
        endpoints = {
            'health': '/health'
        }
        
        if blueprints_available:
            endpoints.update({
                'warehouse_optimization': '/api/warehouse',
                'truck_loading': '/api/truck',
                'route_optimization': '/api/route',
                'demand_prediction': '/api/demand'
            })
        
        return {
            'message': 'SwarmFill AI Services API',
            'version': '1.0.0',
            'status': 'Running without full ML dependencies' if not blueprints_available else 'Fully operational',
            'endpoints': endpoints
        }
    
    return app

if __name__ == '__main__':
    app = create_app()
    port = int(os.getenv('PORT', 5000))
    app.run(host='0.0.0.0', port=port, debug=True)
