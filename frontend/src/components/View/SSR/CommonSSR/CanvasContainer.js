import React, { useEffect, useRef, createRef, useState } from 'react';

const CanvasContainer = ({
  width,
  height,
  mainImage,
  nnImages,
  nnCanvasLocation,
}) => {
  const [mainCanvasImage, setMainCanvasImage] = useState(mainImage);
  const mainCanvasRef = useRef(null);
  const nnImagesCanvasRef = useRef([useRef(null), useRef(null), useRef(null)]);
  const [isZoomedIn, setIsZoomedIn] = useState(false);
  const zoomScale = 2;

  useEffect(() => {
    if (mainImage && mainCanvasRef.current) {
      const canvas = mainCanvasRef.current;
      const context = canvas.getContext('2d');
      const image = new Image();
      image.onload = () => {
        context.clearRect(0, 0, canvas.width, canvas.height);
        context.drawImage(image, 0, 0, canvas.width, canvas.height);
      };
      image.src = `data:image/jpeg;base64,${mainImage}`;
      setMainCanvasImage(mainImage);
    }
  }, [mainImage]);

  useEffect(() => {
    const canvas = mainCanvasRef.current;
    if (canvas) {
      const zoomInImage = (event) => {
        const context = canvas.getContext('2d');
        if (isZoomedIn) {
          // Zoom-out
          const image = new Image();
          image.onload = () => {
            context.clearRect(0, 0, canvas.width, canvas.height);
            context.drawImage(image, 0, 0, canvas.width, canvas.height);
          };
          image.src = `data:image/jpeg;base64,${mainCanvasImage}`;
        } else {
          // Zoom-in
          const rect = canvas.getBoundingClientRect();

          // Scale ratio between actual canvas size and displayed size
          const scaleX = canvas.width / rect.width;
          const scaleY = canvas.height / rect.height;

          // Adjust the mouse click position to match the actual canvas size
          const x = (event.clientX - rect.left) * scaleX;
          const y = (event.clientY - rect.top) * scaleY;

          const image = new Image();
          image.onload = () => {
            context.clearRect(0, 0, canvas.width, canvas.height);

            // Information for Previous Images
            const previousImageWidth = image.width;
            const previousImageHeight = image.height;

            // Calculate sx, sy considering the resolution of the image to be drawn on the canvas
            const sx =
              (x - canvas.width / (2 * zoomScale)) *
              (previousImageWidth / canvas.width);
            const sy =
              (y - canvas.height / (2 * zoomScale)) *
              (previousImageHeight / canvas.height);

            // Calculate the width and height of the image to be drawn on the canvas
            const sWidth =
              (canvas.width / zoomScale) * (previousImageWidth / canvas.width);
            const sHeight =
              (canvas.height / zoomScale) *
              (previousImageHeight / canvas.height);

            // Draw the image enlarged on the canvas
            context.drawImage(
              image,
              sx,
              sy,
              sWidth,
              sHeight,
              0,
              0,
              canvas.width,
              canvas.height,
            );
          };
          image.src = `data:image/jpeg;base64,${mainCanvasImage}`;
        }
        setIsZoomedIn(!isZoomedIn);
        console.log(isZoomedIn);
      };

      canvas.addEventListener('dblclick', zoomInImage);

      return () => {
        canvas.removeEventListener('dblclick', zoomInImage);
      };
    }
  }, [isZoomedIn, mainCanvasImage]); // Added to the dependency array

  // Hand a nnImages Canvas
  useEffect(() => {
    nnImagesCanvasRef.current.forEach((ref, index) => {
      const canvas = ref.current;
      if (canvas && nnImages[index]) {
        const context = canvas.getContext('2d');
        const image = new Image();
        image.onload = () => {
          context.clearRect(0, 0, canvas.width, canvas.height);
          context.drawImage(image, 0, 0, canvas.width, canvas.height);
        };
        image.src = `data:image/jpeg;base64,${nnImages[index]}`;
      }
    });
  }, [nnImages]);

  useEffect(() => {
    nnImagesCanvasRef.current = nnImages.map(
      (_, i) => nnImagesCanvasRef.current[i] || createRef(),
    );

    // Function to add click event listeners
    const addNnImageCanvasClickListener = (canvas, index) => {
      const copyImageToMainCanvas = () => {
        const mainCanvas = mainCanvasRef.current;
        const context = mainCanvas.getContext('2d');
        const image = new Image();
        image.onload = () => {
          context.clearRect(0, 0, mainCanvas.width, mainCanvas.height);
          context.drawImage(image, 0, 0, mainCanvas.width, mainCanvas.height);
        };
        image.src = `data:image/jpeg;base64,${nnImages[index]}`;
        setMainCanvasImage(nnImages[index]);
      };
      canvas.addEventListener('click', copyImageToMainCanvas);
      // // Return the reference to the event listener.
      return copyImageToMainCanvas;
    };

    // Array to store previous event listeners
    const removeListeners = [];

    // Add event listeners to all canvases
    nnImagesCanvasRef.current.forEach((ref, index) => {
      const canvas = ref.current;
      if (canvas) {
        const removeListener = addNnImageCanvasClickListener(canvas, index);
        removeListeners.push(() =>
          canvas.removeEventListener('click', removeListener),
        );
      }
    });

    // Remove event listeners when the component is unmounted.
    return () => {
      removeListeners.forEach((remove) => remove());
    };
  }, [nnImages]); // Run this logic whenever nnImages is changed.

  return (
    <div className="viewer-container">
      {nnCanvasLocation === 'right' ? (
        <>
          <div className="viewport-container">
            <canvas
              ref={mainCanvasRef}
              id="mainCanvas"
              width={width}
              height={height}
            ></canvas>
          </div>
          <div className="closest-imgs-container">
            {nnImagesCanvasRef.current.map((ref, index) => (
              <canvas
                key={index}
                ref={ref}
                id={`nnImg_${index + 1}`}
                width={width / 3}
                height={height / 3}
              ></canvas>
            ))}
          </div>
        </>
      ) : (
        <>
          <div className="closest-imgs-container">
            {nnImagesCanvasRef.current.map((ref, index) => (
              <canvas
                key={index}
                ref={ref}
                id={`nnImg_${index + 1}`}
                width={width / 3}
                height={height / 3}
              ></canvas>
            ))}
          </div>
          <div className="viewport-container">
            <canvas
              ref={mainCanvasRef}
              id="mainCanvas"
              width={width}
              height={height}
            ></canvas>
          </div>
        </>
      )}
    </div>
  );
};

export default CanvasContainer;
