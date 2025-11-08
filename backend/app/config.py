import os
from pathlib import Path
from dotenv import load_dotenv

basedir = Path(__file__).parent.parent
load_dotenv(basedir / '.env')


class Config:
    """Base configuration class"""
    SECRET_KEY = os.environ.get('SECRET_KEY')
    if not SECRET_KEY:
        if os.environ.get('FLASK_ENV') == 'production':
            raise RuntimeError("SECRET_KEY environment variable not set in production environment")
        else:
            SECRET_KEY = 'dev-secret-key-change-in-production'

    # Fix Heroku's postgres:// URL to postgresql:// for SQLAlchemy
    DATABASE_URL = os.environ.get('DATABASE_URL')
    if DATABASE_URL and DATABASE_URL.startswith('postgres://'):
        DATABASE_URL = DATABASE_URL.replace('postgres://', 'postgresql://', 1)
    SQLALCHEMY_DATABASE_URI = DATABASE_URL or f'sqlite:///{basedir / "instance" / "app.db"}'

    SQLALCHEMY_TRACK_MODIFICATIONS = False

    INSTANCE_PATH = os.path.join(basedir, 'instance')

    CORS_ORIGINS = os.environ.get('CORS_ORIGINS')
    if not CORS_ORIGINS:
        if os.environ.get('FLASK_ENV') == 'production':
            raise RuntimeError("CORS_ORIGINS environment variable not set in production environment")
        else:
            CORS_ORIGINS = '*'

    GOOGLE_CLIENT_ID = os.environ.get('GOOGLE_CLIENT_ID')
    GOOGLE_REDIRECT_URI = os.environ.get('GOOGLE_REDIRECT_URI', 'http://localhost:5173')

class DevelopmentConfig(Config):
    """Development configuration"""
    DEBUG = True


class ProductionConfig(Config):
    """Production configuration"""
    DEBUG = False


class TestingConfig(Config):
    """Testing configuration"""
    TESTING = True
    DEBUG = True
    SQLALCHEMY_DATABASE_URI = 'sqlite:///:memory:'


# Configuration dictionary
config = {
    'development': DevelopmentConfig,
    'production': ProductionConfig,
    'testing': TestingConfig,
    'default': DevelopmentConfig
}