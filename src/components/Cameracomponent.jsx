import React, { useCallback, useRef, useState, useEffect } from 'react';
import Webcam from 'react-webcam';

const videoConstraints = {
  width: 400,
  height: 600,
  facingMode: 'user',
};

const SingleComponent = () => {
  const webcamRef = useRef(null);
  const displayCanvasRef = useRef(null);
  const imgRef = useRef(null);
  const [imgSrc, setImgSrc] = useState(null);
  const [points, setPoints] = useState([]);
  const [dragging, setDragging] = useState(-1);

  const capture = useCallback(() => {
    const imageSrc = webcamRef.current.getScreenshot();
    setImgSrc(imageSrc);
    setPoints([]);
  }, [webcamRef, setImgSrc]);

  const handleClick = (e) => {
    if (points.length < 4) {
      const rect = e.target.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      setPoints([...points, { x, y }]);
    }
  };

  const handleMouseDown = (index) => {
    setDragging(index);
  };

  const handleMouseUp = () => {
    setDragging(-1);
  };

  const handleMouseMove = (e) => {
    if (dragging !== -1) {
      const rect = displayCanvasRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const newPoints = [...points];
      newPoints[dragging] = { x, y };
      setPoints(newPoints);
    }
  };

  const drawImage = () => {
    const displayCanvas = displayCanvasRef.current;
    const ctx = displayCanvas.getContext('2d');
    const img = imgRef.current;
    displayCanvas.width = img.width;
    displayCanvas.height = img.height;
    ctx.drawImage(img, 0, 0, img.width, img.height);

    points.forEach((point, index) => {
      ctx.fillStyle = 'red';
      ctx.beginPath();
      ctx.arc(point.x, point.y, 10, 0, 2 * Math.PI); // Increase the radius to 10 for better visibility
      ctx.fill();
      ctx.strokeText(index + 1, point.x + 10, point.y + 10);
    });

    if (points.length === 4) {
      const [p1, p2, p3, p4] = points;
      ctx.strokeStyle = 'blue';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(p1.x, p1.y);
      ctx.lineTo(p2.x, p2.y);
      ctx.lineTo(p3.x, p3.y);
      ctx.lineTo(p4.x, p4.y);
      ctx.closePath();
      ctx.stroke();

      ctx.fillStyle = 'rgba(0, 0, 255, 0.3)';
      ctx.fill();
    }
  };

  const cropImage = () => {
    const displayCanvas = displayCanvasRef.current;
    const [p1, p2, p3, p4] = points;

    const croppedCanvas = document.createElement('canvas');
    const croppedCtx = croppedCanvas.getContext('2d');

    const width = Math.max(p1.x, p2.x, p3.x, p4.x) - Math.min(p1.x, p2.x, p3.x, p4.x);
    const height = Math.max(p1.y, p2.y, p3.y, p4.y) - Math.min(p1.y, p2.y, p3.y, p4.y);
    croppedCanvas.width = width;
    croppedCanvas.height = height;

    croppedCtx.save();
    croppedCtx.beginPath();
    croppedCtx.moveTo(p1.x - Math.min(p1.x, p2.x, p3.x, p4.x), p1.y - Math.min(p1.y, p2.y, p3.y, p4.y));
    croppedCtx.lineTo(p2.x - Math.min(p1.x, p2.x, p3.x, p4.x), p2.y - Math.min(p1.y, p2.y, p3.y, p4.y));
    croppedCtx.lineTo(p3.x - Math.min(p1.x, p2.x, p3.x, p4.x), p3.y - Math.min(p1.y, p2.y, p3.y, p4.y));
    croppedCtx.lineTo(p4.x - Math.min(p1.x, p2.x, p3.x, p4.x), p4.y - Math.min(p1.y, p2.y, p3.y, p4.y));
    croppedCtx.closePath();
    croppedCtx.clip();

    croppedCtx.drawImage(
      displayCanvas,
      Math.min(p1.x, p2.x, p3.x, p4.x),
      Math.min(p1.y, p2.y, p3.y, p4.y),
      width,
      height,
      0,
      0,
      width,
      height
    );

    croppedCtx.restore();

    croppedCanvas.toBlob((blob) => {
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'cropped-image.jpg';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    });
  };

  useEffect(() => {
    if (imgSrc) {
      drawImage();
    }
  }, [imgSrc, points]);

  return (
    <>
      <Webcam
        audio={false}
        ref={webcamRef}
        screenshotFormat="image/jpeg"
        videoConstraints={videoConstraints}
        minScreenshotWidth={400}
        minScreenshotHeight={600}
      />
      <button onClick={capture}>Capture Photo</button>
      {imgSrc && (
        <>
          <img
            ref={imgRef}
            src={imgSrc}
            alt="Captured"
            style={{ display: 'none' }}
            onLoad={drawImage}
          />
          <canvas
            ref={displayCanvasRef}
            onClick={handleClick}
            onMouseDown={(e) => handleMouseDown(points.findIndex(point => Math.hypot(point.x - (e.clientX - e.target.getBoundingClientRect().left), point.y - (e.clientY - e.target.getBoundingClientRect().top)) < 15))} // Increase the hit area radius to 15
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            style={{ border: '1px solid black' }}
          />
          {points.length === 4 && <button onClick={cropImage}>Crop Image</button>}
        </>
      )}
    </>
  );
};

export default SingleComponent;
