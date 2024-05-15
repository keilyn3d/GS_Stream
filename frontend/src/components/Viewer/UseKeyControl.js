import { useEffect, useRef } from 'react';

export const useKeyControl = (step, lastKeyPressedTime, socketRef) => {
  const keysPressed = useRef({});
  const allowedKeys = [
    'q',
    'e',
    'a',
    'w',
    's',
    'd',
    'u',
    'o',
    'i',
    'j',
    'k',
    'l',
    ' ',
  ];

  useEffect(() => {
    const keyDownHandler = (event) => {
      if (!allowedKeys.includes(event.key)) return;
      keysPressed.current[event.key] = true;
      emitKeyControl();
    };

    const keyUpHandler = (event) => {
      if (!allowedKeys.includes(event.key)) return;
      keysPressed.current[event.key] = false;
      emitKeyControl();
    };

    const emitKeyControl = (event) => {
      const currentTime = new Date().getTime();
      if (currentTime - lastKeyPressedTime.current > 30) {
        lastKeyPressedTime.current = currentTime;
        if (socketRef.current) {
          const trueKeys = Object.keys(keysPressed.current).reduce(
            (result, key) => {
              if (keysPressed.current[key]) {
                result[key] = true;
              }
              return result;
            },
            {},
          );
          if (Object.keys(trueKeys).length > 0) {
            socketRef.current.emit('key_control', {
              key: trueKeys,
              step: step,
            });
          }
        }
      } else {
        console.log('Too many requests!');
      }
    };

    window.addEventListener('keydown', keyDownHandler, false);
    window.addEventListener('keyup', keyUpHandler, false);

    return () => {
      window.removeEventListener('keydown', keyDownHandler, false);
      window.removeEventListener('keyup', keyUpHandler, false);
    };
  }, [step]);
};
