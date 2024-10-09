import { parseGIF, decompressFrames } from "gifuct-js";

export const gifToSprite = async (gif, maxWidth, maxHeight, maxDuration) => {
  let arrayBuffer;
  let error;
  let frames;

  if (gif.type) {
    const reader = new FileReader();
    try {
      arrayBuffer = await new Promise((resolve, reject) => {
        reader.onload = () => resolve(reader.result);
        reader.onerror = () => reject(reader.error);
        reader.readAsArrayBuffer(gif);
      });
    } catch (err) {
      error = err;
    }
  } else {
    try {
      arrayBuffer = await fetch(gif).then((resp) => resp.arrayBuffer());
    } catch (err) {
      error = err;
    }
  }

  if (!error) frames = decompressFrames(parseGIF(arrayBuffer), true);
  if (!error && (!frames || !frames.length)) error = "No_frame_error";
  if (error) {
    console.error(error);
    return { error };
  }

  const dataCanvas = document.createElement("canvas");
  const dataCtx = dataCanvas.getContext("2d");
  const frameCanvas = document.createElement("canvas");
  const frameCtx = frameCanvas.getContext("2d");
  const spriteCanvas = document.createElement("canvas");
  const spriteCtx = spriteCanvas.getContext("2d");

  let [width, height, delay] = [
    frames[0].dims.width,
    frames[0].dims.height,
    frames.reduce((acc, cur) => (acc = !acc ? cur.delay : acc), null)
  ];

  const duration = frames.length * delay;
  maxDuration = maxDuration || duration;
  if (duration > maxDuration) frames.splice(Math.ceil(maxDuration / delay));

  maxWidth = maxWidth || width;
  maxHeight = maxHeight || height;
  const scale = Math.min(maxWidth / width, maxHeight / height);
  width = width * scale;
  height = height * scale;

  frameCanvas.width = width;
  frameCanvas.height = height;
  spriteCanvas.width = width * frames.length;
  spriteCanvas.height = height;

  frames.forEach((frame, i) => {
    const frameImageData = dataCtx.createImageData(
      frame.dims.width,
      frame.dims.height
    );
    frameImageData.data.set(frame.patch);
    dataCanvas.width = frame.dims.width;
    dataCanvas.height = frame.dims.height;
    dataCtx.putImageData(frameImageData, 0, 0);

    if (frame.disposalType === 2) frameCtx.clearRect(0, 0, width, height);
    frameCtx.drawImage(
      dataCanvas,
      frame.dims.left * scale,
      frame.dims.top * scale,
      frame.dims.width * scale,
      frame.dims.height * scale
    );

    spriteCtx.drawImage(frameCanvas, width * i, 0);
  });

  const dataUrl = spriteCanvas.toDataURL();

  dataCanvas.remove();
  frameCanvas.remove();
  spriteCanvas.remove();

  return {
    dataUrl,
    frameWidth: width,
    framesLength: frames.length,
    delay
  };
};