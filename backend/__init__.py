from flask import Flask
from flask_cors import CORS

from .api.routes import api_blueprint

from flask_socketio import SocketIO
from .socketio.events import configure_socketio

def create_app():
    app = Flask(__name__)
    app.config["SECRET_KEY"] = "development"
    CORS(app)
   
    # REST API 라우트 설정
    app.register_blueprint(api_blueprint, url_prefix='/api')
    
    socketio = SocketIO(app, cors_allowed_origins="*")
    configure_socketio(socketio)

    return app, socketio
