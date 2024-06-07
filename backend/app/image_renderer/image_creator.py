import numpy as np
from .render_wrapper import DummyCamera
from . import camera_pos_utils as camera
import logging

def configure_camera(R, T, width=800, height=600, fovx=1.4261863218, fovy=1.150908963):
    return DummyCamera(R=R, T=T, W=width, H=height, FoVx=fovx, FoVy=fovy)

def get_changed_cam(pose, key, step):
    # Calculate the new pose
    if key == "d":
        C2C_T = camera.translate4(-0.1 * step, 0, 0)
    elif key == "a":
        C2C_T = camera.translate4(0.1 * step, 0, 0)
    elif key == "s":
        C2C_T = camera.translate4(0, 0, 0.1 * step)
    elif key == "w":
        C2C_T = camera.translate4(0, 0, -0.1 * step)
    elif key == "e":
        C2C_T = camera.translate4(0, 0.1 * step, 0)
    elif key == "q":
        C2C_T = camera.translate4(0, -0.1 * step, 0)
    else:
        C2C_T = np.eye(4, dtype=np.float32)

    if key == "j":
        C2C_Rot = camera.rotate4(np.radians(1 * step), 0, 1, 0)
    elif key == "l":
        C2C_Rot = camera.rotate4(np.radians(-1 * step), 0, 1, 0)
    elif key == "k":
        C2C_Rot = camera.rotate4(np.radians(1 * step), 1, 0, 0)
    elif key == "i":
        C2C_Rot = camera.rotate4(np.radians(-1 * step), 1, 0, 0)
    elif key == "u":
        C2C_Rot = camera.rotate4(np.radians(1 * step), 0, 0, 1)
    elif key == "o":
        C2C_Rot = camera.rotate4(np.radians(-1 * step), 0, 0, 1)
    else:
        C2C_Rot = np.eye(4, dtype=np.float32)
        
    # Decompose the current pose
    R, T = camera.decompose_44(np.array(pose))
    logging.info(f"R: {R}, T: {T}")
    cam = DummyCamera(R=R, T=T, W=800, H=600, FoVx=1.4261863218, FoVy=1.150908963, C2C_Rot=C2C_Rot, C2C_T=C2C_T)
    return cam
