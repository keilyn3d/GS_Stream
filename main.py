"""
Imports for Web-Viewer
"""
from flask import Flask
import os

from home import home_blueprint
from viewer import viewer_blueprint
from events import socketio

app = Flask(__name__)
app.config["SECRET_KEY"] = "development"
app.register_blueprint(home_blueprint)
app.register_blueprint(viewer_blueprint)
socketio.init_app(app)


if __name__ == '__main__':
    config_path = os.getenv('GS_CONFIG_PATH', './output/5526b40b-d/point_cloud/iteration_30000/config.yaml')
    host = os.getenv('GS_HOST', '127.0.0.1')
    debug = os.getenv('GS_DEBUG', 'false').lower() == 'true'
    socketio.run(app, host=host, debug=debug, allow_unsafe_werkzeug=True)
