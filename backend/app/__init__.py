import os
from flask import Flask
from flask_socketio import SocketIO
from flask_cors import CORS

from .api.routes import api_blueprint
from .api.health import health_blueprint
from .socketio.events import configure_socketio

def configure_app(app):
    app.config["SECRET_KEY"] = os.getenv('SECRET_KEY', 'default_secret_key')

def configure_routes(app):
    app.register_blueprint(api_blueprint, url_prefix='/api')
    app.register_blueprint(health_blueprint, url_prefix='/health')

def create_app():
    app = Flask(__name__)
    CORS(app)

    configure_app(app)
    configure_routes(app)

    socketio = SocketIO(app, cors_allowed_origins="*")
    configure_socketio(socketio)

    return app, socketio
