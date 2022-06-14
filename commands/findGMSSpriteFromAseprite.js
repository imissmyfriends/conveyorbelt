const path = require('path');
const fs = require('fs');
var glob = require("glob");

// Getting Aseprite files
function findGMSSpriteFromAseprite(filePath, ctx, observer) {
  let name = path.basename(filePath, '.aseprite');
  let dir = path.dirname(filePath);
  let globMatch = dir + '/' + ctx.PREFIX + name + '-*.png';
  glob(globMatch, function (error, files) {
    if (files.length === 1) { // Single sprite
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
    } else { // Animation
    }
    //console.log(files);
    //observer.next(globMatch);
    //observer.next(files[0]);
  });
}

module.exports = findGMSSpriteFromAseprite;
