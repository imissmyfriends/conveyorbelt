const path = require('path');
const fs = require('fs');
const glob = require('glob');

// Getting Aseprite files
function findGMSSpriteFromAseprite(filePath, ctx, observer) {
  let dir = path.dirname(filePath);
  let globMatch = getPNGGlobFromAseprite(filePath, ctx);
  glob(globMatch, function (error, files) {
    if (error) observer.next(error);

    // TODO Explain the roundabout ping pong method of doing things
    // and why we are doing them this way

    // How to find things from Aseprite vs Sprite

    let affectedSprites = getAffectedSprites(files);

    // TODO Check if these sprites exist in GMS 
    observer.next(affectedSprites);

    affectedSprites.forEach((spriteName) => {
      getPNGsForSprite(spriteName, dir).then((pngs)=> {
        observer.next(pngs);
        if (pngs.length == 1) {
          importSingleGMSSprite(pngs, ctx, observer);
        } else {
          observer.next(pngs);
        }
      });
    });

    //console.log(files);
    //observer.next(globMatch);
    //observer.next(files[0]);
  });
}
module.exports = findGMSSpriteFromAseprite;

function getPNGsForSprite(spriteName, dir) {
  var promise = new Promise((resolve, reject) => {
    glob(`${dir}/${spriteName}-*.png`, (error, pngs) => {
      if (error) reject(error);
      resolve(pngs);
    })
  });
  return promise;
}

// This function might return more than what is affected
// but we check for difference before making changes to GMS anyway
// So its ok
function getAffectedSprites(files) {
  files = files.map((file) => {
    return path.basename(file,'.png');
  });
  files = files.map((file) => {
    return file.split('-')[0];
  });
  files = files.filter(onlyUnique); 
  return files;
}

function getPNGGlobFromAseprite(filePath, ctx) {
  let name = path.basename(filePath, '.aseprite');
  let dir = path.dirname(filePath);
  return `${dir}/${ctx.PREFIX}${name}*.png`;
}

function onlyUnique(value, index, self) {
  return self.indexOf(value) === index;
}

function importSingleGMSSprite(files, ctx, observer) {
  // Get sprite name
  let dir = path.dirname(files[0]);
  let pngName = path.basename(files[0], '.png');
  let pngPath = dir + `/` + pngName + '.png';
  let spriteName = pngName.split('-')[0];

  let spritePaths = getSpritePaths(ctx, spriteName);

  compareAndCopy(
    pngPath,
    spritePaths.img,
    spritePaths.layer,
    spriteName,
    observer
  );
}

function getSpritePaths(ctx, spriteName) {
  let imgName = ctx.spriteDetails[spriteName].imgName;
  let imgPath = [
    ctx.SPRITES_DIR,
    spriteName, '/',
    imgName, '.png'
  ].join('');
  let layerImgName = ctx.spriteDetails[spriteName].layerName;
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

function copyFiles(from, to, spriteName, observer) {
  fs.copyFile(from, to, (error) => {
    if (error) throw new Error(error);
    observer.next('Updated in GMS: ' + spriteName);
  });
}