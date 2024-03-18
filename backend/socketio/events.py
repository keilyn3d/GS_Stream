from flask_socketio import SocketIO, emit

def configure_socketio(socketio: SocketIO):
    @socketio.on('connect')
    def handle_connect():
        print('Client connected')
        emit('response', {'message': 'Connected to server'})

    @socketio.on('disconnect')
    def handle_disconnect():
        print('Client disconnected')

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