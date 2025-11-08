import os
from flask import Flask
from app.extensions import db, cors
from app.config import config


def create_app(config_name=None):
    if config_name is None:
        config_name = os.environ.get('FLASK_ENV', 'development')

    app = Flask(__name__)
    app.config.from_object(config[config_name])

    os.makedirs(config[config_name].INSTANCE_PATH, exist_ok=True)

    db.init_app(app)

    # Configure CORS
    cors_origins = app.config['CORS_ORIGINS']
    if cors_origins == '*':
        cors.init_app(app)
    else:
        cors.init_app(app,
            resources={r"/api/*": {"origins": cors_origins}},
            supports_credentials=True,
            allow_headers=["Content-Type", "Authorization"],
            methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"]
        )

    from app.routes import register_blueprints
    register_blueprints(app)

    with app.app_context():
        db.create_all()

    return app