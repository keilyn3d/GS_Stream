import base64
from flask import request
from flask_socketio import SocketIO, emit
from ..image_renderer.image_creator import get_model_init_image, get_model_init_pose, get_model_image, get_model_changed_pose

user_name = ''
user_states = {}

def configure_socketio(socketio: SocketIO):
    @socketio.on('connect')
    def handle_connect():
        user_states[request.sid] = { 'connected': True }
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
        print(f'Message to {user_name}: get_init_image')
        emit('set_client_init_image', base64_img)

    @socketio.on('key_control')
    def key_control(data):      
        key, step = data['key'], data['step']
        print(f'Key:{key}, Step:{step} are recieved from User:{user_name}')
        current_pose = user_states[request.sid]['current_pose']
        image = get_model_image(current_pose, key, step)
        base64_img = make_base64_img(image)
        
        current_pose = user_states[request.sid]['current_pose']
        user_states[request.sid]['current_pose'] = get_model_changed_pose(current_pose, key, step)

        print(f'Message to {user_name}: set_client_main_image')
        emit('set_client_main_image', base64_img)

    def make_base64_img(image):
        image.seek(0)
        base64_img = base64.b64encode(image.read()).decode('utf-8')
        return base64_img
    
    @socketio.on('custom_event')
    def handle_custom_event(data):
        print('Received custom event:', data)
        emit('response', {'message': 'Received your custom event'})


# @socketio.on("nnImgClick")
# def nn_img_click(data):
#     pass
    

    
# @socketio.on('my_event')
# def handle_message(data):
#     pass
    
# @socketio.on("connect")
# def connect():
#     pass
    

    
# @socketio.on("disconnect")
# def disconnect():
#     pass    