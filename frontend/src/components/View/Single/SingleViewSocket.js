import { useEffect, useRef } from 'react';
import io from 'socket.io-client';

const useSocket = (
  userName,
  selectedModelId,
  { setMainImage, setNnImages, setElevation, setHeading },
) => {
  const socketRef = useRef(null);

  useEffect(() => {
    const backendAddress = process.env.REACT_APP_BACKEND_URL;
    if (!socketRef.current) {
      socketRef.current = io(backendAddress);
    }

    socketRef.current.on('connect', () => {
      socketRef.current.emit('set_user_data', {
        userName: userName,
        modelIds: [selectedModelId],
      });
      console.log('Connected to Socket.IO server');
      socketRef.current.emit('get_init_image', selectedModelId);
    });

    socketRef.current.on('response', (message) => {
      console.log('Received message from Socket.IO:', message);
    });

    socketRef.current.on('set_client_init_image', (data) => {
      console.log('Received init image');
      setMainImage(data.image);
    });

    socketRef.current.on('set_client_main_image', (data) => {
      console.log('Received main image');
      setMainImage(data.image);
    });

    socketRef.current.on('nnImg', (data) => {
      console.log('Received nnImages');
      const entries = Object.entries(data.images);
      setNnImages(entries.map(([, image]) => image));
    });

    socketRef.current.on('flight_params', (data) => {
      console.log('Received flight_params');
      setElevation(data.altitude);
      setHeading(data.heading);
    });

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
      console.log('Disconnected from Socket.IO server');
    };
  }, [
    userName,
    selectedModelId,
    setMainImage,
    setNnImages,
    setElevation,
    setHeading,
  ]);

  return {
    socketRef,
  };
};

export default useSocket;
