import io
import os

import numpy as np
from ..model_config.model_config_fetcher import get_model_init_pose_raw_data
from .render_wrapper import DummyCamera, GS_Model
from . import camera_pos_utils as camera

config_path = os.getenv('GS_CONFIG_PATH', '/home/cviss/PycharmProjects/GS_Stream/output/dab812a2-1/point_cloud'
                                              '/iteration_30000/config.yaml')
model = GS_Model(config_path=config_path)


def get_model_init_pose():
    R_mat, T_vec = get_model_init_pose_raw_data()
    init_pose = camera.compose_44(R_mat, T_vec)
    return init_pose

def get_model_pose(R_mat, T_vec):
    init_pose = camera.compose_44(R_mat, T_vec)
    return init_pose

def get_initial_camera_pose(R_mat, T_vec):
    init_pose = camera.compose_44(R_mat, T_vec)
    R, T = camera.decompose_44(np.array(init_pose))
    return R, T

def configure_camera(R, T, width=800, height=600, fovx=1.4261863218, fovy=1.150908963):
    return DummyCamera(R=R, T=T, W=width, H=height, FoVx=fovx, FoVy=fovy)

def render_model_image(camera, model):
    # Render the model image using the provided camera
    pil_image = model.render_view(camera)
    image_data = io.BytesIO()
    pil_image.save(image_data, "JPEG")
    image_data.seek(0)  # Move the cursor to the initial position for reading the image data
    return image_data

def get_model_init_image():
    R_mat, T_vec = get_model_init_pose_raw_data()
    R, T = get_initial_camera_pose(R_mat, T_vec)  # Calculate the camera pose
    cam = configure_camera(R, T)  # Configure the camera
    init_img_data = render_model_image(cam, model)  # Render and save the model image
    
    return init_img_data

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
    cam = DummyCamera(R=R, T=T, W=800, H=600, FoVx=1.4261863218, FoVy=1.150908963, C2C_Rot=C2C_Rot, C2C_T=C2C_T)
    return cam

def get_model_image(pose, key, step):
    cam = get_changed_cam(pose, key, step)
    img_data = render_model_image(cam, model)  # Render and save the model image  
    return img_data

def get_model_changed_pose(pose, key, step):
    cam = get_changed_cam(pose, key, step)
    return cam.get_new_pose()


    # img1 = model.render_view(cam=cam)

    # torch.cuda.empty_cache()  # This should be done periodically... (not everytime)
    # img_data = io.BytesIO()  # This is probably also not very efficient
    # img1.save(img_data, "JPEG")

    # # Emit the image to topic img1
    # socketio.emit("img1", {'image': img_data.getvalue()})
    # pose = cam.get_new_pose()
    # session["pose"] = pose.tolist()  # This might be slow
        