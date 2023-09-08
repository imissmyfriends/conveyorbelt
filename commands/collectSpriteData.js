const Listr = require('listr');
const fs = require('fs');

// SPRITES
/**
* Collects sprites data for all the `files` in `ctx` and puts
* it in `spriteDetails`.
*
* @param ctx
* @returns {Listr}
*/
function collectSpriteData(ctx) {
  ctx.spriteDetails = {};
  var subTasks = ctx.files.map(file => {
    return {
      title: `Looking up ${file}...`,
      task: function (ctx, task) {
        return getSpriteReader(ctx, file);
      }
    };
  });
  return new Listr(subTasks);
}

/**
* Reads the sprite file, parses it, gets its details and puts them
* in the `ctx`
*
* @param ctx
* @param file - to be read
* @returns {Promise}
*/
function getSpriteReader(ctx, file) {
  var readSprite = new Promise((resolve, reject) => {
    fs.readFile(file, 'utf8', (err, json) => {
      if (err) {
        reject(new Error(`Error reading file from disk: ${err}`));
      } else {
        var sprite = parseSpriteJSON(json);
        ctx.spriteDetails[sprite.name] = getSpriteDetails(sprite);
        ctx.spriteDetails[sprite.name]["file"] = file;
        ctx.spriteDetails[sprite.name]["name"] = sprite.name;
        resolve(ctx);
      }
    });
  });
  return readSprite;
}

/**
* Parses the `yy` JSON format and returns it
*
* @params {string} json - JSON of the yy file
* @returns {Object}
*/
function parseSpriteJSON(json) {
  // Remove trailing commas
  let regex = /\,(?!\s*?[\{\[\"\'\w])/g;
  let correctData = json.replace(regex, '');

  // parse JSON string to JSON object
  return JSON.parse(correctData);
}

/**
* Gets the image and layer name details from a sprite.
*
* @params {Object} sprite - Parsed sprite data
* @returns {Object} Object with `imgName(s)` and `layerName(s)`
*/
function getSpriteDetails(sprite) {
  if (sprite.frames.length === 1) {
    return {
      imgName: sprite.frames[0].name,
      layerName: sprite.layers[0].name,
      size: getSpriteSize(sprite),
      defaultBbox: hasDefaultBoundingBox(sprite)
    };
  } else {
    var imgNames = sprite.frames.map(frame => {
      return frame.name;
    });

    return {
      imgNames,
      layerName: sprite.layers[0].name,
      size: getSpriteSize(sprite),
      defaultBbox: hasDefaultBoundingBox(sprite)
    };
  }
}

/**
 * Checks if the sprite has a default bounding box
 * 
 * @param {Object} sprite 
 * @returns {Boolean}
 */
function hasDefaultBoundingBox(sprite){
  if (
    sprite.bbox_left === 0 &&
    sprite.bbox_top === 0 &&
    sprite.bbox_right === sprite.width - 1 &&
    sprite.bbox_bottom === sprite.height - 1
  ) {
    return true;
  }
    return false;
}


/**
 * Size and bounding box data from the sprite
 * 
 * @param {Object} sprite 
 * @returns {Object}
 */
function getSpriteSize(sprite) {
  var size = {};
  size.width = sprite.width;
  size.height = sprite.height;
  size.bbox = {
    left: sprite.bbox_left,
    right: sprite.bbox_right,
    top: sprite.bbox_top,
    bottom: sprite.bbox_bottom,
  }
  return size;
}

module.exports = collectSpriteData;