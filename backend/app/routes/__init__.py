from app.routes.health_routes import health_bp
from app.routes.user_routes import user_bp
from app.routes.driver_routes import driver_bp
from app.routes.ride_routes import ride_bp
from app.routes.organization_routes import organization_bp
from app.routes.review_routes import review_bp

def register_blueprints(app):
    """
    Register all Flask blueprints with the application.

    Args:
        app: The Flask application instance
    """
    app.register_blueprint(health_bp, url_prefix='/api')
    app.register_blueprint(user_bp, url_prefix='/api')
    app.register_blueprint(driver_bp, url_prefix='/api')
    app.register_blueprint(ride_bp, url_prefix='/api')
    app.register_blueprint(organization_bp, url_prefix='/api')
    app.register_blueprint(review_bp, url_prefix='/api')