from flask import Flask
from events import socketio

"""
Imports for Web-Viewer
"""
from home import home_blueprint
from viewer import viewer_blueprint

def create_app():
    app = Flask(__name__)
    socketio.init_app(app)
    
    app.config["SECRET_KEY"] = "development"
    
    app.register_blueprint(home_blueprint)
    app.register_blueprint(viewer_blueprint)
    return app
