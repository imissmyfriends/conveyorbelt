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
    };
  }
}

module.exports = collectSpriteData;