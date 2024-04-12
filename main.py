from backend.app import create_app

import os

app, socketio = create_app()

def main():
    host = os.getenv('GS_HOST', '127.0.0.1')
    debug = os.getenv('GS_DEBUG', 'false').lower() == 'true'
    socketio.run(app, host=host, debug=debug, allow_unsafe_werkzeug=True)

if __name__ == '__main__':
    main()