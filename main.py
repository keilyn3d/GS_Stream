"""
Imports for Web-Viewer
"""
from flask import Flask, render_template, request, session, redirect, url_for
from flask_socketio import join_room, leave_room, send, SocketIO

from render_wrapper import DummyCamera, GS_Model

"""
Import to load GS_Model from render_wrapper.py
"""
import camera_pos_utils as camera
import io
import numpy as np
import torch

# Load environment variables
import os

# Set up logging
import logging

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

from events import socketio

app = Flask(__name__)
app.config["SECRET_KEY"] = "development"
socketio.init_app(app)


"""
Available models (scenes) that we can load
"""
idxs = {1, 2, 3}
model_1 = []

# Store init values of pose and img_data to reset
init_pose_for_reset = None
init_img_data = None


@app.route('/', methods=["POST", "GET"])
def home():
    session.clear()
    if request.method == "POST":
        name = request.form.get("name")
        code = request.form.get("code")
        join = request.form.get("join", False)  # see if they pressed it

        # Basic Error Checking
        if not name and not code:
            return render_template("home.html", error="Please enter email and model index.", code=code, name=name)
        elif not name:
            return render_template("home.html", error="Please enter email.", code=code, name=name)
        else:
            if not code:
                return render_template("home.html", error="Please enter model index.", code=code, name=name)

        if code == "1":
            R_mat = np.array([[-0.70811329, -0.21124761, 0.67375813],
                              [0.16577646, 0.87778949, 0.4494483],
                              [-0.68636268, 0.42995355, -0.58655453]])
            T_vec = np.array([-0.32326042, -3.65895232, 2.27446875])

            init_pose = camera.compose_44(R_mat, T_vec)
        else:
            init_pose = np.eye(4)

        session["name"] = name
        session["code"] = code
        session["pose"] = init_pose.tolist()

        global init_pose_for_reset
        init_pose_for_reset = init_pose

        return redirect(url_for("viewer"))

    return render_template("home.html")


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
    model_1 = GS_Model(config_path=config_path)

    socketio.run(app, host=host, debug=debug, allow_unsafe_werkzeug=True)
