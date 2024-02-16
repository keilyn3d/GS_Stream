"""
Imports for Web-Viewer
"""
from flask import Flask, render_template, request, session, redirect, url_for
import os

from home import home_blueprint
from events import socketio

app = Flask(__name__)
app.config["SECRET_KEY"] = "development"
app.register_blueprint(home_blueprint)

socketio.init_app(app)

@app.route("/viewer")
def viewer():
    code = session.get("code")
    if code is None or session.get("name") is None:
        return redirect(url_for("home"))

    return render_template("viewer.html")


if __name__ == '__main__':
    config_path = os.getenv('GS_CONFIG_PATH', './output/5526b40b-d/point_cloud/iteration_30000/config.yaml')
    host = os.getenv('GS_HOST', '127.0.0.1')
    debug = os.getenv('GS_DEBUG', 'false').lower() == 'true'
    socketio.run(app, host=host, debug=debug, allow_unsafe_werkzeug=True)
