import { fabric } from "fabric";
import { gifToSprite } from "./gifToSprite";

const [PLAY, PAUSE, STOP] = [0, 1, 2];

export const fabricGif = async (gif, maxWidth, maxHeight, maxDuration) => {
  const { error, dataUrl, delay, frameWidth, framesLength } = await gifToSprite(
    gif,
    maxWidth,
    maxHeight,
    maxDuration
  );
  if (error) return { error };

  return new Promise((resolve) => {
    fabric.Image.fromURL(dataUrl, (img) => {
      const sprite = img.getElement();
      let framesIndex = 0;
      let start = performance.now();
      let status;

      img.width = frameWidth;
      img.height = sprite.naturalHeight;
      img.mode = "image";
      img.top = 200;
      img.left = 200;

      img.isGif = true;
      img.gifSrc = gif;

      img._render = function (ctx) {
        if (status === PAUSE || (status === STOP && framesIndex === 0)) return;
        const now = performance.now();
        const delta = now - start;
        if (delta > delay) {
          start = now;
          framesIndex++;
        }
        if (framesIndex === framesLength || status === STOP) framesIndex = 0;
        ctx.drawImage(
          sprite,
          frameWidth * framesIndex,
          0,
          frameWidth,
          sprite.height,
          -this.width / 2,
          -this.height / 2,
          frameWidth,
          sprite.height
        );
      };

      img.play = function () {
        status = PLAY;
        this.dirty = true;
      };

      img.pause = function () {
        status = PAUSE;
        this.dirty = false;
      };

      img.stop = function () {
        status = STOP;
        this.dirty = false;
      };

      img.getStatus = () => ["Playing", "Paused", "Stopped"][status];

      img.play();
      resolve(img);
    });
  });
};