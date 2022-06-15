const path = require('path');
const fs = require('fs');
const glob = require('glob');

// Getting Aseprite files
function findGMSSpriteFromAseprite(filePath, ctx, observer) {
  let dir = path.dirname(filePath);
  let globMatch = getPNGGlobFromAseprite(filePath, ctx);
  glob(globMatch, function (error, files) {
    if (error) observer.next(error);
    let affectedSprites = getAffectedSprites(files);

    // Check if these sprites exist in GMS 
    observer.next(affectedSprites);

    affectedSprites.forEach((spriteName) => {
      getPNGsForSprite(spriteName, dir).then((pngs)=> {
        observer.next(pngs);
      });
    });

    //console.log(files);
    //observer.next(globMatch);
    //observer.next(files[0]);
  });
}

function getPNGsForSprite(spriteName, dir) {
  var promise = new Promise((resolve, reject) => {
    glob(`${dir}/${spriteName}*.png`, (error, pngs) => {
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

module.exports = findGMSSpriteFromAseprite;


function importSingleGMSSprite(files, ctx, observer) {
  let pngName = path.basename(files[0], '.png');
  let pngPath = dir + `/` + pngName + '.png';
  let spriteName = pngName.split('-')[0];
  let spriteImgName = ctx.spriteDetails[spriteName].imgName;
  let spriteImgPath = [
    ctx.SPRITES_DIR,
    spriteName, '/',
    spriteImgName, '.png'
  ].join('');
  let spriteLayerImgName = ctx.spriteDetails[spriteName].layerName;
  let spriteLayerImgPath = [
    ctx.SPRITES_DIR,
    spriteName, '/',
    'layers/',
    spriteImgName, '/',
    spriteLayerImgName, '.png'
  ].join('');

  var pngBuf = fs.readFileSync(pngPath);
  var gmsBuf = fs.readFileSync(spriteImgPath);
  if (pngBuf.equals(gmsBuf)) {
    observer.next('No change in: ' + spriteName);
  } else {
    fs.copyFile(pngPath, spriteImgPath, function (error) {
      if (error)
        throw new Error(error);
      observer.next('Updated in GMS: ' + spriteName);
    });
    fs.copyFile(pngPath, spriteLayerImgPath, function (error) {
      if (error)
        throw new Error(error);
      observer.next('Updated in GMS: ' + spriteName);
    });
  }
}