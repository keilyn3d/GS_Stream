import base64
from flask_socketio import SocketIO, emit
from ..image_renderer.image_creator import get_model_init_image

user_name = ''

def configure_socketio(socketio: SocketIO):
    @socketio.on('connect')
    def handle_connect():
        print('Client connected')
        emit('response', {'message': 'Connected to server'})                
        
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
        print(f'User {user_name} has disconnected.')
        
    @socketio.on('get_init_image')
    def handle_get_init_image(model_id):
        init_image = get_model_init_image()
        init_image.seek(0)
        base64_img = base64.b64encode(init_image.read()).decode('utf-8')
        emit('set_client_init_image', base64_img)

    @socketio.on('custom_event')
    def handle_custom_event(data):
        print('Received custom event:', data)
        emit('response', {'message': 'Received your custom event'})


# @socketio.on("nnImgClick")
# def nn_img_click(data):
#     pass
    
# @socketio.on('key_control')
# def key_control(data):
#     pass
    
# @socketio.on('my_event')
# def handle_message(data):
#     pass
    
# @socketio.on("connect")
# def connect():
#     pass
    
# @socketio.on("pose_reset")
# def image_reset():
#     pass
    
# @socketio.on("disconnect")
# def disconnect():
#     pass    