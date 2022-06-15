const path = require('path');
const fs = require('fs');
const glob = require('glob');

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
      // TODO Should we warn if sprites don't exist?
      return ctx.spriteDetails[spriteName] !== undefined;
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
  let pngName = path.basename(files[0], '.png');
  let spriteName = pngName.split('-')[0];

  let spritePaths = getSpritePaths(ctx, spriteName);
  compareAndCopy(
    files[0],
    spritePaths.img,
    spritePaths.layer,
    spriteName,
    observer
  );
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

  files.forEach((f, i) => {
    let spritePaths = getSpritePaths(ctx, spriteName, i);
    compareAndCopy(
      f,
      spritePaths.img,
      spritePaths.layer,
      spriteName,
      observer
    );
  })
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