from app.routes.health_routes import health_bp

def register_blueprints(app):
    app.register_blueprint(health_bp, url_prefix='/api')