import io
import os

import numpy as np
from ..model_config.model_config_fetcher import get_model_init_pose_data
from render_wrapper import DummyCamera, GS_Model
import camera_pos_utils as camera


config_path = os.getenv('GS_CONFIG_PATH', '/home/cviss/PycharmProjects/GS_Stream/output/dab812a2-1/point_cloud'
                                              '/iteration_30000/config.yaml')
model = GS_Model(config_path=config_path)

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
    R_mat, T_vec = get_model_init_pose_data()
    R, T = get_initial_camera_pose(R_mat, T_vec)  # Calculate the camera pose
    cam = configure_camera(R, T)  # Configure the camera
    init_img_data = render_model_image(cam, model)  # Render and save the model image
    
    return init_img_data
