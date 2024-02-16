from flask import Blueprint, render_template, session, redirect, url_for

viewer_blueprint = Blueprint('viewer', __name__)

@viewer_blueprint.route("/viewer")
def viewer():
    code = session.get("code")
    if code is None or session.get("name") is None:
        return redirect(url_for("home"))

    return render_template("viewer.html")
