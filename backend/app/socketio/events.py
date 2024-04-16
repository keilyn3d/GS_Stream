import base64
from flask import request
from flask_socketio import SocketIO, emit
from ..image_renderer.image_creator import *
from ..image_renderer.render_wrapper import decompose_44
import logging

user_name = ''
user_states = {}

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)


def configure_socketio(socketio: SocketIO):
    @socketio.on('connect')
    def handle_connect():
        user_states[request.sid] = {'connected': True}
        print(f'Client connected: {request.sid}')
        set_user_init_pose()
        emit('response', {'message': 'Connected to server'})

    def set_user_init_pose():
        user_states[request.sid]['init_pose'] = get_model_init_pose()
        user_states[request.sid]['current_pose'] = get_model_init_pose()

    @socketio.on('set_user_name')
    def handle_get_user_name(name):
        global user_name
        if name is not None:
            user_name = name
            print(f'User:\'{user_name}\' connected')
            emit('response', {'message': 'Setting User Name', 'userName': user_name})
        else:
            print("Data is None")
            emit('response', {'message': 'Data is None'})

    @socketio.on('disconnect')
    def handle_disconnect():
        del user_states[request.sid]
        print(f'User {user_name} has disconnected.')

    @socketio.on('get_init_image')
    def handle_get_init_image(model_id):
        init_image = get_model_init_image()
        base64_img = make_base64_img(init_image)
        print(f'Message to {user_name} for {model_id} model: get_init_image')
        emit('set_client_init_image', base64_img)

    @socketio.on('reset_pose')
    def handle_reset_pose(model_id):
        user_states[request.sid]['current_pose'] = user_states[request.sid]['init_pose']
        print(f'Reset pose for User:{user_name} for {model_id} model')
        emit('response', {'message': 'Pose reset'})

    @socketio.on('key_control')
    def key_control(data):
        key, step = data['key'], data['step']
        print(f'Key:{key}, Step:{step} are recieved from User:{user_name}')
        current_pose = user_states[request.sid]['current_pose']
        if key == ' ':
            handle_space_key(current_pose)
        else:
            handle_other_keys(key, step, current_pose)
            calculate_altitude(current_pose)


def calculate_altitude(current_pose):
    R, T = decompose_44(np.array(current_pose))
    altitude, heading = model.get_flight_params(R, T)
    logging.info(f'Altitude: {altitude} and Heading: {heading}')
    emit("flight_params", {'altitude': altitude, 'heading': heading})


def handle_space_key(current_pose):
    filenames = model.images.get_closest_n(pose=current_pose, n=3)
    print("The closest images are: " + ', '.join(str(x) for x in filenames))
    closest_images = {}
    filepath = model.images_thumbnails
    for file in filenames:
        with open(os.path.join(filepath, file), 'rb') as f:
            img_data = f.read()
            # Encode img_data to base64
            closest_images[file] = base64.b64encode(img_data).decode('utf-8')
    emit("nnImg", closest_images)


def handle_other_keys(key, step, current_pose):
    image = get_model_image(current_pose, key, step)
    base64_img = make_base64_img(image)
    user_states[request.sid]['current_pose'] = get_model_changed_pose(current_pose, key, step)
    print(f'Message to {user_name}: set_client_main_image')
    emit('set_client_main_image', base64_img)


def make_base64_img(image):
    image.seek(0)
    base64_img = base64.b64encode(image.read()).decode('utf-8')
    return base64_img
