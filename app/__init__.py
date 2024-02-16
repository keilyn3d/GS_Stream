from flask import Flask

"""
Imports for Web-Viewer
"""
from .blueprints.home import home_blueprint
from .blueprints.viewer import viewer_blueprint
from .events.viewer_event import socketio

def create_app():
    app = Flask(__name__)
    socketio.init_app(app)
    
    app.config["SECRET_KEY"] = "development"
    
    app.register_blueprint(home_blueprint)
    app.register_blueprint(viewer_blueprint)
    
    return app
