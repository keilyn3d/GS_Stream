from flask_socketio import join_room, leave_room, send, SocketIO
import logging
import camera_pos_utils as camera
from flask import session
import numpy as np
from render_wrapper import DummyCamera, GS_Model
import os
import torch
import io

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

socketio = SocketIO()

config_path = os.getenv('GS_CONFIG_PATH', '/home/cviss/PycharmProjects/GS_Stream/output/dab812a2-1/point_cloud'
                                              '/iteration_30000/config.yaml')
model_1 = GS_Model(config_path=config_path)


# Store init values of pose and img_data to reset
init_img_data = None
idxs = {1, 2, 3}


@socketio.on("nnImgClick")
def nn_img_click(data):
    """
    When user clicks on one of the closest images...
    Load a higher resolution image and send it to the viewport
    """
    code = session.get("code")
    name = session.get("name")

    """
    Set Model by code
    """
    if int(code) == 1:
        model = model_1

    filename = data["filename"]

    with open(os.path.join(model.images_files, filename), 'rb') as f:
        img_data = f.read()
    socketio.emit("img1", {'image': img_data})

    # Set the pose as the nearest_img clicked
    pose = model.images.get_pose_by_filename(filename)
    session["pose"] = pose.tolist()


@socketio.on('key_control')
def key_control(data):
    """
    key_control listens for button presses from the client...

    If key pressed is " " (spacebar) then...
    1. get the closest images and send them to the client

    If key pressed is qweasduiojkl then...
    1. then calculates a new pose
    2. get new view using gaussian splatting
    3. emit the image to the server

    :param key: keyboard input
    :return:
    """
    key = data.get('key')
    step = data.get('step')
    
    code = session.get("code")
    name = session.get("name")
    pose = session.get("pose")
    pose = np.array(pose)
    logging.info(f'{name} pressed {key} in model {code}, by {step} steps')

    """
    Set Model by code
    """
    if int(code) == 1:
        model = model_1

    """
    When the user presses space-bar refresh the closest images...
    """
    if key == " ":
        filenames = model.images.get_closest_n(pose=pose, n=3)
        print("The closest images are: " + ', '.join(str(x) for x in filenames))
        filepath = model.images_thumbnails
        for counter, file in enumerate(filenames):
            with open(os.path.join(filepath, file), 'rb') as f:
                img_data = f.read()
            # Emit the image to topic img1
            socketio.emit("nnImg_" + str(counter + 1), {'image': img_data, 'filename': file})

    """
    SIBR Viewer Controls
    
    Right-Hand Camera Rotations j,l (rot around y), i,k (rotation around x), u,o (rotation around z)
    Left-Hand Camera Translation: a,d (left right), e,f (forward back), q,e (up down)
    We should also handle pressing multiple keys at the same time...
    """

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

    img1 = model.render_view(cam=cam)

    torch.cuda.empty_cache()  # This should be done periodically... (not everytime)
    img_data = io.BytesIO()  # This is probably also not very efficient
    img1.save(img_data, "JPEG")

    # Emit the image to topic img1
    socketio.emit("img1", {'image': img_data.getvalue()})
    pose = cam.get_new_pose()
    session["pose"] = pose.tolist()  # This might be slow


@socketio.on('my_event')
def handle_message(data):
    print('received message', data)


@socketio.on("connect")
def connect():
    """
    Socket connection event handler
    Gets the code (model index) and name (email) of the requester.
    :return:
    """
    code = session.get("code")
    name = session.get("name")
    pose = session.get("pose")

    logger.info(f'connect(): User {name} has requested model {code}.')

    if not code or not name:
        return
    # TODO: make error checking code more robust
    if int(code) not in idxs:
        return

    R, T = camera.decompose_44(np.array(pose))
    cam = DummyCamera(R=R, T=T, W=800, H=600, FoVx=1.4261863218, FoVy=1.150908963)

    if int(code) == 1:
        model = model_1

    img1 = model.render_view(cam=cam)
    global init_img_data
    init_img_data = io.BytesIO()
    img1.save(init_img_data, "JPEG")

    # Send an initial (placeholder) image to canvas 1
    socketio.emit("img1", {'image': init_img_data.getvalue()})


@socketio.on("pose_reset")
def image_reset():
    logger.info("Pose reset to initial configuration.")

    code = session.get("code")
    
    if code == "1":
        R_mat = np.array([[-0.70811329, -0.21124761, 0.67375813],
                            [0.16577646, 0.87778949, 0.4494483],
                            [-0.68636268, 0.42995355, -0.58655453]])
        T_vec = np.array([-0.32326042, -3.65895232, 2.27446875])

        init_pose = camera.compose_44(R_mat, T_vec)
    else:
        init_pose = np.eye(4)
    
    session["code"] = code
    session["name"] = session.get("name")
    session["pose"] = init_pose.tolist()

    # Send an initial (placeholder) image to canvas 1
    global init_img_data
    socketio.emit("img1", {'image': init_img_data.getvalue()})


@socketio.on("disconnect")
def disconnect():
    name = session.get("name")
    print(f'User {name} has disconnected.')
