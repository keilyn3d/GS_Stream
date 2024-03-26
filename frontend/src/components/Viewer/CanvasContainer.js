import React, { useEffect, useRef } from 'react';

const CanvasContainer = () => {
  const mainCanvasRef = useRef(null);
  const nnImgRefs = useRef([useRef(null), useRef(null), useRef(null)]);

  const copyImageToMainCanvas = (nnImgCanvas) => {
    const mainCanvas = mainCanvasRef.current;
    const mainCtx = mainCanvas.getContext('2d');

    // Draw the image from nnImgCanvas onto mainCanvas
    mainCtx.drawImage(nnImgCanvas, 0, 0, mainCanvas.width, mainCanvas.height);
  };

  useEffect(() => {
    nnImgRefs.current.forEach((ref, index) => {
      const nnImgCanvas = ref.current;

      const handleNnImgClick = () => {
        copyImageToMainCanvas(nnImgCanvas);
      };

      // Add a click event listener
      nnImgCanvas.addEventListener('click', handleNnImgClick);

      // Remove the event listener when the component unmounts
      return () => {
        nnImgCanvas.removeEventListener('click', handleNnImgClick);
      };
    });
  }, []);

  return (
    <div className="viewer-container">
      <div className="viewport-container">
        <canvas
          ref={mainCanvasRef}
          id="myCanvas"
          width="800"
          height="600"
        ></canvas>
      </div>
      <div className="closest-imgs-container">
        {nnImgRefs.current.map((ref, index) => (
          <canvas
            key={index}
            ref={ref}
            id={`nnImg_${index + 1}`}
            width="266"
            height="198"
          ></canvas>
        ))}
      </div>
    </div>
  );
};

export default CanvasContainer;
