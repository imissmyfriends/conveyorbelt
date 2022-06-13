/**
 * Gets the image and layer name details from a sprite.
 *
 * @params {Object} sprite - Parsed sprite data
 * @returns {Object} Object with `imgName(s)` and `layerName(s)`
 */
 function getSpriteDetails(sprite) {
    if (sprite.frames.length === 1 ) {
      return {
        imgName: sprite.frames[0].compositeImage.FrameId.name,
        layerName: sprite.layers[0].name
      };
    } else {
      var imgNames = sprite.frames.map(frame => {
        return frame.compositeImage.FrameId.name;
      });
  
      return {
        imgNames,
        layerName: sprite.layers[0].name
      }
    }
  }

  module.exports = getSpriteDetails;