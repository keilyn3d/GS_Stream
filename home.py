from flask import Blueprint, render_template, request, session, redirect, url_for

"""
Import to load GS_Model from render_wrapper.py
"""
import camera_pos_utils as camera
import numpy as np

home_blueprint = Blueprint('home', __name__)

@home_blueprint.route('/', methods=["POST", "GET"])
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