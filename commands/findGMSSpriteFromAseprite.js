const path = require('path');
const fs = require('fs');
const glob = require('glob');
const sizeOf = require('image-size');
const replace = require('replace-in-file');
const { red, yellow } = require('kleur');

/**
 * Take the Aseprite filename and find all PNGs that start with 
 * that name. This will include somethings that might not have been 
 * affected (for eg UIBubble and UIBubblePointer). For each of the 
 * PNGs we'll get all the frames. Even if it is a single frame it'll
 * still be `-001.png`. Then based on this list of PNGs find all 
 * possible GMS sprites. See if these sprites actually exist and 
 * then update those.
 * 
 * @param {String} filePath - path to Aseprite file
 * @param {Object} ctx 
 * @param {Object} observer 
 */
function findGMSSpriteFromAseprite(filePath, ctx, observer) {
  let dir = path.dirname(filePath);
  let globMatch = getPNGGlobFromAseprite(filePath, ctx);
  glob(globMatch, function (error, files) {
    if (error) observer.next(error);

    let affectedSprites = getAffectedSprites(files);
    affectedSprites = affectedSprites.filter(spriteName => {
      if (ctx.spriteDetails[spriteName] !== undefined) return true;
      console.log(yellow(`WARNING: ${spriteName} not found. Re-run conveyorbelt?`));
      return false;
    });

    affectedSprites.forEach((spriteName) => {
      getPNGsForSprite(spriteName, dir).then((pngs)=> {
        observer.next(pngs);
        if (pngs.length == 1) {
          importSingleGMSSprite(pngs, ctx, observer);
        } else {
          importAnimationGMSSprite(pngs, ctx, observer);
        }
      });
    });
  });
}
module.exports = findGMSSpriteFromAseprite;

/**
 * Find all PNGs that could be associated with a sprite (inside a gived folder)
 * This is done by appending a `-` to the name and finding all PNGs. This returns
 * all frames in the case of animations and just one file for other kinds of 
 * sprites.
 * 
 * @param {string} spriteName 
 * @param {string} dir 
 * @returns {Promise}
 */
function getPNGsForSprite(spriteName, dir) {
  var promise = new Promise((resolve, reject) => {
    glob(`${dir}/${spriteName}-*.png`, (error, pngs) => {
      if (error) reject(error);
      resolve(pngs);
    })
  });
  return promise;
}

/**
 * Creates a list of sprites (whether existing or not) that would
 * need updating. This is done solely on the basis of that every PNG
 * would have a corresponding sprite.
 * 
 * @param {Array} files - list of PNG files
 * @returns {Array} - list of sprites that might need updating
 */
function getAffectedSprites(files) {
  files = files.map((file) => {
    return path.basename(file,'.png');
  });
  files = files.map((file) => {
    return file.split('-')[0];
  });
  let sprites = files.filter(onlyUnique); 
  return sprites;
}

/**
 * Returns a glob to find PNG files that were created by this aseprite file.
 * If the name of the aseprite file is a prefix for other files (for eg UIBubble
 * and UIBubblePointer) then both will be matched.
 * 
 * @param {String} filePath - path to asperite file
 * @param {Object} ctx 
 * @returns {String} Glob for matching PNG files
 */
function getPNGGlobFromAseprite(filePath, ctx) {
  let name = path.basename(filePath, '.aseprite');
  let dir = path.dirname(filePath);
  return `${dir}/${ctx.PREFIX}${name}*.png`;
}

/**
 * Array filter to return only unique values
 */
function onlyUnique(value, index, self) {
  return self.indexOf(value) === index;
}

/**
 * Imports a single PNG file into GMS
 * 
 * @param {Array} files - array contaiting a single filePath
 * @param {Object} ctx 
 * @param {Object} observer 
 */
function importSingleGMSSprite(files, ctx, observer) {
  var pngFile = files[0];
  let pngName = path.basename(pngFile, '.png');
  let spriteName = pngName.split('-')[0];
  var spriteDetails = ctx.spriteDetails[spriteName];

  let spritePaths = getSpritePaths(ctx, spriteName);
  compareAndCopy(
    pngFile,
    spritePaths.img,
    spritePaths.layer,
    spriteName,
    observer
  );

  if (hasSizeChanged(pngFile, spriteDetails)) {
    updateDimensionsInYY(pngFile, spriteDetails, ctx);
  }
}

/**
 * Imports an array of animation PNG file into GMS
 * 
 * @param {Array} files - array contaiting a PNG filePaths
 * @param {Object} ctx 
 * @param {Object} observer 
 */
function importAnimationGMSSprite(files, ctx, observer) {
  let pngName = path.basename(files[0], '.png');
  let spriteName = pngName.split('-')[0];
  var spriteDetails = ctx.spriteDetails[spriteName];

  files.forEach((f, i) => {
    let spritePaths = getSpritePaths(ctx, spriteName, i);
    compareAndCopy(
      f,
      spritePaths.img,
      spritePaths.layer,
      spriteName,
      observer
    );
  });

   if (hasSizeChanged(files[0], spriteDetails)) {
    updateDimensionsInYY(files[0], spriteDetails, ctx);
  }   
}

/**
 * Given the spriteName and optionally and index, this function looks up the 
 * spriteDetails context and returns the path of the image and layer PNGs that
 * need to be updated
 * 
 * @param {Object} ctx 
 * @param {String} spriteName 
 * @param {Number} index 
 * @returns {Object}
 */
function getSpritePaths(ctx, spriteName, index) {
  var imgName, layerImgName;
  if (index == undefined) {
    imgName = ctx.spriteDetails[spriteName].imgName;
    layerImgName = ctx.spriteDetails[spriteName].layerName;
  } else {
    imgName = ctx.spriteDetails[spriteName].imgNames[index];
    layerImgName = ctx.spriteDetails[spriteName].layerName;
  }

  let imgPath = [
    ctx.SPRITES_DIR,
    spriteName, '/',
    imgName, '.png'
  ].join('');
  let layerImgPath = [
    ctx.SPRITES_DIR,
    spriteName, '/',
    'layers/',
    imgName, '/',
    layerImgName, '.png'
  ].join('');
  return {
    img: imgPath,
    layer: layerImgPath
  }
}

/**
 * Compares to PNGs and if they aren't the same copies the Aseprite export
 * into GMS
 */
function compareAndCopy(pngPath, spriteImgPath, spriteLayerImgPath, spriteName, observer) {
  var pngBuf = fs.readFileSync(pngPath);
  var gmsBuf = fs.readFileSync(spriteImgPath);

  if (pngBuf.equals(gmsBuf)) {
    // observer.next('No change in: ' + spriteName);
  } else {
    copyFiles(pngPath, spriteImgPath, spriteName, observer);
    copyFiles(pngPath, spriteLayerImgPath, spriteName, observer);
  }
}

/**
 * Copies file to location and sends an update on the observer.
 */
function copyFiles(from, to, spriteName, observer) {
  fs.copyFile(from, to, (error) => {
    if (error) throw new Error(error);
    observer.next('Updated in GMS: ' + spriteName);
  });
}

/**
 * Checks if the PNG provided is a different size from the sprite.
 * Checks against the sprite data that was first collected initially.
 */
function hasSizeChanged(pngFile, sprite) {
  const pngSize = sizeOf(pngFile);
  const spriteSize = sprite.size;
  if(
    pngSize.height === spriteSize.height &&
    pngSize.width === spriteSize.width
  ) {
    return false;
  }
  return true;
}

/**
 * Updates the dimensions of the sprite in the YY file along with its
 * bounding box values.
 */
function updateDimensionsInYY(pngFile, sprite, ctx) {
  const pngSize = sizeOf(pngFile);

  // Fix YY file
  changeValueInYY(sprite.file, 'width', sprite.size.width, pngSize.width);
  changeValueInYY(sprite.file, 'height', sprite.size.height, pngSize.height);

  // Update the context
  ctx.spriteDetails[sprite.name].size.width = pngSize.width;
  ctx.spriteDetails[sprite.name].size.height = pngSize.height;

  // Check if has default BBOX
  if (sprite.defaultBbox) {
      changeValueInYY(sprite.file, 'bbox_right', sprite.size.bbox.right, pngSize.width - 1 );
      changeValueInYY(sprite.file, 'bbox_bottom', sprite.size.bbox.bottom, pngSize.height - 1 );

      ctx.spriteDetails[sprite.name].size.bbox.right = pngSize.width - 1;
      ctx.spriteDetails[sprite.name].size.bbox.bottom = pngSize.height - 1;
  } else {
    console.log(red(`WARNING: Size of ${sprite.name} was updated but the bbox was not `));
  }
}

/**
 * Given a YY file, an old and new value, updates that key. Doesn't do any JSON
 * Just replaces a string.
 */
function changeValueInYY(file, valueName, oldValue, newValue) {
  const from = new RegExp(`"${valueName}": ${oldValue},`, 'g')
  const to = `"${valueName}": ${newValue},`;

  return replace.sync({
    files: file,
    from: from,
    to: to
  });
}