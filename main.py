"""
Imports for Web-Viewer
"""
from flask import Flask, render_template, request, session, redirect, url_for

"""
Import to load GS_Model from render_wrapper.py
"""
import camera_pos_utils as camera
import numpy as np

# Load environment variables
import os

from events import socketio

app = Flask(__name__)
app.config["SECRET_KEY"] = "development"
socketio.init_app(app)


@app.route('/', methods=["POST", "GET"])
def home():
    session.clear()
    if request.method == "POST":
        name = request.form.get("name")
        code = request.form.get("code")

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
    socketio.run(app, host=host, debug=debug, allow_unsafe_werkzeug=True)
